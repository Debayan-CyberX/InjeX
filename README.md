# InjeX

InjeX is a dark cybersecurity dashboard and modular FastAPI service for prompt-injection detection. It preserves the preprocessing and adversarial transforms from `se_project (1).py`, while treating model and dataset artifacts as optional.

## Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API starts even without a model. Predictions are enabled when the persisted
artifacts are present in `backend/models/`.

### Train the project detectors

With the backend virtual environment active, run:

```powershell
cd backend
python train.py
```

This downloads `neuralchemy/Prompt-injection-dataset` (core), applies the exact
normalization and adversarial transformations from the project script, and
persists `models/baseline.joblib`, `models/improved.joblib`, and
`models/metadata.json`. The API loads both detectors on startup and reports
their measured clean/adversarial metrics.

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The frontend expects the API at `http://localhost:8000`.

## Endpoints

`POST /api/detect`, `POST /api/adversarial/test`, `GET /api/metrics`, `GET /api/comparison`, `GET|DELETE /api/history`, `GET /api/health`, `GET /api/dataset/summary`, and `POST /api/evaluate`.
