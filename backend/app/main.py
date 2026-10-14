from fastapi import FastAPI
from time import perf_counter
from fastapi.middleware.cors import CORSMiddleware
from .schemas import DetectRequest, AdversarialRequest
from .model import Detector
from .adversarial import adversarial_transform
from .history import HistoryStore
from .evaluation import dataset_summary, evaluate

app = FastAPI(title="InjeX API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
detector, history = Detector(), HistoryStore()

@app.get("/api/health")
def health():
    return {"status": "ok", "model": {"available": detector.available, "baseline": detector.available_for("baseline"),
            "improved": detector.available_for("improved"), "reason": detector.reason}, "service": "InjeX"}

@app.post("/api/detect")
def detect(req: DetectRequest):
    started = perf_counter()
    # The artifact currently exposes the improved pipeline. Keep baseline explicit
    # rather than silently pretending both detectors are available.
    available = detector.available_for(req.detector)
    label, score, normalized = detector.predict(req.text, req.preprocess, req.detector)
    elapsed = round((perf_counter() - started) * 1000, 3)
    recommendation = (f"{req.detector.title()} detector unavailable; run backend/train.py to create its artifact."
                      if not available else
                      ("Review and block this prompt." if label == "prompt_injection" else "Prompt appears benign; continue monitoring."))
    item = history.add(req.text, label, score, available, req.detector, elapsed)
    return {"label": label, "score": score, "normalized_text": normalized, "available": available,
            "demo": False, "reason": detector.reason_for(req.detector), "id": item["id"],
            "detector": req.detector, "processing_ms": elapsed, "processing_duration_ms": elapsed, "recommendation": recommendation,
            "preprocessed": req.preprocess}

@app.post("/api/adversarial/test")
def adversarial(req: AdversarialRequest):
    variants = [{"text": adversarial_transform(req.text)} for _ in range(req.runs)]
    for variant in variants:
        label, score, normalized = detector.predict(variant["text"], True, "improved")
        variant.update(label=label, score=score, normalized_text=normalized)
    return {"available": detector.available, "demo": False, "original": req.text, "variants": variants, "reason": detector.reason if not detector.available else None}

@app.get("/api/metrics")
def metrics(): return evaluate(detector)

@app.get("/api/comparison")
def comparison():
    if not detector.metadata:
        return {"available": False, "baseline": {}, "improved": {}, "reason": detector.reason}
    return {"available": True, "baseline": detector.metadata.get("baseline", {}),
            "improved": detector.metadata.get("improved", {}), "dataset": detector.metadata.get("dataset")}

@app.get("/api/history")
def get_history(): return {"items": history.list()}

@app.delete("/api/history")
def delete_history(): history.clear(); return {"ok": True}

@app.get("/api/dataset/summary")
def summary(): return dataset_summary()

@app.post("/api/evaluate")
def run_evaluate(): return evaluate(detector)
