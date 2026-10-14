from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class DetectRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=20000)
    detector: str = Field("improved", pattern="^(baseline|improved)$")
    preprocess: bool = True

class DetectResponse(BaseModel):
    label: str
    score: Optional[float] = None
    normalized_text: str
    available: bool
    demo: bool = False
    reason: Optional[str] = None
    detector: str
    processing_ms: float
    processing_duration_ms: float
    recommendation: str

class AdversarialRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=20000)
    runs: int = Field(3, ge=1, le=20)

class EvaluationResponse(BaseModel):
    available: bool
    demo: bool = False
    metrics: Dict[str, float] = {}
    reason: Optional[str] = None

class HistoryItem(BaseModel):
    id: str
    text: str
    label: str
    score: Optional[float] = None
    created_at: str
    available: bool

class DatasetSummary(BaseModel):
    available: bool
    name: str
    splits: Dict[str, int] = {}
    labels: Dict[str, int] = {}
    reason: Optional[str] = None
