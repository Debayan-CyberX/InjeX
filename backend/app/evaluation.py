from pathlib import Path
from typing import Any

def dataset_summary():
    try:
        from datasets import load_dataset
        ds = load_dataset("neuralchemy/Prompt-injection-dataset", "core", download_mode="reuse_dataset_if_exists")
        labels = {}
        for row in ds["train"]:
            key = str(row["label"]); labels[key] = labels.get(key, 0) + 1
        return {"available": True, "name": "neuralchemy/Prompt-injection-dataset", "splits": {k: len(v) for k, v in ds.items()}, "labels": labels}
    except Exception as exc:
        return {"available": False, "name": "neuralchemy/Prompt-injection-dataset", "splits": {}, "labels": {}, "reason": str(exc)}

def evaluate(detector) -> dict[str, Any]:
    if not detector.metadata:
        return {"available": False, "demo": False, "metrics": {}, "reason": detector.reason or "Training metadata is missing"}
    return {"available": True, "demo": False, "metrics": detector.metadata.get("improved", {}).get("clean", {}),
            "metadata": detector.metadata}
