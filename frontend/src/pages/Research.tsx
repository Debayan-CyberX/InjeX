import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Database,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import {
  useApi,
  api,
  formatPercent,
  formatNumber,
  formatMs,
  formatDate,
  toTitle,
  isRecord,
} from "../lib/api";
import type {
  ComparisonResponse,
  MetricsResponse,
  HistoryItem,
  HistoryResponse,
  LabelFilter,
  HistorySort,
  DatasetSummaryResponse,
} from "../lib/api";
import { Card, EmptyState, UnavailableState } from "../components/ui";
import { ResearchBlank, MetricDefinitions } from "../components/ResearchStates";

function MetricTrack({
  row,
  max,
}: {
  row: {
    metric: string;
    baseline: number | undefined;
    improved: number | undefined;
  };
  max: number;
}) {
  const baseline = typeof row.baseline === "number" ? row.baseline : null;
  const improved = typeof row.improved === "number" ? row.improved : null;
  const delta =
    baseline !== null && improved !== null ? improved - baseline : null;
  const percent = (value: number | null) =>
    value === null ? 0 : Math.min(100, (value / max) * 100);

  return (
    <div className="metric-track-row">
      <div className="metric-track-label">
        <span>{toTitle(row.metric)}</span>
        {delta !== null ? (
          <strong
            className={
              (row.metric === "false_positive_rate" ? delta <= 0 : delta >= 0)
                ? "delta-positive"
                : "delta-negative"
            }
          >
            {delta >= 0 ? "+" : ""}
            {(delta * 100).toFixed(2)} pp
          </strong>
        ) : null}
      </div>
      <div className="metric-track">
        <div
          className="metric-track-line baseline-line"
          style={{ width: `${percent(baseline)}%` }}
        >
          <span>{formatPercent(baseline)}</span>
        </div>
        <div
          className="metric-track-line improved-line"
          style={{ width: `${percent(improved)}%` }}
        >
          <span>{formatPercent(improved)}</span>
        </div>
      </div>
    </div>
  );
}

