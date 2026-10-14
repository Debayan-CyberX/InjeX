"""Train and persist the InjeX baseline and adversarially augmented detectors.

Usage (from backend): python train.py
The feature/vectorizer settings intentionally mirror se_project (1).py.
"""
import json
import random
from pathlib import Path
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import FeatureUnion, Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report
from datasets import load_dataset
from app.adversarial import adversarial_transform
from app.preprocessing import normalize_prompt

SEED = 42
ROOT = Path(__file__).parent
MODEL_DIR = ROOT / "models"

def metrics(y_true, y_pred):
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    return {"accuracy": float(accuracy_score(y_true, y_pred)),
            "precision": float(precision_score(y_true, y_pred, zero_division=0)),
            "recall": float(recall_score(y_true, y_pred, zero_division=0)),
            "f1": float(f1_score(y_true, y_pred, zero_division=0)),
            "false_positive_rate": float(fp / (fp + tn)) if fp + tn else 0.0}

def tune_threshold(model, validation_text, validation_y):
    probabilities = model.predict_proba(validation_text)[:, 1]
    candidates = np.arange(0.20, 0.81, 0.01)
    scored = [
        (accuracy_score(validation_y, (probabilities >= threshold).astype(int)), float(threshold))
        for threshold in candidates
    ]
    return max(scored, key=lambda item: item[0])[1]

def union(improved=False):
    word_args = dict(analyzer="word", ngram_range=(1, 2), min_df=2,
                     max_features=60000 if improved else 50000, sublinear_tf=True)
    if not improved:
        word_args["max_df"] = .98
    return FeatureUnion([
        ("word", TfidfVectorizer(**word_args)),
        ("char", TfidfVectorizer(analyzer="char", ngram_range=(2, 6) if improved else (3, 5),
          min_df=2, max_features=70000 if improved else 50000, sublinear_tf=True)),
    ])

def train():
    random.seed(SEED); np.random.seed(SEED)
    dataset = load_dataset("neuralchemy/Prompt-injection-dataset", "core")
    train_text = [normalize_prompt(x) for x in dataset["train"]["text"]]
    train_y = [int(x) for x in dataset["train"]["label"]]
    validation_text = [normalize_prompt(x) for x in dataset["validation"]["text"]]
    validation_y = np.array([int(x) for x in dataset["validation"]["label"]])
    test_text = [normalize_prompt(x) for x in dataset["test"]["text"]]
    test_y = [int(x) for x in dataset["test"]["label"]]
    baseline = Pipeline([("features", union(False)), ("model", LogisticRegression(max_iter=1000, class_weight="balanced", random_state=SEED))])
    baseline.fit(train_text, train_y)
    augmented_text, augmented_y = list(train_text), list(train_y)
    for text, label in zip(train_text, train_y):
        if label == 1:
            for _ in range(2):
                augmented_text.append(adversarial_transform(text)); augmented_y.append(1)
    improved = Pipeline([("features", union(True)), ("model", LogisticRegression(max_iter=1500, class_weight="balanced", C=2.0, random_state=SEED))])
    improved.fit(augmented_text, augmented_y)
    baseline_threshold = tune_threshold(baseline, validation_text, validation_y)
    improved_threshold = tune_threshold(improved, validation_text, validation_y)
    adversarial_test = [adversarial_transform(x) for x in test_text]
    def predictions(model, texts, threshold):
        return (model.predict_proba(texts)[:, 1] >= threshold).astype(int)
    improved_clean_predictions = predictions(improved, test_text, improved_threshold)
    improved_confusion_matrix = confusion_matrix(test_y, improved_clean_predictions, labels=[0, 1]).tolist()
    improved_classification_report = classification_report(
        test_y,
        improved_clean_predictions,
        labels=[0, 1],
        target_names=["benign", "prompt_injection"],
        output_dict=True,
        zero_division=0,
    )
    result = {"dataset": "neuralchemy/Prompt-injection-dataset", "seed": SEED,
      "threshold_selection": "accuracy maximized on validation split",
      "thresholds": {"baseline": baseline_threshold, "improved": improved_threshold},
      "splits": {k: len(v) for k, v in dataset.items()}, "augmented_train": len(augmented_text),
      "evaluation": {
          "detector": "improved",
          "scenario": "clean",
          "labels": ["benign", "prompt_injection"],
          "confusion_matrix": improved_confusion_matrix,
          "classification_report": improved_classification_report,
      },
      "baseline": {"clean": metrics(test_y, predictions(baseline, test_text, baseline_threshold)), "adversarial": metrics(test_y, predictions(baseline, adversarial_test, baseline_threshold))},
      "improved": {"clean": metrics(test_y, predictions(improved, test_text, improved_threshold)), "adversarial": metrics(test_y, predictions(improved, adversarial_test, improved_threshold))}}
    MODEL_DIR.mkdir(exist_ok=True)
    import joblib
    joblib.dump(baseline, MODEL_DIR / "baseline.joblib")
    joblib.dump(improved, MODEL_DIR / "improved.joblib")
    (MODEL_DIR / "metadata.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    train()
