# Public deployment

Frontend: https://debayan-cyberx.github.io/InjeX/
Backend: https://injex-api.onrender.com
Backend dashboard: https://dashboard.render.com/web/srv-dbaeh6dg1s2s73bqbcfg

The frontend is built by the existing GitHub Pages Actions workflow. Its VITE_API_URL repository variable points to the backend origin above.

The backend uses a free Render web service in Singapore. Build: `pip install -r backend/requirements.txt && python backend/train.py`. Start: `uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT`. Python 3.12.11. Both detectors and evaluation metadata are built from the existing training script; no synthetic results are deployed.

Free services sleep after inactivity. The initial API request can take about a minute. The frontend allows up to 90 seconds for API requests. Use Retry connection if a wake-up request fails. History remains shared temporary process memory and resets on service restarts.

To update the website, push frontend changes to `main`. To update the backend, push backend changes to `main` and verify Render's deploy status. Model training runs at backend build time; no model files need to be committed.
