from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.endpoints import router as api_router

app = FastAPI(
    title="SpellSense NLP API",
    description="Professional NLP Spelling Correction Service powered by TextBlob and SymSpell.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration allowing local development from Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An unexpected error occurred during NLP processing.",
            "error_type": type(exc).__name__,
            "message": str(exc)
        }
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
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