export function Comparison() {
  const [data, setData] = useState<ComparisonResponse | null>(null);
  const [error, setError] = useState("");
  const [selectedScenario, setSelectedScenario] = useState("");

  useEffect(() => {
    let cancelled = false;
    api<ComparisonResponse>("/comparison")
      .then((response) => {
        if (cancelled) {
          return;
        }
        setData(response);
        const firstScenario =
          Object.keys(response.improved || {})[0] ||
          Object.keys(response.baseline || {})[0] ||
          "";
        setSelectedScenario(firstScenario);
      })
      .catch((requestError: Error) => {
        if (!cancelled) {
          setData(null);
          setError(requestError.message || "Comparison unavailable");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const scenarios = useMemo(() => {
    const set = new Set<string>([
      ...Object.keys(data?.baseline || {}),
      ...Object.keys(data?.improved || {}),
    ]);
    return Array.from(set);
  }, [data]);

  const metricRows = useMemo(() => {
    if (!selectedScenario || !data) {
      return [];
    }
    const baselineMetrics = data.baseline[selectedScenario] || {};
    const improvedMetrics = data.improved[selectedScenario] || {};
    const metrics = new Set<string>([
      ...Object.keys(baselineMetrics),
      ...Object.keys(improvedMetrics),
    ]);
    return Array.from(metrics).map((metric) => ({
      metric,
      baseline: baselineMetrics[metric],
      improved: improvedMetrics[metric],
    }));
  }, [data, selectedScenario]);

  const performanceRows = metricRows.filter(
    (row) => row.metric !== "false_positive_rate",
  );
  const errorRows = metricRows.filter(
    (row) => row.metric === "false_positive_rate",
  );

  if (error) {
    return (
      <>
        <ResearchBlank
          title="Evidence makes the difference."
          description="Compare clean and adversarial evaluation scenarios once training metadata is available. No results have been loaded."
          reason={error}
        />
        <MetricDefinitions />
      </>
    );
  }

  if (!data) {
    return <EmptyState text="Loading comparison data…" />;
  }

  if (!data.available) {
    return (
      <>
        <ResearchBlank
          title="The experiment needs its evidence."
          description="The API is available, but comparison metadata has not been loaded. Train the models to create clean and adversarial evaluations."
          reason={data.reason || "Comparison metadata unavailable"}
        />
        <MetricDefinitions />
      </>
    );
  }

  return (
    <>
      <Card
        title="Detector comparison"
        subtitle={data.dataset || "Dataset not reported"}
      >
        <div className="controls-row">
          <label>
            Evaluation scenario
            <select
              value={selectedScenario}
              onChange={(event) => setSelectedScenario(event.target.value)}
            >
              {scenarios.map((scenario) => (
                <option key={scenario} value={scenario}>
                  {toTitle(scenario)}
                </option>
              ))}
            </select>
          </label>
        </div>
        {metricRows.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Baseline</th>
                  <th>Improved</th>
                  <th>Difference</th>
                </tr>
              </thead>
              <tbody>
                {metricRows.map((row) => {
                  const delta =
                    row.baseline !== undefined && row.improved !== undefined
                      ? row.improved - row.baseline
                      : undefined;
                  return (
                    <tr key={row.metric}>
                      <td>{toTitle(row.metric)}</td>
                      <td>{formatPercent(row.baseline)}</td>
                      <td>{formatPercent(row.improved)}</td>
                      <td>
                        {delta === undefined
                          ? "—"
                          : `${delta >= 0 ? "+" : ""}${(delta * 100).toFixed(2)} pp`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <UnavailableState text="Scenario metrics are unavailable." />
        )}
      </Card>

      <Card title="Metric chart" subtitle="Baseline and improved detectors">
        {metricRows.length ? (
          <div className="metric-chart">
            <div className="metric-chart-legend" aria-label="Chart legend">
              <span>
                <i className="legend-swatch baseline-swatch" />
                Baseline
              </span>
              <span>
                <i className="legend-swatch improved-swatch" />
                Improved
              </span>
              <span className="metric-chart-scale">Scale: 0–100%</span>
            </div>
            <div className="metric-track-list">
              {performanceRows.map((row) => (
                <MetricTrack key={row.metric} row={row} max={1} />
              ))}
            </div>
            {errorRows.length ? (
              <div className="metric-chart-error">
                <div className="metric-chart-error-heading">
                  <span>False-positive rate</span>
                  <span>Scale: 0–100% · lower is better</span>
                </div>
                {errorRows.map((row) => (
                  <MetricTrack key={row.metric} row={row} max={1} />
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <UnavailableState text="The chart is unavailable for this scenario." />
        )}
      </Card>
      <MetricDefinitions />
      <p className="research-provenance">
        Training evaluations use model thresholds. Interactive detection
        additionally applies rule overrides; these results measure different
        prediction paths.
      </p>
    </>
  );
}

export function Analytics() {
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api<MetricsResponse>("/metrics")
      .then((response) => {
        if (!cancelled) {
          setData(response);
        }
      })
      .catch((requestError: Error) => {
        if (!cancelled) {
          setError(
            requestError.message || "Evaluation metrics are unavailable.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const metadata = isRecord(data?.metadata) ? data?.metadata : null;
  const evaluation =
    metadata && isRecord(metadata.evaluation) ? metadata.evaluation : null;
  const confusionMatrix = Array.isArray(evaluation?.confusion_matrix)
    ? (evaluation.confusion_matrix.filter(Array.isArray) as number[][])
    : null;
  const classificationReport = isRecord(evaluation?.classification_report)
    ? evaluation.classification_report
    : null;

  if (!data && !error)
    return <EmptyState text="Loading evaluation evidence…" />;
  if (error || !data?.available)
    return (
      <>
        <ResearchBlank
          title="Read the model, through its measurements."
          description="Accuracy, precision, recall, and the confusion matrix appear here when evaluation metadata is available."
          reason={
            error || data?.reason || "Evaluation metrics are unavailable."
          }
        />
        <MetricDefinitions />
      </>
    );

  return (
    <>
      <Card title="Model evaluation metrics">
        {error ? <UnavailableState text={error} /> : null}
        {data?.available ? (
          <div className="metric-list">
            {Object.entries(data.metrics).map(([name, value]) => (
              <div className="metric-item" key={name}>
                <span>{toTitle(name)}</span>
                <strong>{formatPercent(value)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <UnavailableState
            text={data?.reason || "Evaluation metrics are unavailable."}
          />
        )}
      </Card>

      <div className="split-grid">
        <Card title="Confusion matrix">
          {confusionMatrix ? (
            <div className="matrix-wrap">
              <table className="matrix-table">
                <caption>Improved detector · clean test set</caption>
                <thead>
                  <tr>
                    <th scope="col">Actual \ Predicted</th>
                    <th scope="col">Benign</th>
                    <th scope="col">Injection</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Benign</th>
                    <td>{confusionMatrix[0]?.[0] ?? "—"}</td>
                    <td>{confusionMatrix[0]?.[1] ?? "—"}</td>
                  </tr>
                  <tr>
                    <th scope="row">Injection</th>
                    <td>{confusionMatrix[1]?.[0] ?? "—"}</td>
                    <td>{confusionMatrix[1]?.[1] ?? "—"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <UnavailableState text="Confusion matrix is not available for this evaluation." />
          )}
        </Card>
        <Card title="Classification report">
          {classificationReport ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Precision</th>
                    <th>Recall</th>
                    <th>F1</th>
                    <th>Support</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    "benign",
                    "prompt_injection",
                    "accuracy",
                    "macro avg",
                    "weighted avg",
                  ].map((label) => {
                    const row = isRecord(classificationReport[label])
                      ? classificationReport[label]
                      : null;
                    return row ? (
                      <tr key={label}>
                        <td>{toTitle(label)}</td>
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
            <UnavailableState text="Classification report is not available for this evaluation." />
          )}
        </Card>
      </div>
      <MetricDefinitions />
      <p className="research-provenance">
        Stored evaluation / improved detector / clean test set. These are
        training-time measurements, not live telemetry.
      </p>
    </>
  );
}

export function HistoryView() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [searchText, setSearchText] = useState("");
  const [labelFilter, setLabelFilter] = useState<LabelFilter>("all");
  const [sort, setSort] = useState<HistorySort>("newest");
  const [selectedId, setSelectedId] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  async function loadHistory() {
    setLoading(true);
    try {
      const response = await api<HistoryResponse>("/history");
      setItems(response.items);
      setError("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Detection history is unavailable.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadHistory();
  }, []);

  const shownItems = useMemo(() => {
    const lowerSearch = searchText.trim().toLowerCase();
    const filtered = items.filter((item) => {
      if (labelFilter !== "all" && item.label !== labelFilter) {
        return false;
      }
      if (!lowerSearch) {
        return true;
      }
      return (
        item.text.toLowerCase().includes(lowerSearch) ||
        item.label.toLowerCase().includes(lowerSearch) ||
        (item.detector || "").toLowerCase().includes(lowerSearch)
      );
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sort === "newest")
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      if (sort === "oldest")
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      if (sort === "score_desc") return (b.score ?? -1) - (a.score ?? -1);
      if (sort === "score_asc") return (a.score ?? 2) - (b.score ?? 2);
      if (sort === "label") return a.label.localeCompare(b.label);
      return (a.detector || "").localeCompare(b.detector || "");
    });
    return sorted;
  }, [items, labelFilter, searchText, sort]);

  const selectedItem = shownItems.find((item) => item.id === selectedId);

  async function clearHistory() {
    if (deleting || loading) return;
    if (!window.confirm("Clear all history entries? This cannot be undone.")) {
      return;
    }
    setDeleting(true);
    try {
      await api<{ ok: boolean }>("/history", { method: "DELETE" });
      setItems([]);
      setSelectedId("");
      setError("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to clear history",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Card
        title="Detection history"
        subtitle={
          loading
            ? "Loading records?"
            : `${shownItems.length} records / up to 200 in shared process memory`
        }
      >
        <div className="history-toolbar">
          <button
            className="icon-button"
            onClick={() => void loadHistory()}
            disabled={loading || deleting}
            aria-label="Refresh history"
          >
            <RefreshCw size={15} className={loading ? "spin" : ""} />
          </button>
          <label className="search-input">
            <Search size={14} />
            <input
              aria-label="Search history"
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search input, label, or detector"
            />
          </label>
          <label>
            Label
            <select
              value={labelFilter}
              onChange={(event) =>
                setLabelFilter(event.target.value as LabelFilter)
              }
            >
              <option value="all">All</option>
              <option value="prompt_injection">Prompt injection</option>
              <option value="benign">Benign</option>
            </select>
          </label>
          <label>
            Sort
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as HistorySort)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="score_desc">Score high to low</option>
              <option value="score_asc">Score low to high</option>
              <option value="label">Label A–Z</option>
              <option value="detector">Detector A–Z</option>
            </select>
          </label>
          <button
            type="button"
            className="danger"
            disabled={loading || deleting || !items.length}
            onClick={clearHistory}
          >
            <Trash2 size={14} />
            Clear history
          </button>
        </div>

        {error ? <UnavailableState text={error} /> : null}

        {shownItems.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Label</th>
                  <th>Score</th>
                  <th>Detector</th>
                  <th>Processing</th>
                  <th>Text</th>
                </tr>
              </thead>
              <tbody>
                {shownItems.map((item) => (
                  <tr
                    tabIndex={0}
                    aria-label={`Inspect record ${item.id}`}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedId(item.id);
                      }
                    }}
                    key={item.id}
                    className={selectedId === item.id ? "selected-row" : ""}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <td>{formatDate(item.created_at)}</td>
                    <td>{item.label}</td>
                    <td>{formatPercent(item.score)}</td>
                    <td>{item.detector || "—"}</td>
                    <td>{formatMs(item.processing_ms)}</td>
                    <td className="truncate-cell" title={item.text}>
                      {item.text}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            text={
              loading
                ? "Loading detection history?"
                : error
                  ? "Detection history could not be loaded."
                  : "No detection records match the selected filters."
            }
          />
        )}
      </Card>

      <Card title="Selected record">
        {selectedItem ? (
          <div className="detail-grid">
            <div>
              <small>ID</small>
              <p>{selectedItem.id}</p>
            </div>
            <div>
              <small>Created at</small>
              <p>{formatDate(selectedItem.created_at)}</p>
            </div>
            <div>
              <small>Label</small>
              <p>{selectedItem.label}</p>
            </div>
            <div>
              <small>Score</small>
              <p>{formatPercent(selectedItem.score)}</p>
            </div>
            <div>
              <small>Detector</small>
              <p>{selectedItem.detector || "—"}</p>
            </div>
            <div>
              <small>Processing</small>
              <p>{formatMs(selectedItem.processing_ms)}</p>
            </div>
            <div className="detail-full">
              <small>Prompt text</small>
              <pre>{selectedItem.text}</pre>
            </div>
          </div>
        ) : (
          <EmptyState text="Select a record to view its details." />
        )}
      </Card>
    </>
  );
}

export function Dataset() {
  const { data, error, loading } =
    useApi<DatasetSummaryResponse>("/dataset/summary");
  const total = data
    ? Object.values(data.splits).reduce((sum, value) => sum + value, 0)
    : 0;
  const labelTotal = data
    ? Object.values(data.labels).reduce((sum, value) => sum + value, 0)
    : 0;
  if (loading) return <EmptyState text="Loading dataset information?" />;
  return (
    <>
      <Card title="The evaluation corpus" subtitle="DATA SOURCE / HUGGING FACE">
        <div className="dataset-identity">
          <Database size={32} strokeWidth={1} />
          <div>
            <p className="eyebrow">PROMPT-INJECTION RESEARCH</p>
            <h2>{data?.name || "neuralchemy/Prompt-injection-dataset"}</h2>
            <p>
              Configuration: core <span> / </span>
              {data?.available
                ? `${formatNumber(total)} examples across reported splits`
                : "Dataset information unavailable"}
            </p>
          </div>
          <a
            className="icon-button"
            aria-label="View dataset source"
            href="https://huggingface.co/datasets/neuralchemy/Prompt-injection-dataset"
            target="_blank"
            rel="noreferrer"
          >
            <ArrowUpRight size={20} />
          </a>
        </div>
        {error || data?.reason ? (
          <UnavailableState
            text={error || data?.reason || "Dataset unavailable"}
          />
        ) : null}
      </Card>
      <div className="split-grid">
        <Card title="Dataset splits" subtitle="EXAMPLES PER SPLIT">
          {data?.available && Object.keys(data.splits).length ? (
            <div className="dataset-bar-list">
              {Object.entries(data.splits).map(([name, count]) => (
                <div key={name}>
                  <div className="dataset-bar-label">
                    <span>{toTitle(name)}</span>
                    <strong>{formatNumber(count)}</strong>
                  </div>
                  <div className="dataset-bar-track">
                    <span
                      style={{ width: `${total ? (count / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="Split counts appear when the dataset can be loaded by the API." />
          )}
        </Card>
        <Card title="Class distribution" subtitle="TRAINING SPLIT ONLY">
          {data?.available && Object.keys(data.labels).length ? (
            <div className="dataset-bar-list">
              {Object.entries(data.labels).map(([name, count]) => (
                <div key={name}>
                  <div className="dataset-bar-label">
                    <span>
                      {name === "0"
                        ? "0 / Benign"
                        : name === "1"
                          ? "1 / Prompt injection"
                          : name}
                    </span>
                    <strong>{formatNumber(count)}</strong>
                  </div>
                  <div className="dataset-bar-track">
                    <span
                      style={{
                        width: `${labelTotal ? (count / labelTotal) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="Training-label counts appear when the dataset is available." />
          )}
        </Card>
      </div>
      <Card title="How the data enters the experiment" subtitle="METHODOLOGY">
        <div className="dataset-methodology">
          <div>
            <span className="mono">01 / TRAIN</span>
            <h4>Original & augmented</h4>
            <p>
              The baseline uses original training prompts. The improved model
              adds two transformed versions of each injection example.
            </p>
          </div>
          <div>
            <span className="mono">02 / VALIDATE</span>
            <h4>Choose a threshold</h4>
            <p>
              Each model?s decision threshold is selected by accuracy on the
              validation split.
            </p>
          </div>
          <div>
            <span className="mono">03 / TEST</span>
            <h4>Measure both surfaces</h4>
            <p>
              Both models are evaluated against the same clean test inputs and
              an adversarially transformed test set.
            </p>
          </div>
        </div>
      </Card>
      <p className="research-provenance">
        Split counts cover the loaded dataset; class distribution covers the
        training split only. Augmented samples are not included in the source
        dataset counts.
      </p>
    </>
  );
}
