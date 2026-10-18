# InjeX redesign verification

Verified locally on 18 October 2026 using Chrome headless, Playwright, the production Vite preview, and an isolated instance of the repository's existing FastAPI app.

## Completed implementation

All nine application sections share an obsidian, copper and ivory design system. The Overview includes a pointer-responsive SVG optical instrument, research chapters, a real editor handoff, and comparison values only when returned by the API. Working pages provide readable editors, actual result inspection, data provenance, and explicit unavailable states.

The Attack Lab graph is built from API-returned variants, with accessible list and compare alternatives, node inspection, bounded text differences, zoom, duplicate reporting, and empty/error handling. Research pages preserve actual comparison, confusion matrix, history, and dataset semantics. Architecture and About describe the actual TF-IDF/logistic regression implementation and team.

The oversized entry file was split into pages, reusable components, API utilities and design styles. Heavy pages load lazily. Fonts and their licenses are self-hosted. The frontend adds no runtime dependency; React Bits Spotlight Card is vendored with its license.

## Checks and evidence

| Check | Result |
| --- | --- |
| Lockfile install | `npm ci` succeeded; npm reported zero vulnerabilities. |
| TypeScript | `npm run typecheck` passed with strict settings. |
| Production build | `npm run build` passed without warnings. Entry JavaScript is about 79 KB gzip; CSS about 16 KB gzip. |
| Routes and layout | All nine pages rendered at 375, 768, 1024, 1440 and 1920 pixels: 45 route/viewport combinations with no document overflow. |
| Hero typography | Text bounds checked separately at 320, 375, 768, 1024, 1440 and 1920 pixels. A cropped mobile line found during screenshot review was fixed. |
| Browser navigation | CTA navigation, direct links, reload, back/forward and mobile menu passed. |
| Production integration | Assets, fonts and section links load under `/InjeX/`. No unset-production-API calls or localhost fallback requests. |
| Real API detection | Request contract, normalization, returned normalized text, raw response and unavailable-model state passed. No score was shown as a successful classification. |
| Real API Attack Lab | Six generated variants produced six graph nodes; selection, zoom, list, compare and actual returned text passed. |
| Real API history | Search, keyboard detail inspection, deletion confirmation, cancel and actual DELETE response passed in the isolated test service. |
| Success-path fixtures | Malicious/benign states, model selection, preprocessing payload, keyboard submission and stale-result message passed. |
| Comparison fixtures | Positive and negative deltas, lower-is-better false-positive coloring, scenario selection and rates above 5% passed. |
| Analytics/dataset fixtures | Confusion matrix, class report, dataset splits and training label bars passed. |
| Attack Lab fixtures | Twenty returned nodes, duplicate accounting, selection and highlighted changes passed; populated graph/list/compare views stayed within the mobile viewport. |
| Failure handling | Network failure retains the editor input and produces no score; empty adversarial output is explicitly reported. |
| Editor controls | Example handoff, clear, normalization pointer input, result tabs and a 20,000-character prompt passed. |
| Accessibility | Keyboard navigation, visible focus, mobile drawer focus wrapping/Escape, semantic controls and reduced-motion behavior checked. |
| Skip navigation | Skip-to-content preserves the current hash route and focuses the active page. |
| API response errors | Malformed JSON produces a readable service error and no classification. Normal responses pass through the combined cancellation/timeout signal. |
| Diff reconstruction | Substitutions, spacing changes, emoji, empty strings and 20,000-character inputs reconstruct both source and target correctly. |
| Console | No uncaught browser exceptions or production console warnings in the checked flows. |

**Test fixtures were confined to temporary browser interception scripts. They are not shipped as application data, model artifacts or metrics.**

## Limits

This checkout has no trained baseline/improved model artifacts or evaluation metadata. Real predictions and real evaluation values could therefore not be validated locally; those populated UI branches were checked using clearly isolated fixtures. The real backend was exercised for its unavailable-model, normalization, adversarial generation and session-history paths.

The supplied PDFs describe other academic projects (hallucination detection and the SolarWinds case study). They were used to confirm team credits, not to invent InjeX capabilities. InjeX functionality was determined from the repository implementation.

Backend code, API contracts, model training, dataset definitions and CORS settings remain unchanged. The repository was not pushed and no remote deployment was performed. Deployment steps are in [frontend/README.md](../frontend/README.md).

## Screenshots

Production screenshots show real unavailable states rather than fabricated model evidence:

- [Overview, desktop](previews/overview-desktop.png)
- [Overview, mobile](previews/overview-mobile.png)
- [Live Detection](previews/live-detection.png)
- [Attack Lab](previews/attack-lab.png)
