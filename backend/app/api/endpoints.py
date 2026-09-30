from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import (
    CorrectionRequest,
    CorrectionResponse,
    SingleWordAnalysisRequest,
    SingleWordAnalysisResponse,
    HealthResponse
)
from app.services.spelling_service import SpellingService

router = APIRouter()
spelling_service = SpellingService()

@router.post("/correct", response_model=CorrectionResponse)
def correct_text(req: CorrectionRequest):
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty.")
    algo = req.algorithm.lower() if req.algorithm else "compare"
    if algo not in ["compare", "textblob", "symspell"]:
        algo = "compare"
    return spelling_service.correct(req.text, algorithm=algo)

@router.post("/correct/textblob", response_model=CorrectionResponse)
def correct_with_textblob(req: CorrectionRequest):
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty.")
    return spelling_service.correct(req.text, algorithm="textblob")

@router.post("/correct/symspell", response_model=CorrectionResponse)
def correct_with_symspell(req: CorrectionRequest):
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty.")
    return spelling_service.correct(req.text, algorithm="symspell")

@router.post("/analyze-word", response_model=SingleWordAnalysisResponse)
def analyze_word(req: SingleWordAnalysisRequest):
    if not req.word or not req.word.strip():
        raise HTTPException(status_code=400, detail="Word cannot be empty.")
    return spelling_service.analyze_single_word(req.word, max_distance=req.max_edit_distance or 2)

@router.get("/examples")
def get_examples():
    return spelling_service.get_preset_examples()

@router.get("/health", response_model=HealthResponse)
def health_check():
    ss_ready = spelling_service.symspell_engine.is_ready
    return HealthResponse(
        status="healthy",
        service="SpellSense NLP Engine",
        version="1.0.0",
        textblob_ready=True,
        symspell_ready=ss_ready,
        dictionary_terms_loaded=spelling_service.symspell_engine.word_count
    )
