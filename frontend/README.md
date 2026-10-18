# InjeX / VOID — Experimental Monochrome

React + TypeScript + Vite frontend for the existing InjeX FastAPI service. Nine distinctive research views share a monochrome design system, original chrome artwork, and restrained acid-lime controls. Every prediction, benchmark, chart, and record comes from the existing FastAPI service.

## Run locally

From the repository directory containing `frontend` and `backend`:

```powershell
cd frontend
npm ci
npm run dev
```

Open `http://localhost:5173/InjeX/`. In this downloaded workspace, the repository directory is `C:\Users\shivl\OneDrive\Desktop\InjeX-main\InjeX-main`.

In another terminal, from that repository directory:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
cd backend
..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

The development frontend defaults to `http://localhost:8000`. To use a different backend, copy `.env.example` to `.env.local` inside `frontend`, set `VITE_API_URL` to the API origin **without `/api`**, and restart Vite.

Model artifacts are optional for starting the API. To train the actual models, run the existing training script from the repository directory:

```powershell
.\.venv\Scripts\python.exe backend/train.py
```

Training downloads the configured Hugging Face dataset and writes the existing baseline/improved artifacts and training metadata to `backend/models`. Restart the API after training. This can take time and requires working dataset access; the frontend never substitutes sample metrics or predictions.

## Validate

```powershell
cd frontend
npm run typecheck
npm run build
npm run preview
```

The production preview is at `http://localhost:4173/InjeX/`. With no `VITE_API_URL` set at build time, it deliberately shows service-unavailable states. It does not call localhost from a deployed website.

## Live hosting

- Frontend: https://debayan-cyberx.github.io/InjeX/
- API: https://injex-api.onrender.com/

The backend uses the selected free Render plan and can sleep between visits. Its shared in-memory history resets when the process restarts. The frontend allows up to 90 seconds for API requests.

## Deploy with the existing GitHub Pages workflow

1. Host the existing FastAPI application on an HTTPS server. Install `backend/requirements.txt` there and start with `uvicorn app.main:app --host 0.0.0.0 --port <host-provided-port>` from `backend`. Provide trained model files and training metadata on that server if you want predictions and evaluation evidence.
2. In `Debayan-CyberX/InjeX`, open **Settings → Secrets and variables → Actions → Variables**. Set the repository variable `VITE_API_URL` to the public API origin, for example `https://your-api.example.com`. Do not include `/api`.
3. In **Settings → Pages**, choose **GitHub Actions** as the build source.
4. Commit the redesigned frontend and its lockfile to the repository's `frontend/` directory. Keep `.github/workflows/deploy-pages.yml` at the repository root, alongside `frontend/` and `backend/`.
5. Push to `main`, or run **Actions → Deploy frontend to GitHub Pages → Run workflow**. The existing workflow installs with `npm ci`, builds with `VITE_API_URL`, and publishes `frontend/dist`.
6. Open `https://debayan-cyberx.github.io/InjeX/`. Verify a direct link such as `/InjeX/#/attack-lab` and inspect the real API connection state. Rebuild after changing the API variable; Vite embeds it at build time.

The deployment base remains `/InjeX/`. Hash routing supports refreshes, shared section links, and browser history without GitHub Pages rewrite rules. No hosting configuration or backend security settings were changed by this redesign.

## Implementation map

- `src/App.tsx`: persistent navigation, hash routes, connection status, responsive drawer and focus management.
- `src/lib/api.ts`: API types, requests, timeouts, availability states and formatting.
- `src/lib/diff.ts`: bounded character diff for short and long prompt variants.
- `src/pages/Overview.tsx`: cinematic introduction, research chapters, prompt handoff and real comparison evidence.
- `src/pages/Detect.tsx`: prompt editor, presets, model/preprocessing controls and response inspector.
- `src/pages/Attack.tsx`: actual returned variants, graph/list/compare views, zoom and diff inspection.
- `src/pages/Comparison.tsx`, `Analytics.tsx`, `History.tsx`, `Dataset.tsx`: benchmark selection and CSV export, inspectable confusion matrix, forensic event ledger, and dataset provenance.
- `src/pages/Architecture.tsx`, `About.tsx`: actual pipeline, limitations, methodology and verified team credits.
- `src/components`: accessible result states, shared research headings, CSV downloads, and metric definitions.
- `src/void.css`, `void-research.css`, `void-responsive.css`: the VOID design system, page compositions, and responsive layouts.
- `public/images/void-chrome.webp`: original 84 KB chrome form study for the cinematic introduction.
- `public/fonts`: locally hosted fonts with original licenses. No font CDN is required at runtime.

## Data semantics

The live detector combines model probabilities with rule overrides. A model score alone does not determine the final classification. Training metrics measure the threshold-based path, so they should not be described as metrics for the interactive rule-overridden path.

The adversarial endpoint returns transformed variants and their improved-detector results. It does not return technique attribution or classify the original prompt separately. Duplicate and unchanged variants are retained and reported.

Dataset label counts describe the **training split**, while split totals cover all loaded splits. History holds up to 200 records in shared process memory and resets on an API process restart.

See [VOID design notes](../docs/VOID_DESIGN.md) for the visual system and original asset prompt, and [the verification record](../docs/VOID_VERIFICATION.md) for completed checks and deployment evidence.
