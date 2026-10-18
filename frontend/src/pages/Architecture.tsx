import { useState } from "react";
import {
  Braces,
  Database,
  FileSearch,
  Focus,
  Layers3,
  Minus,
  Plus,
  ScanLine,
  SlidersHorizontal,
} from "lucide-react";
const stages = [
  {
    name: "Input",
    code: "POST /api/detect",
    icon: Braces,
    x: 35,
    y: 252,
    tag: "01 / RAW TEXT",
    label: "The trust boundary",
    text: "A prompt, a baseline or improved detector selection, and a preprocessing flag enter the API. Input length is validated between 1 and 20,000 characters.",
  },
  {
    name: "Normalize",
    code: "normalize_prompt(text)",
    icon: SlidersHorizontal,
    x: 230,
    y: 252,
    tag: "02 / OPTIONAL",
    label: "Make the surface readable",
    text: "Optional NFKC normalization removes zero-width characters U+200B–U+200D and U+FEFF, collapses repeated whitespace, and trims the prompt. This is not universal deobfuscation.",
  },
  {
    name: "Vectorize",
    code: "word + character TF-IDF",
    icon: Layers3,
    x: 425,
    y: 252,
    tag: "03 / FEATURES",
    label: "From language to features",
    text: "The selected scikit-learn pipeline combines word and character TF-IDF features. Feature settings belong to the loaded baseline or improved artifact.",
  },
  {
    name: "Classify",
    code: "predict_proba + rules",
    icon: ScanLine,
    x: 620,
    y: 252,
    tag: "04 / DECISION",
    label: "A probability and a rule decision",
    text: "Logistic regression produces the injection-class probability. Injection keywords and benign-task rules can override the threshold label. The returned score remains the model probability.",
  },
  {
    name: "Record",
    code: "HistoryStore(max_items=200)",
    icon: Database,
    x: 815,
    y: 252,
    tag: "05 / SESSION",
    label: "Keep the decision inspectable",
    text: "Raw input, label, score, model, processing duration, and timestamp are appended to a shared in-memory deque. The process retains up to 200 records; restarting the API clears it.",
  },
  {
    name: "Evaluate",
    code: "metadata.json → metrics",
    icon: FileSearch,
    x: 620,
    y: 455,
    tag: "06 / OFFLINE EVIDENCE",
    label: "Measure a different prediction path",
    text: "Metrics and comparison endpoints read stored training metadata for clean and adversarial scenarios. They evaluate the threshold-based models. They do not apply the interactive rule overrides, retrain, or run a fresh dataset evaluation.",
  },
];
export default function Architecture() {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(1);
  const stage = stages[active];
  return (
    <>
      <div className="blueprint-intro">
        <p>
          Follow the signal.
          <br />
          <span>Inspect every boundary.</span>
        </p>
        <span className="mono">
          TF–IDF × LOGISTIC REGRESSION
          <br />
          SELECT A STAGE TO OPEN ITS SPECIFICATION
        </span>
      </div>
      <div className="blueprint-workspace">
        <div className="blueprint-toolbar">
          <span>
            <i className="crosshair" /> SYSTEM MAP / 001
          </span>
          <div>
            <span className="blueprint-legend">
              <i />
              Request path <i />
              Training metadata
            </span>
            <button
              className="icon-button"
              aria-label="Zoom blueprint out"
              disabled={zoom <= 0.6}
              onClick={() => setZoom((v) => Math.max(0.6, v - 0.1))}
            >
              <Minus size={14} />
            </button>
            <span>{Math.round(zoom * 100)}%</span>
            <button
              className="icon-button"
              aria-label="Zoom blueprint in"
              disabled={zoom >= 1.3}
              onClick={() => setZoom((v) => Math.min(1.3, v + 0.1))}
            >
              <Plus size={14} />
            </button>
            <button
              className="icon-button"
              aria-label="Reset blueprint zoom"
              onClick={() => setZoom(1)}
            >
              <Focus size={15} />
            </button>
          </div>
        </div>
        <div className="blueprint-scroll">
          <div style={{ width: 1030 * zoom, height: 600 * zoom }}>
            <div
              className="blueprint-canvas"
              style={{ transform: `scale(${zoom})` }}
            >
              <span className="blueprint-zone-label zone-inference">
                INFERENCE / REQUEST PATH
              </span>
              <span className="blueprint-zone-label zone-training">
                OFFLINE / TRAINED RESOURCES
              </span>
              <span className="blueprint-zone-label zone-evaluation">
                EVALUATION / STORED EVIDENCE
              </span>
              <svg viewBox="0 0 1030 600" aria-hidden="true">
                <defs>
                  <marker
                    id="blueprint-arrow"
                    markerWidth="6"
                    markerHeight="6"
                    refX="5"
                    refY="3"
                    orient="auto"
                  >
                    <path d="M0 0L6 3L0 6" fill="currentColor" />
                  </marker>
                </defs>
                {[0, 1, 2, 3].map((index) => (
                  <path
                    key={index}
                    d={`M${stages[index].x + 160} 298 H${stages[index + 1].x - 5}`}
                    markerEnd="url(#blueprint-arrow)"
                  />
                ))}
                <path d="M510 155 V247" markerEnd="url(#blueprint-arrow)" />
                <path
                  d="M705 155 V185 Q705 205 680 205 H530 Q505 205 505 225 V247"
                  markerEnd="url(#blueprint-arrow)"
                />
                <path
                  className="offline-edge"
                  d="M895 155 V400 Q895 425 870 425 H720 Q700 425 700 450"
                  markerEnd="url(#blueprint-arrow)"
                />
              </svg>
              <div className="artifact-node" style={{ left: 425, top: 90 }}>
                <span>MODEL / 01</span>
                <strong>Baseline artifact</strong>
                <small>Original training samples</small>
              </div>
              <div className="artifact-node" style={{ left: 620, top: 90 }}>
                <span>MODEL / 02</span>
                <strong>Improved artifact</strong>
                <small>Adversarial augmentation</small>
              </div>
              <div
                className="artifact-node metadata-artifact"
                style={{ left: 815, top: 90 }}
              >
                <span>TRAINING OUTPUT</span>
                <strong>Evaluation metadata</strong>
                <small>Clean + adversarial tests</small>
              </div>
              {stages.map((item, index) => (
                <button
                  key={item.name}
                  className={`blueprint-node ${active === index ? "active" : ""}`}
                  style={{ left: item.x, top: item.y }}
                  onClick={() => setActive(index)}
                  aria-pressed={active === index}
                >
                  <span>{item.tag}</span>
                  <strong>
                    <item.icon size={17} strokeWidth={1} />
                    {item.name}
                  </strong>
                  <small>{item.code}</small>
                  <i className="node-port input-port" />
                  <i className="node-port output-port" />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="blueprint-caption">
          <span>SCROLL TO EXPLORE / USE BUTTONS OR THE STAGE INDEX BELOW</span>
          <span>NOT A TRANSFORMER OR FULL LLM</span>
        </div>
      </div>
      <div
        className="blueprint-stage-index"
        role="group"
        aria-label="Pipeline stage index"
      >
        {stages.map((item, index) => (
          <button
            key={item.name}
            className={active === index ? "active" : ""}
            aria-pressed={active === index}
            onClick={() => setActive(index)}
          >
            <span>0{index + 1}</span>
            {item.name}
          </button>
        ))}
      </div>
      <section className="blueprint-spec" aria-live="polite">
        <span className="spec-number">0{active + 1}</span>
        <div>
          <span className="eyebrow">
            STAGE SPECIFICATION / {stage.name.toUpperCase()}
          </span>
          <h2>{stage.label}</h2>
          <p>{stage.text}</p>
          <code>{stage.code}</code>
        </div>
        <stage.icon size={68} strokeWidth={0.6} />
      </section>
    </>
  );
}
