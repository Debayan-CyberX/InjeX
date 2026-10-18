import { useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Braces,
  ChevronRight,
  FlaskConical,
  Focus,
  GitBranch,
  GitCompareArrows,
  List,
  LoaderCircle,
  Minus,
  Plus,
  Workflow,
} from "lucide-react";
import { api, formatPercent, MAX_TEXT_LENGTH, promptOptions } from "../lib/api";
import type { AttackResponse } from "../lib/api";
import { diffText } from "../lib/diff";
import { Badge, UnavailableState } from "../components/ui";

export default function Attack() {
  const [text, setText] = useState(promptOptions[0].text);
  const [runs, setRuns] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<AttackResponse | null>(null);
  const [selected, setSelected] = useState(0);
  const [view, setView] = useState("Graph");
  const [zoom, setZoom] = useState(1);
  const busy = useRef(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const variant = data?.variants[selected];
  const parts = useMemo(
    () => (variant && data ? diffText(data.original, variant.text) : []),
    [data, variant],
  );
  const graphHeight = Math.max(
    410,
    Math.ceil((data?.variants.length ?? 0) / 2) * 108 + 72,
  );
  const duplicateCount = data
    ? data.variants.length -
      new Set(data.variants.map((item) => item.text)).size
    : 0;
  async function generate() {
    if (busy.current || !text.trim() || text.length > MAX_TEXT_LENGTH) return;
    busy.current = true;
    setLoading(true);
    setError("");
    setData(null);
    setSelected(0);
    try {
      setData(
        await api<AttackResponse>("/adversarial/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, runs }),
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Variant generation failed.");
    } finally {
      setLoading(false);
      busy.current = false;
    }
  }
  return (
    <div className="attack-layout">
      <section className="attack-setup">
        <div className="attack-source">
          <div className="panel-heading">
            <div>
              <Braces size={16} />
              <h2>Source prompt</h2>
            </div>
            <span className="panel-index">EXPERIMENT / INPUT</span>
          </div>
          <textarea
            aria-label="Attack source prompt"
            value={text}
            maxLength={MAX_TEXT_LENGTH}
            disabled={loading}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
          />
          <div className="editor-status">
            <span>{text.length.toLocaleString()} characters</span>
            <button
              className="text-button"
              disabled={loading}
              onClick={() => setText(promptOptions[0].text)}
            >
              Load example <ArrowRight size={13} />
            </button>
          </div>
        </div>
        <div className="attack-config">
          <span className="eyebrow">TEST CONFIGURATION</span>
          <label htmlFor="variant-count">
            Generated variants <span>01—20</span>
          </label>
          <div className="variant-count">
            <button
              aria-label="Fewer variants"
              disabled={runs <= 1 || loading}
              onClick={() => setRuns((value) => value - 1)}
            >
              <Minus size={16} />
            </button>
            <input
              id="variant-count"
              type="number"
              min={1}
              max={20}
              value={runs}
              disabled={loading}
              onChange={(e) =>
                setRuns(Math.max(1, Math.min(20, Number(e.target.value) || 1)))
              }
            />
            <button
              aria-label="More variants"
              disabled={runs >= 20 || loading}
              onClick={() => setRuns((value) => value + 1)}
            >
              <Plus size={16} />
            </button>
          </div>
          <p>
            Randomized combinations of 2–4 transformations. Evaluated by the
            improved detector.
          </p>
          <button
            className="primary"
            disabled={!text.trim() || loading}
            onClick={() => void generate()}
          >
            {loading ? (
              <LoaderCircle className="spin" size={16} />
            ) : (
              <FlaskConical size={16} />
            )}
            {loading ? "Running experiment…" : "Generate variants"}
            <ArrowRight size={15} />
          </button>
        </div>
      </section>
      <div className="lab-workspace">
        <div className="lab-toolbar">
          <div
            className="view-switch"
            role="group"
            aria-label="Experiment view"
          >
            {[
              { name: "Graph", icon: Workflow },
              { name: "List", icon: List },
              { name: "Compare", icon: GitCompareArrows },
            ].map(({ name, icon: Icon }) => (
              <button
                key={name}
                className={view === name ? "active" : ""}
                aria-pressed={view === name}
                onClick={() => setView(name)}
              >
                <Icon size={15} />
                {name}
              </button>
            ))}
          </div>
          <span className="mono">
            {data
              ? `${data.variants.length} VARIANTS / ${new Set(data.variants.map((item) => item.text)).size} UNIQUE`
              : "NO EXPERIMENT LOADED"}
          </span>
        </div>
        {error ? <UnavailableState text={error} /> : null}
        {data?.reason ? <UnavailableState text={data.reason} /> : null}
        {data && text !== data.original ? (
          <div className="stale-note">
            Source changed. The experiment below belongs to the last submitted
            prompt.
          </div>
        ) : null}
        {!data ? (
          <div className="lab-empty" aria-live="polite" aria-busy={loading}>
            <div className="empty-graph" aria-hidden="true">
              <i />
              <span />
              <i />
              <span />
              <i />
            </div>
            <p className="eyebrow">
              {loading ? "EXPERIMENT IN PROGRESS" : "THE ADVERSARIAL CANVAS"}
            </p>
            <h3>
              {loading
                ? "Generating your experiment."
                : "One input. Many ways to hide it."}
            </h3>
            <p>
              {loading
                ? "Waiting for the API to transform and evaluate the source prompt."
                : "Generate variants to map the relationship between an original prompt and its obfuscated forms."}
            </p>
            <div className="lab-empty-legend">
              <span>
                <i /> Source prompt
              </span>
              <span>
                <i /> Generated variant
              </span>
              <span>
                <i /> Detector result
              </span>
            </div>
          </div>
        ) : data.variants.length === 0 ? (
          <div className="lab-empty">
            <h3>No variants returned.</h3>
            <p>The API returned an empty experiment. Try generating again.</p>
          </div>
        ) : (
          <div
            className={`lab-results ${view === "Compare" ? "compare-mode" : ""}`}
          >
            <div className="lab-canvas-area">
              {view === "Graph" ? (
                <>
                  <div className="graph-scroll" ref={canvasRef}>
                    <div
                      style={{ width: 960 * zoom, height: graphHeight * zoom }}
                    >
                      <div
                        className="graph-canvas"
                        style={{
                          width: 960,
                          height: graphHeight,
                          transform: `scale(${zoom})`,
                        }}
                      >
                        <svg
                          width="960"
                          height={graphHeight}
                          aria-hidden="true"
                        >
                          {data.variants.map((_, index) => {
                            const x = 390 + (index % 2) * 280,
                              y = Math.floor(index / 2) * 108 + 48;
                            return (
                              <path
                                className={
                                  selected === index
                                    ? "graph-edge selected"
                                    : "graph-edge"
                                }
                                key={index}
                                d={`M 266 ${graphHeight / 2} C 330 ${graphHeight / 2}, ${x - 60} ${y + 37}, ${x} ${y + 37}`}
                              />
                            );
                          })}
                        </svg>
                        <div
                          className="graph-source"
                          style={{ top: graphHeight / 2 - 43 }}
                        >
                          <span className="mono">
                            <Braces size={12} /> ORIGINAL INPUT
                          </span>
                          <p>{data.original}</p>
                          <span className="source-port" />
                        </div>
                        {data.variants.map((item, index) => (
                          <button
                            className={`graph-node ${selected === index ? "selected" : ""}`}
                            key={index}
                            style={{
                              left: 390 + (index % 2) * 280,
                              top: Math.floor(index / 2) * 108 + 48,
                            }}
                            onClick={() => setSelected(index)}
                            aria-label={`Inspect variant ${index + 1}, ${data.available ? item.label : "unavailable"}`}
                            aria-pressed={selected === index}
                          >
                            <span className="node-top">
                              <GitBranch size={12} /> VARIANT{" "}
                              {String(index + 1).padStart(2, "0")}
                              <ChevronRight size={12} />
                            </span>
                            <span className="node-snippet">{item.text}</span>
                            <span
                              className={`node-classification ${data.available ? item.label : "unavailable"}`}
                            >
                              <i />
                              {!data.available || item.label === "unavailable"
                                ? "Unavailable"
                                : item.label === "benign"
                                  ? "Benign"
                                  : "Prompt injection"}
                              <span>
                                {data.available
                                  ? formatPercent(item.score)
                                  : "—"}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="graph-bottom">
                    <span>SELECT A NODE TO INSPECT · SCROLL TO EXPLORE</span>
                    <div>
                      <button
                        className="icon-button"
                        aria-label="Zoom out"
                        disabled={zoom <= 0.6}
                        onClick={() =>
                          setZoom((value) => Math.max(0.6, value - 0.1))
                        }
                      >
                        <Minus size={14} />
                      </button>
                      <span>{Math.round(zoom * 100)}%</span>
                      <button
                        className="icon-button"
                        aria-label="Zoom in"
                        disabled={zoom >= 1.4}
                        onClick={() =>
                          setZoom((value) => Math.min(1.4, value + 0.1))
                        }
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label="Reset graph zoom"
                        onClick={() => {
                          setZoom(1);
                          canvasRef.current?.scrollTo({ left: 0, top: 0 });
                        }}
                      >
                        <Focus size={15} />
                      </button>
                    </div>
                  </div>
                </>
              ) : view === "List" ? (
                <div
                  className="table-wrap"
                  tabIndex={0}
                  role="region"
                  aria-label="Experiment variants table"
                >
                  <table>
                    <thead>
                      <tr>
                        <th>Variant</th>
                        <th>Classification</th>
                        <th>Score</th>
                        <th>Prompt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.variants.map((item, index) => (
                        <tr
                          key={index}
                          className={selected === index ? "selected-row" : ""}
                        >
                          <td>
                            <button
                              className="text-button"
                              onClick={() => setSelected(index)}
                            >
                              V{String(index + 1).padStart(2, "0")}{" "}
                              <ArrowRight size={12} />
                            </button>
                          </td>
                          <td>
                            <Badge
                              label={item.label}
                              available={data.available}
                            />
                          </td>
                          <td>
                            {data.available ? formatPercent(item.score) : "—"}
                          </td>
                          <td className="truncate-cell">{item.text}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="compare-source">
                  <span className="eyebrow">ORIGINAL / SOURCE</span>
                  <pre>{data.original}</pre>
                  <div className="comparison-explanation">
                    <GitCompareArrows size={24} strokeWidth={1} />
                    <p>
                      Compare the submitted prompt with the selected variant.
                      Insertions and removals are highlighted in the inspector.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <aside className="variant-inspector">
              <div className="panel-heading">
                <div>
                  <GitBranch size={15} />
                  <h2>Variant inspector</h2>
                </div>
                <span className="panel-index">
                  {String(selected + 1).padStart(2, "0")}
                </span>
              </div>
              <label className="variant-select">
                Inspect variant
                <select
                  aria-label="Inspect variant"
                  value={selected}
                  onChange={(e) => setSelected(Number(e.target.value))}
                >
                  {data.variants.map((_, index) => (
                    <option value={index} key={index}>
                      Variant {String(index + 1).padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </label>
              {variant ? (
                <>
                  <Badge label={variant.label} available={data.available} />
                  <div className="variant-score">
                    <span>MODEL SCORE</span>
                    <strong>
                      {data.available && variant.label !== "unavailable"
                        ? formatPercent(variant.score)
                        : "—"}
                    </strong>
                  </div>
                  <div className="diff-heading">
                    <span>CHANGES FROM SOURCE</span>
                    <div>
                      <span>
                        <i className="added-key" /> Added
                      </span>
                      <span>
                        <i className="removed-key" /> Removed
                      </span>
                    </div>
                  </div>
                  <pre className="diff-output">
                    {parts.map((part, index) =>
                      part.kind === "same" ? (
                        <span key={index}>{part.text}</span>
                      ) : part.kind === "added" ? (
                        <ins key={index}>{part.text}</ins>
                      ) : (
                        <del key={index}>{part.text}</del>
                      ),
                    )}
                  </pre>
                  <details>
                    <summary>Transformed text</summary>
                    <pre>{variant.text}</pre>
                  </details>
                  <details>
                    <summary>Normalized text</summary>
                    <pre>{variant.normalized_text}</pre>
                  </details>
                  <p className="inspector-explanation">
                    The API applies randomized transformations. Technique
                    attribution is not returned. Repeated or unchanged variants
                    can occur.
                  </p>
                </>
              ) : null}
            </aside>
          </div>
        )}
      </div>
      <div className="workspace-footnote">
        <span className="mono">EXPERIMENT NOTES /</span>
        <p>
          {duplicateCount
            ? `${duplicateCount} duplicate variant${duplicateCount === 1 ? "" : "s"} returned. All generated outputs are retained. `
            : ""}
          Variants are not a claim of successful bypass. The original prompt is
          not separately classified by this endpoint.
        </p>
      </div>
    </div>
  );
}
