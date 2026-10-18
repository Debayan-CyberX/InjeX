import { ArrowRight, Database, GitCompareArrows } from "lucide-react";
import { UnavailableState } from "./ui";

export function ResearchBlank({
  title,
  description,
  reason,
}: {
  title: string;
  description: string;
  reason: string;
}) {
  return (
    <section className="research-empty">
      <div>
        <p className="eyebrow">AWAITING RESEARCH DATA</p>
        <h2>{title}</h2>
        <p>{description}</p>
        <UnavailableState text={reason} />
      </div>
      <div className="research-placeholder">
        <div>
          <GitCompareArrows size={22} strokeWidth={1} />
          <span className="mono">
            BASELINE <ArrowRight size={12} /> IMPROVED
          </span>
        </div>
        <div>
          <span>
            Clean evaluation<strong>—</strong>
          </span>
          <span>
            Adversarial evaluation<strong>—</strong>
          </span>
        </div>
        <p>
          <Database size={12} /> Results come from training metadata
        </p>
      </div>
    </section>
  );
}
export function MetricDefinitions() {
  const definitions = [
    ["Accuracy", "Fraction of all evaluated examples classified correctly."],
    [
      "Precision",
      "Of predictions marked as injections, the fraction that are injections.",
    ],
    ["Recall", "Of actual injections, the fraction detected."],
    ["F1", "Harmonic mean of precision and recall."],
    [
      "False-positive rate",
      "Fraction of benign examples incorrectly flagged. Lower is better.",
    ],
  ];
  return (
    <div className="metric-explanations">
      {definitions.map(([title, description]) => (
        <div key={title}>
          <h4>{title}</h4>
          <p>{description}</p>
        </div>
      ))}
    </div>
  );
}
