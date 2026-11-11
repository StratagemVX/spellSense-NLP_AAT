import logging
import os
from urllib.parse import urlparse

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.endpoints import router as api_router

logger = logging.getLogger(__name__)

DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]


def parse_cors_origins(raw_value: str | None) -> list[str]:
    """Parse explicit CORS origins from env, rejecting wildcard entries."""
    if raw_value is None or not raw_value.strip():
        return list(DEFAULT_CORS_ORIGINS)

    origins: list[str] = []
    for entry in raw_value.split(","):
        origin = entry.strip().rstrip("/")
        if not origin:
            continue
        if origin == "*":
            raise ValueError("Wildcard '*' is not allowed in CORS_ALLOWED_ORIGINS")
        parsed = urlparse(origin)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError(f"Invalid CORS origin: {origin}")
        normalized = f"{parsed.scheme}://{parsed.netloc}"
        if normalized not in origins:
            origins.append(normalized)
    return origins


app = FastAPI(
    title="SpellSense NLP API",
    description="Professional NLP Spelling Correction Service powered by TextBlob and SymSpell.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=parse_cors_origins(os.getenv("CORS_ALLOWED_ORIGINS")),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error during NLP request processing")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred during NLP processing."},
    )


# Include API routes under /api
app.include_router(api_router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "SpellSense NLP Engine is operational.",
        "endpoints": {
            "health": "/api/health",
            "correct": "/api/correct",
            "examples": "/api/examples",
            "analyze_word": "/api/analyze-word",
            "docs": "/docs",
        },
    }


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    reload_enabled = os.getenv("UVICORN_RELOAD", "false").lower() == "true"
    uvicorn.run("app.main:app", host=host, port=port, reload=reload_enabled)
