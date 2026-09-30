from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CandidateItem(BaseModel):
    term: str
    score: float
    distance: Optional[int] = None
    engine: str

class CorrectionItem(BaseModel):
    id: int
    original: str
    is_mistake: bool
    textblob_correction: str
    textblob_confidence: float
    symspell_correction: str
    symspell_confidence: float
    symspell_distance: int
    recommended: str
    chosen_algorithm: str
    confidence_level: str  # "High", "Medium", "Low"
    start_char: int
    end_char: int
    textblob_candidates: List[CandidateItem] = []
    symspell_candidates: List[CandidateItem] = []
    explanation: str

class CorrectionStatistics(BaseModel):
    total_words: int
    total_characters: int
    textblob_error_count: int
    symspell_error_count: int
    total_corrections_made: int
    textblob_time_ms: float
    symspell_time_ms: float
    total_time_ms: float
    speedup_ratio: float
    agreement_percentage: float
    words_corrected_percentage: float

class PipelineStep(BaseModel):
    step_number: int
    name: str
    description: str
    input_sample: str
    output_sample: str

class CorrectionResponse(BaseModel):
    original_text: str
    textblob_result: str
    symspell_result: str
    recommended_result: str
    corrections: List[CorrectionItem]
    statistics: CorrectionStatistics
    processing_time_ms: float
    pipeline_trace: List[PipelineStep]
    applied_algorithm: str

class CorrectionRequest(BaseModel):
    text: str = Field(..., max_length=5000, description="Text to analyze and correct")
    algorithm: Optional[str] = Field("compare", description="'compare', 'textblob', or 'symspell'")

class SingleWordAnalysisRequest(BaseModel):
    word: str = Field(..., max_length=50, description="Single word to inspect candidate generation for")
    max_edit_distance: Optional[int] = Field(2, ge=1, le=3)

class DecisionStep(BaseModel):
    step_name: str
    value: str
    description: str

class SingleWordAnalysisResponse(BaseModel):
    word: str
    is_correct: bool
    selected_correction: str
    edit_distance: int
    candidate_generation: List[str]
    decision_steps: List[DecisionStep]
    edit_distance_explained: str
    symspell_deletes: List[str]
    symspell_candidates: List[Dict[str, Any]]
    textblob_candidates: List[Dict[str, Any]]
    best_candidate: str
    algorithm_comparison_note: str

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    textblob_ready: bool
    symspell_ready: bool
    dictionary_terms_loaded: int
