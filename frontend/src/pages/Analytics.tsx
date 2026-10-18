import { useState } from "react";
import {
  useApi,
  isRecord,
  formatNumber,
  formatPercent,
  toTitle,
} from "../lib/api";
import type { MetricsResponse } from "../lib/api";
import {
  ResearchState,
  SectionLabel,
  ExportData,
} from "../components/ResearchUI";
import { MetricDefinitions } from "../components/ResearchStates";
import { UnavailableState } from "../components/ui";

export default function Analytics() {
  const { data, error, loading, reload } = useApi<MetricsResponse>("/metrics");
  const [normalized, setNormalized] = useState(false);
  const [cell, setCell] = useState(0);
  const metadata = isRecord(data?.metadata) ? data.metadata : null;
  const evaluation =
    metadata && isRecord(metadata.evaluation) ? metadata.evaluation : null;
  const matrix = Array.isArray(evaluation?.confusion_matrix)
    ? (evaluation.confusion_matrix.filter(Array.isArray) as number[][])
    : null;
  const report = isRecord(evaluation?.classification_report)
    ? evaluation.classification_report
    : null;
  const counts = matrix
    ? [matrix[0]?.[0], matrix[0]?.[1], matrix[1]?.[0], matrix[1]?.[1]]
    : [];
  const maxCount = Math.max(
    1,
    ...counts.filter((value) => typeof value === "number"),
  );
  const cellNames = [
    "True negative",
    "False positive",
    "False negative",
    "True positive",
  ];
  const cellDescriptions = [
    "Benign prompts correctly classified as benign.",
    "Benign prompts incorrectly classified as injections.",
    "Injection prompts incorrectly classified as benign.",
    "Injection prompts correctly classified as injections.",
  ];
  const metrics = Object.entries(data?.metrics || {});
  return (
    <ResearchState
      loading={loading}
      error={error}
      available={data?.available}
      reason={data?.reason}
      retry={reload}
    >
      <div className="analytics-meta">
        <span>
          <i className="status-dot online" /> STORED EVALUATION
        </span>
        <span>IMPROVED DETECTOR / CLEAN TEST SET</span>
        <ExportData
          filename="injex-evaluation.csv"
          rows={[["Metric", "Value"], ...metrics]}
        />
      </div>
      <div className="metric-ribbon">
        {metrics.map(([name, value]) => (
          <div key={name}>
            <span>{toTitle(name)}</span>
            <strong>{formatPercent(value)}</strong>
            <div className="ribbon-track">
              <i
                style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="analytics-main">
        <section className="matrix-study">
          <SectionLabel
            number="01"
            title="The classification field"
            note="Actual × predicted"
          />
          <div className="matrix-controls">
            <span>Improved / clean</span>
            <div className="view-switch">
              <button
                aria-pressed={!normalized}
                className={!normalized ? "active" : ""}
                onClick={() => setNormalized(false)}
              >
                Counts
              </button>
              <button
                aria-pressed={normalized}
                className={normalized ? "active" : ""}
                onClick={() => setNormalized(true)}
              >
                Row %
              </button>
            </div>
          </div>
          {matrix ? (
            <>
              <div className="confusion-plot">
                <span className="matrix-axis-y">ACTUAL CLASS</span>
                <span className="matrix-axis-x">PREDICTED CLASS</span>
                <div className="matrix-col-labels">
                  <span>Benign</span>
                  <span>Injection</span>
                </div>
                <div className="matrix-row-labels">
                  <span>Benign</span>
                  <span>Injection</span>
                </div>
                <div className="matrix-cells">
                  {counts.map((value, index) => {
                    const total = (matrix[Math.floor(index / 2)] || []).reduce(
                      (sum: number, v: number) => sum + v,
                      0,
                    );
                    return (
                      <button
                        key={index}
                        className={`${index === 0 || index === 3 ? "correct" : "incorrect"} ${cell === index ? "selected" : ""}`}
                        style={
                          {
                            "--cell-intensity": Math.max(
                              0.08,
                              (value || 0) / maxCount,
                            ),
                          } as React.CSSProperties
                        }
                        aria-pressed={cell === index}
                        aria-label={`${cellNames[index]}: ${value ?? "unavailable"}`}
                        onClick={() => setCell(index)}
                      >
                        <small>{["TN", "FP", "FN", "TP"][index]}</small>
                        <strong>
                          {value == null
                            ? "—"
                            : normalized
                              ? formatPercent(total ? value / total : null)
                              : formatNumber(value)}
                        </strong>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="matrix-insight" aria-live="polite">
                <span className="mono">{cellNames[cell].toUpperCase()}</span>
                <strong>{formatNumber(counts[cell])}</strong>
                <p>{cellDescriptions[cell]}</p>
              </div>
            </>
          ) : (
            <UnavailableState text="Confusion matrix is not available in the training metadata." />
          )}
        </section>
        <section className="measurement-study">
          <SectionLabel
            number="02"
            title="Measurement profile"
            note="Unit interval / 0–1"
          />
          <div className="measurement-axis">
            <span>0</span>
            <span>0.5</span>
            <span>1.0</span>
          </div>
          {metrics.map(([name, value]) => (
            <div className="measurement-row" key={name}>
              <div>
                <span>{toTitle(name)}</span>
                <strong>{formatPercent(value)}</strong>
              </div>
              <div className="measurement-track">
                <i
                  style={{ left: `${Math.max(0, Math.min(1, value)) * 100}%` }}
                />
              </div>
            </div>
          ))}
          <p className="research-provenance">
            Measurements come from stored training metadata. They describe the
            threshold-based evaluation path, not live request traffic.
          </p>
        </section>
      </div>
      <section className="classification-report">
        <SectionLabel
          number="03"
          title="The class-level evidence"
          note="Classification report"
        />
        {report ? (
          <div
            className="table-wrap"
            tabIndex={0}
            role="region"
            aria-label="Classification report table"
          >
            <table>
              <thead>
                <tr>
                  <th scope="col">Class</th>
                  <th scope="col">Precision</th>
                  <th scope="col">Recall</th>
                  <th scope="col">F1 score</th>
                  <th scope="col">Support</th>
                </tr>
              </thead>
              <tbody>
                {[
                  "benign",
                  "prompt_injection",
                  "macro avg",
                  "weighted avg",
                ].map((name) => {
                  const row = isRecord(report[name]) ? report[name] : null;
                  return row ? (
                    <tr key={name}>
                      <th scope="row">{toTitle(name)}</th>
                      <td>
                        {typeof row.precision === "number"
                          ? formatPercent(row.precision)
                          : "—"}
                      </td>
                      <td>
                        {typeof row.recall === "number"
                          ? formatPercent(row.recall)
                          : "—"}
                      </td>
                      <td>
                        {typeof row["f1-score"] === "number"
                          ? formatPercent(row["f1-score"])
                          : "—"}
                      </td>
                      <td>
                        {typeof row.support === "number"
                          ? formatNumber(row.support)
                          : "—"}
                      </td>
                    </tr>
                  ) : null;
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <UnavailableState text="No class-level report was returned." />
        )}
      </section>
      <MetricDefinitions />
    </ResearchState>
  );
}
