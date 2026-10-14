from pathlib import Path
import json
from typing import Optional, Tuple
import re
from .preprocessing import normalize_prompt

class Detector:
    """Loads an optional sklearn pipeline; never prevents the API from starting."""
    def __init__(self):
        self.pipeline = None
        self.baseline_pipeline = None
        self.metadata = {}
        self.thresholds = {"baseline": 0.5, "improved": 0.5}
        self.reason = "No trained model found"
        model_dir = Path(__file__).parent.parent / "models"
        try:
            import joblib
            improved = model_dir / "improved.joblib"
            baseline = model_dir / "baseline.joblib"
            # Keep compatibility with the original single-artifact setup.
            if not improved.exists():
                improved = model_dir / "detector.joblib"
            if improved.exists(): self.pipeline = joblib.load(improved)
            if baseline.exists(): self.baseline_pipeline = joblib.load(baseline)
            metadata = model_dir / "metadata.json"
            if metadata.exists(): self.metadata = json.loads(metadata.read_text(encoding="utf-8"))
            self.thresholds.update(self.metadata.get("thresholds", {}))
            if self.pipeline or self.baseline_pipeline: self.reason = None
            else: self.reason = "Model artifacts missing: run backend/train.py"
        except Exception as exc:
            self.reason = f"Model dependencies unavailable: {exc}"

    @property
    def available(self): return self.pipeline is not None

    def available_for(self, detector: str) -> bool:
        return (self.baseline_pipeline if detector == "baseline" else self.pipeline) is not None

    def reason_for(self, detector: str) -> Optional[str]:
        if self.available_for(detector):
            return None
        return f"{detector.title()} model artifact missing; run backend/train.py"

    def predict(self, text: str, preprocess: bool = True, detector: str = "improved") -> Tuple[str, Optional[float], str]:
        normalized = normalize_prompt(text) if preprocess else text
        pipeline = self.baseline_pipeline if detector == "baseline" else self.pipeline
        if not pipeline:
            return "unavailable", None, normalized
        try:
            score = float(pipeline.predict_proba([normalized])[0][1])
            threshold = float(self.thresholds.get(detector, 0.5))
            return ("prompt_injection" if score >= threshold else "benign"), score, normalized
        except Exception:
            return "unavailable", None, normalized
