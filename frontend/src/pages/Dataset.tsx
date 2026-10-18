import { ArrowUpRight, Database } from "lucide-react";
import { useApi, formatNumber, toTitle } from "../lib/api";
import type { DatasetSummaryResponse } from "../lib/api";
import { ResearchState, SectionLabel } from "../components/ResearchUI";

export default function Dataset() {
  const { data, loading, error, reload } =
    useApi<DatasetSummaryResponse>("/dataset/summary");
  const splits = Object.entries(data?.splits || {});
  const labels = Object.entries(data?.labels || {});
  const total = splits.reduce((sum, [, count]) => sum + count, 0);
  const labelTotal = labels.reduce((sum, [, count]) => sum + count, 0);
  let arcStart = 0;
  return (
    <ResearchState
      loading={loading}
      error={error}
      available={data?.available}
      reason={data?.reason}
      retry={reload}
    >
      <section className="corpus-identity">
        <div>
          <span className="eyebrow">CORPUS / 001</span>
          <h2>
            Language, collected.
            <br />
            <span>Intent, labeled.</span>
          </h2>
          <a
            href="https://huggingface.co/datasets/neuralchemy/Prompt-injection-dataset"
            target="_blank"
            rel="noreferrer"
          >
            {data?.name || "Dataset name not reported"}{" "}
            <ArrowUpRight size={14} />
          </a>
        </div>
        <div className="corpus-total">
          <strong>{formatNumber(total)}</strong>
          <span>EXAMPLES IN THE SOURCE CORPUS</span>
          <span className="mono">CONFIGURATION / CORE</span>
        </div>
      </section>
      <section className="split-observatory">
        <SectionLabel
          number="01"
          title="Partitioning the evidence"
          note="Original dataset / no augmented samples"
        />
        <div className="split-spectrum" aria-label="Dataset split proportions">
          {splits.map(([name, count], index) => (
            <span
              key={name}
              className={`split-color-${index}`}
              style={{ flex: count || 0.001 }}
              title={`${name}: ${formatNumber(count)} examples`}
            />
          ))}
        </div>
        <div className="split-ledger">
          {splits.map(([name, count], index) => (
            <div key={name}>
              <span className="eyebrow">
                <i className={`split-key split-color-${index}`} />
                {toTitle(name)}
              </span>
              <strong>{formatNumber(count)}</strong>
              <span>
                {total ? ((count / total) * 100).toFixed(1) : "—"}% of corpus
              </span>
              <p>
                {name === "train"
                  ? "Learn the feature representation and classifier."
                  : name === "validation"
                    ? "Select model decision thresholds."
                    : name === "test"
                      ? "Measure held-out clean and adversarial performance."
                      : "A dataset partition returned by the API."}
              </p>
            </div>
          ))}
        </div>
      </section>
      <div className="dataset-lower">
        <section className="class-observatory">
          <SectionLabel
            number="02"
            title="The balance of intent"
            note="Training split only"
          />
          <div className="distribution-study">
            <div className="distribution-ring">
              <svg
                viewBox="0 0 200 200"
                role="img"
                aria-label={`Training class distribution: ${labels.map(([name, count]) => `${name === "0" ? "benign" : name === "1" ? "injection" : name} ${count}`).join(", ")}`}
              >
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="var(--line)"
                  strokeWidth="13"
                />
                {labels.map(([name, count], index) => {
                  const share = labelTotal ? count / labelTotal : 0;
                  const start = arcStart;
                  arcStart += share;
                  return (
                    <circle
                      key={name}
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke={
                        index === 0
                          ? "var(--fg)"
                          : index === 1
                            ? "var(--accent)"
                            : "var(--muted)"
                      }
                      strokeWidth="13"
                      strokeDasharray={`${Math.max(0, share * 502.65 - 3)} 502.65`}
                      strokeDashoffset={-start * 502.65}
                      transform="rotate(-90 100 100)"
                    />
                  );
                })}
              </svg>
              <div>
                <strong>{formatNumber(labelTotal)}</strong>
                <span>TRAINING LABELS</span>
              </div>
            </div>
            <div className="distribution-labels">
              {labels.map(([name, count], index) => (
                <div key={name}>
                  <span>
                    <i
                      style={{
                        background:
                          index === 0
                            ? "var(--fg)"
                            : index === 1
                              ? "var(--accent)"
                              : "var(--muted)",
                      }}
                    />
                    {name === "0"
                      ? "Benign"
                      : name === "1"
                        ? "Prompt injection"
                        : name}
                  </span>
                  <strong>{formatNumber(count)}</strong>
                  <small>
                    {labelTotal ? ((count / labelTotal) * 100).toFixed(1) : "—"}
                    %
                  </small>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="provenance-ledger">
          <SectionLabel number="03" title="Provenance" />
          <dl>
            <div>
              <dt>Source</dt>
              <dd>Hugging Face Datasets</dd>
            </div>
            <div>
              <dt>Dataset</dt>
              <dd>{data?.name || "Not reported"}</dd>
            </div>
            <div>
              <dt>Configuration</dt>
              <dd>core</dd>
            </div>
            <div>
              <dt>Class mapping</dt>
              <dd>
                0 / benign
                <br />1 / prompt injection
              </dd>
            </div>
            <div>
              <dt>Augmentation</dt>
              <dd>Training only; generated by the existing pipeline.</dd>
            </div>
          </dl>
          <p className="research-provenance">
            The chart shows the source corpus. Synthetic training variants are
            excluded. Class counts cover the training split, not the entire
            dataset.
          </p>
        </section>
      </div>
      <div className="dataset-methods">
        <Database size={20} strokeWidth={1} />
        <p>
          Original prompts train the baseline. Two adversarial variants per
          injection training sample are added for the improved detector. Both
          models are measured on the same clean and transformed test set.
        </p>
        <a href="#/architecture" className="text-button">
          Trace the pipeline <ArrowUpRight size={14} />
        </a>
      </div>
    </ResearchState>
  );
}
