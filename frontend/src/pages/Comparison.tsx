import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Equal,
  GitCompareArrows,
} from "lucide-react";
import { useApi, formatPercent, toTitle } from "../lib/api";
import type { ComparisonResponse } from "../lib/api";
import {
  ResearchState,
  SectionLabel,
  ExportData,
} from "../components/ResearchUI";
import { MetricDefinitions } from "../components/ResearchStates";

export default function Comparison() {
  const { data, loading, error, reload } =
    useApi<ComparisonResponse>("/comparison");
  const [scenario, setScenario] = useState("clean");
  const [focus, setFocus] = useState("accuracy");
  const scenarios = [
    ...new Set([
      ...Object.keys(data?.baseline || {}),
      ...Object.keys(data?.improved || {}),
    ]),
  ];
  const selected = scenarios.includes(scenario) ? scenario : scenarios[0] || "";
  const baseline = data?.baseline[selected] || {};
  const improved = data?.improved[selected] || {};
  const metrics = [
    ...new Set([...Object.keys(baseline), ...Object.keys(improved)]),
  ];
  const selectedMetric = metrics.includes(focus)
    ? focus
    : metrics[0] || "accuracy";
  const delta =
    baseline[selectedMetric] != null && improved[selectedMetric] != null
      ? improved[selectedMetric] - baseline[selectedMetric]
      : null;
  const better =
    delta !== null &&
    (selectedMetric === "false_positive_rate" ? delta < 0 : delta > 0);
  return (
    <ResearchState
      loading={loading}
      error={error}
      available={data?.available}
      reason={data?.reason}
      retry={reload}
    >
      <div className="benchmark-toolbar">
        <div
          className="view-switch"
          role="group"
          aria-label="Benchmark scenario"
        >
          {scenarios.map((name) => (
            <button
              key={name}
              aria-pressed={selected === name}
              className={selected === name ? "active" : ""}
              onClick={() => setScenario(name)}
            >
              {toTitle(name)}
            </button>
          ))}
        </div>

        <ExportData
          filename={`injex-${selected}-benchmark.csv`}
          rows={[
            [
              `Scenario: ${selected}`,
              "Baseline",
              "Improved",
              "Difference (pp)",
            ],
            ...metrics.map((name) => [
              name,
              baseline[name],
              improved[name],
              baseline[name] != null && improved[name] != null
                ? (improved[name] - baseline[name]) * 100
                : null,
            ]),
          ]}
        />
      </div>
      <section className="benchmark-duel">
        <div className="duel-model">
          <span className="eyebrow">01 / BASELINE</span>
          <strong>{formatPercent(baseline[selectedMetric])}</strong>
          <span>Original training distribution</span>
        </div>
        <div className="duel-middle">
          <GitCompareArrows size={20} strokeWidth={1} />
          <span>{toTitle(selectedMetric)}</span>

          <span
            className={`metric-delta ${delta === 0 ? "" : better ? "favorable" : "unfavorable"}`}
          >
            {delta === null ? (
              "—"
            ) : delta === 0 ? (
              <Equal size={14} />
            ) : better ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}
            {delta === null
              ? "Not reported"
              : `${delta > 0 ? "+" : ""}${(delta * 100).toFixed(2)} pp`}
          </span>
          <small>
            {selectedMetric === "false_positive_rate"
              ? "Lower is better"
              : "Higher is better"}
          </small>
        </div>
        <div className="duel-model improved">
          <span className="eyebrow">02 / IMPROVED</span>
          <strong>{formatPercent(improved[selectedMetric])}</strong>
          <span>Adversarially augmented training</span>
        </div>
      </section>
      <section className="benchmark-chart">
        <SectionLabel
          number="01"
          title="The performance spectrum"
          note={`${toTitle(selected)} evaluation / 0–100%`}
        />
        <div className="chart-legend">
          <span>
            <i className="baseline-key" /> Baseline
          </span>
          <span>
            <i className="improved-key" /> Improved
          </span>
          <span>Select a metric to inspect its headline</span>
        </div>
        <div className="benchmark-scale">
          <span>METRIC</span>
          <div>
            {[0, 25, 50, 75, 100].map((value) => (
              <span key={value}>{value}%</span>
            ))}
          </div>
          <span>Δ PP</span>
        </div>
        {metrics.map((name) => {
          const b = baseline[name],
            v = improved[name];
          const d = b != null && v != null ? v - b : null;
          const favorable =
            d !== null && (name === "false_positive_rate" ? d < 0 : d > 0);
          return (
            <button
              key={name}
              className={`benchmark-row ${selectedMetric === name ? "selected" : ""}`}
              onClick={() => setFocus(name)}
              aria-pressed={selectedMetric === name}
            >
              <span>{toTitle(name)}</span>
              <span className="benchmark-plot">
                {b != null && v != null ? (
                  <i
                    className="benchmark-connector"
                    style={{
                      left: `${Math.min(b, v) * 100}%`,
                      width: `${Math.abs(v - b) * 100}%`,
                    }}
                  />
                ) : null}
                {b != null ? (
                  <i
                    className="benchmark-dot baseline-dot"
                    title={`Baseline: ${formatPercent(b)}`}
                    style={{ left: `${b * 100}%` }}
                  />
                ) : null}
                {v != null ? (
                  <i
                    className="benchmark-dot improved-dot"
                    title={`Improved: ${formatPercent(v)}`}
                    style={{ left: `${v * 100}%` }}
                  />
                ) : null}
              </span>
              <span
                className={
                  d === 0 ? "" : favorable ? "favorable" : "unfavorable"
                }
              >
                {d === null
                  ? "—"
                  : `${d > 0 ? "+" : ""}${(d * 100).toFixed(2)}`}
              </span>
            </button>
          );
        })}
        <div
          className="benchmark-numeric table-wrap"
          tabIndex={0}
          role="region"
          aria-label="Exact benchmark values table"
        >
          <table>
            <caption>Exact benchmark values</caption>
            <thead>
              <tr>
                <th scope="col">Metric</th>
                <th scope="col">Baseline</th>
                <th scope="col">Improved</th>
                <th scope="col">Difference</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((name) => (
                <tr key={name}>
                  <th scope="row">{toTitle(name)}</th>
                  <td>{formatPercent(baseline[name])}</td>
                  <td>{formatPercent(improved[name])}</td>
                  <td>
                    {baseline[name] != null && improved[name] != null
                      ? `${((improved[name] - baseline[name]) * 100).toFixed(2)} pp`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="research-context">
        <span className="eyebrow">READ THE CONDITIONS</span>
        <p>
          Both detectors are evaluated against the same test labels. A positive
          delta is not always an improvement: false-positive rate should
          decrease. Training evaluations use thresholds; interactive detection
          additionally uses rule overrides.
        </p>
        <span className="mono">
          SOURCE / {data?.dataset || "Dataset not reported"}
        </span>
      </div>
      <MetricDefinitions />
    </ResearchState>
  );
}
