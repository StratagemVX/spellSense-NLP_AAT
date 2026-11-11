import asyncio
import json
import sys
import unittest
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.main import DEFAULT_CORS_ORIGINS, app, parse_cors_origins  # noqa: E402


async def call_asgi(
    method: str,
    path: str,
    body: dict | None = None,
    headers: dict[str, str] | None = None,
    ignore_server_exception: bool = False,
):
    raw_body = json.dumps(body).encode("utf-8") if body is not None else b""
    raw_headers = [(b"content-type", b"application/json")]
    for k, v in (headers or {}).items():
        raw_headers.append((k.lower().encode("latin-1"), v.encode("latin-1")))

    scope = {
        "type": "http",
        "asgi": {"version": "3.0"},
        "http_version": "1.1",
        "method": method,
        "scheme": "http",
        "path": path,
        "raw_path": path.encode("ascii"),
        "query_string": b"",
        "headers": raw_headers,
        "client": ("127.0.0.1", 12345),
        "server": ("testserver", 80),
    }

    sent_once = False
    messages = []

    async def receive():
        nonlocal sent_once
        if not sent_once:
            sent_once = True
            return {"type": "http.request", "body": raw_body, "more_body": False}
        return {"type": "http.disconnect"}

    async def send(message):
        messages.append(message)

    try:
        await app(scope, receive, send)
    except Exception:
        if not ignore_server_exception:
            raise

    start_msg = next(m for m in messages if m["type"] == "http.response.start")
    resp_body = b"".join(m.get("body", b"") for m in messages if m["type"] == "http.response.body")
    resp_headers = {k.decode("latin-1").lower(): v.decode("latin-1") for k, v in start_msg["headers"]}
    return start_msg["status"], resp_headers, resp_body.decode("utf-8")


class SpellSenseSecurityTests(unittest.TestCase):
    def test_cors_origin_parsing_rejects_wildcard(self):
        self.assertEqual(parse_cors_origins(None), DEFAULT_CORS_ORIGINS)
        self.assertEqual(
            parse_cors_origins("https://app.example.com/, http://localhost:5173"),
            ["https://app.example.com", "http://localhost:5173"],
        )
        with self.assertRaises(ValueError):
            parse_cors_origins("*")
        with self.assertRaises(ValueError):
            parse_cors_origins("ftp://bad.example.com")

    def test_health_and_security_headers(self):
        status, headers, body = asyncio.run(call_asgi("GET", "/api/health"))
        self.assertEqual(status, 200)
        self.assertEqual(headers.get("x-content-type-options"), "nosniff")
        self.assertEqual(headers.get("x-frame-options"), "DENY")
        self.assertEqual(headers.get("referrer-policy"), "no-referrer")
        self.assertIn("status", json.loads(body))

    def test_cors_blocks_unlisted_origin_and_allows_dev_origin(self):
        status_allowed, headers_allowed, _ = asyncio.run(
            call_asgi("GET", "/api/health", headers={"Origin": "http://localhost:5173"})
        )
        self.assertEqual(status_allowed, 200)
        self.assertEqual(headers_allowed.get("access-control-allow-origin"), "http://localhost:5173")

        status_blocked, headers_blocked, _ = asyncio.run(
            call_asgi("GET", "/api/health", headers={"Origin": "https://evil.example"})
        )
        self.assertEqual(status_blocked, 200)
        self.assertNotIn("access-control-allow-origin", headers_blocked)

    def test_correct_endpoint_fixes_spelling(self):
        status, _, body = asyncio.run(
            call_asgi("POST", "/api/correct", body={"text": "speling", "algorithm": "symspell"})
        )
        self.assertEqual(status, 200)
        payload = json.loads(body)
        self.assertEqual(payload["symspell_result"], "spelling")
        self.assertEqual(payload["recommended_result"], "spelling")

    def test_unhandled_exception_does_not_leak_internal_details(self):
        @app.get("/_test_boom")
        def boom():
            raise RuntimeError("sensitive internal stack token")

        try:
            status, _, body = asyncio.run(
                call_asgi("GET", "/_test_boom", ignore_server_exception=True)
            )
        finally:
            app.router.routes = [r for r in app.router.routes if getattr(r, "path", None) != "/_test_boom"]

        self.assertEqual(status, 500)
        data = json.loads(body)
        self.assertEqual(data, {"detail": "An unexpected error occurred during NLP processing."})
        self.assertNotIn("RuntimeError", body)
        self.assertNotIn("sensitive internal stack token", body)


if __name__ == "__main__":
    unittest.main()
