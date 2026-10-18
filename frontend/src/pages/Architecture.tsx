import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Braces,
  Database,
  FileSearch,
  Layers3,
  ScanLine,
  SlidersHorizontal,
} from "lucide-react";

const stages = [
  {
    name: "Input",
    label: "The trust boundary",
    icon: Braces,
    code: "POST /api/detect",
    text: "A plain-text prompt, a baseline or improved detector selection, and a preprocessing flag. The API validates input length between 1 and 20,000 characters.",
  },
  {
    name: "Normalize",
    label: "Make the surface readable",
    icon: SlidersHorizontal,
    code: "normalize_prompt(text)",
    text: "When enabled, NFKC Unicode normalization is applied, zero-width characters U+200B–U+200D and U+FEFF are removed, and repeated whitespace is collapsed. This is not universal deobfuscation.",
  },
  {
    name: "Vectorize",
    label: "From language to features",
    icon: Layers3,
    code: "TF-IDF → feature union",
    text: "The trained scikit-learn pipeline combines word and character TF-IDF features. The baseline and improved model artifacts are loaded separately. Feature configuration belongs to the trained pipeline.",
  },
  {
    name: "Classify",
    label: "A score and a rule decision",
    icon: ScanLine,
    code: "predict_proba + rule overrides",
    text: "Logistic regression produces an injection-class probability. Injection keywords and benign-task prefixes can override the threshold-based label. The reported score remains the model probability, so it may differ from the rule-based decision.",
  },
  {
    name: "Record",
    label: "Keep a session trace",
    icon: Database,
    code: "HistoryStore(max_items=200)",
    text: "The raw prompt, classification, score, detector, processing duration, and timestamp are appended to a shared in-memory deque. It holds up to 200 records and resets when the API process restarts.",
  },
  {
    name: "Evaluate",
    label: "Read the training evidence",
    icon: FileSearch,
    code: "metadata.json → evaluation",
    text: "Metrics and comparison endpoints read stored training metadata for clean and adversarial scenarios. The evaluate endpoint returns metadata; it does not retrain the model or perform a fresh dataset evaluation.",
  },
];
export default function Architecture() {
  const [active, setActive] = useState(0);
  const stage = stages[active];
  return (
    <>
      <section className="architecture-intro">
        <span className="eyebrow">SMALL MODELS. VISIBLE DECISIONS.</span>
        <h2>
          An inspectable path
          <br />
          from <em>input to insight.</em>
        </h2>
        <p>
          A conventional machine learning pipeline with explicit preprocessing,
          rule overrides, and measurable behavior.
        </p>
      </section>
      <div className="pipeline-workspace">
        <div className="pipeline-header">
          <span className="mono">DETECTION PATH / SELECT A STAGE</span>
          <span>Evaluation reads training metadata</span>
        </div>
        <div className="pipeline-grid">
          {stages.map((item, index) => (
            <div className="pipeline-step" key={item.name}>
              <button
                className={`pipeline-node ${active === index ? "active" : ""}`}
                onClick={() => setActive(index)}
                aria-pressed={active === index}
              >
                <span className="pipeline-number">0{index + 1}</span>
                <item.icon size={25} strokeWidth={1.2} />
                <strong>{item.name}</strong>
                <span className="mono">
                  {index === 5 ? "OFFLINE METADATA" : "REQUEST PIPELINE"}
                </span>
              </button>
              {index < stages.length - 1 ? (
                <ArrowRight className="pipeline-arrow" size={18} />
              ) : null}
            </div>
          ))}
        </div>
        <div className="stage-detail" aria-live="polite">
          <span className="stage-detail-number">0{active + 1}</span>
          <div>
            <p className="eyebrow">{stage.name.toUpperCase()}</p>
            <h3>{stage.label}</h3>
            <p>{stage.text}</p>
            <code>{stage.code}</code>
          </div>
          <stage.icon size={64} strokeWidth={0.6} />
        </div>
      </div>
      <section className="architecture-branches">
        <div>
          <span className="eyebrow">TRAINING / OFFLINE</span>
          <h3>
            Two artifacts.
            <br />
            One evaluation question.
          </h3>
          <p>
            The baseline uses original training data. The improved pipeline adds
            adversarially transformed training prompts. Stored metrics make
            their behavior comparable.
          </p>
        </div>
        <div className="training-path">
          <span>Prompt-injection dataset</span>
          <ArrowDown size={15} />
          <div>
            <span>Original samples → Baseline</span>
            <span>Augmented samples → Improved</span>
          </div>
          <ArrowDown size={15} />
          <span>Clean & adversarial evaluation</span>
        </div>
      </section>
    </>
  );
}
