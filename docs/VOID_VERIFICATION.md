# InjeX VOID verification

Verified on 18 October 2026 in Chrome using Playwright and the existing trained FastAPI application. The design preserves all nine routes and backend contracts.

## Completed checks

- TypeScript and the production Vite build pass. Pages load lazily through direct imports. The entry JavaScript is about 75 KB gzip and CSS about 17 KB gzip; the original chrome image is 84 KB.
- All nine fully loaded pages pass at 375, 768, 1024, 1440, and 1920 pixels, with no document overflow or uncaught browser exceptions. An additional 320-pixel pass also has no document overflow. Populated detection and experiment views fit the mobile viewport.
- Axe WCAG 2 A/AA and 2.1 AA checks report zero violations on all nine desktop pages and all nine 320-pixel mobile pages. The populated detection result also passes. Keyboard submission, arrow-key result tabs, clipboard copy, mobile navigation/Escape, visible focus, and reduced motion are checked. Automated checks do not replace a complete assistive-technology audit.
- Overview custom prompt handoff reaches the detector without losing the input.
- Real improved-model injection and baseline-model benign requests return classifications. Model selection, preprocessing, normalized text, score display, raw response, clipboard copy, stale-result notice, and clear controls pass.
- The real adversarial endpoint returns six variants and renders six graph nodes. Node selection, zoom/reset, list view, compare view, variant selection, and actual differences pass.
- Comparison scenario and metric selection pass. False-positive rate correctly uses lower-is-better semantics. CSV export contains actual returned benchmark values.
- Analytics shows actual confusion-matrix counts, row-normalized percentages, selectable cells, class-level reports, and explicit scales.
- Dataset shows the actual 6,274 source examples, split counts, and training-only label distribution with provenance.
- History reads real detection records. ID search, detail inspection, classification filters, and sorting pass. Clear cancellation and confirmation are tested only against isolated intercepted browser responses; real history is not deleted.
- Architecture stage inspection and zoom/reset pass. Trained pipelines, interactive rules, and stored evaluation metadata remain distinct.
- A simulated HTTP 503 shows an evidence-unavailable state without invented measurements. Retry returns to actual evaluation data. Test responses exist only in temporary browser scripts and are not shipped.

## Data and hosting limits

The API uses TF-IDF and logistic regression with interactive rule overrides. Training metrics measure threshold-based models, so a model score is not presented as the sole reason for a final interactive label. The source-corpus totals exclude generated augmentation; label counts describe the training split. Attack transformations are randomized and can repeat.

The existing free Render service may sleep between visits. API requests allow 90 seconds. History remains shared process memory, capped at 200 records, and resets when the API process restarts. The redesign does not change these backend semantics.

GitHub Pages uses the existing `/InjeX/` base, hash routes, Actions workflow, and `VITE_API_URL=https://injex-api.onrender.com` repository variable. No new hosting resource or paid plan is required.

## Current visual review

- [Overview](previews/void/overview.png) and [mobile](previews/void/overview-mobile.png)
- [Live Detection with real result](previews/void/live-detection.png)
- [Attack Lab with actual variants](previews/void/attack-lab.png)
- [Comparison](previews/void/comparison.png)
- [Analytics](previews/void/analytics.png)
- [History](previews/void/history.png)
- [Dataset](previews/void/dataset.png)
- [Architecture](previews/void/architecture.png)
- [About](previews/void/about.png)

See [design and original image-generation notes](VOID_DESIGN.md) for the visual system and final asset prompt.
