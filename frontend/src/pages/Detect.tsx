import { useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCheck,
  Copy,
  FileText,
  LoaderCircle,
  ScanLine,
  Settings2,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  api,
  formatMs,
  formatPercent,
  MAX_TEXT_LENGTH,
  promptOptions,
} from "../lib/api";
import type { DetectResponse, DetectorType } from "../lib/api";
import { Badge, UnavailableState } from "../components/ui";

function getDraft() {
  try {
    const text = sessionStorage.getItem("injex-draft") || "";
    sessionStorage.removeItem("injex-draft");
    return text;
  } catch {
    return "";
  }
}
export default function Detect() {
  const [text, setText] = useState(getDraft);
  const [detector, setDetector] = useState<DetectorType>("improved");
  const [preprocess, setPreprocess] = useState(true);
  const [result, setResult] = useState<DetectResponse | null>(null);
  const [submitted, setSubmitted] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("Summary");
  const [copied, setCopied] = useState(false);
  const editor = useRef<HTMLTextAreaElement>(null);
  const busy = useRef(false);
  async function run() {
    if (!text.trim() || text.length > MAX_TEXT_LENGTH || busy.current) return;
    busy.current = true;
    setLoading(true);
    setResult(null);
    setError("");
    setSubmitted(text);
    setTab("Summary");
    try {
      setResult(
        await api<DetectResponse>("/detect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, detector, preprocess }),
        }),
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Detection failed. Please try again.",
      );
    } finally {
      setLoading(false);
      busy.current = false;
    }
  }
  const stale =
    result &&
    (text !== submitted ||
      detector !== result.detector ||
      preprocess !== result.preprocessed);
  return (
    <>
      <div className="workspace-toolbar">
        <div>
          <ScanLine size={16} />
          <span>Prompt inspection</span>
          <span className="toolbar-divider" />
          <span className="muted">Single input</span>
        </div>
        <span className="mono">CTRL / ⌘ + ENTER TO RUN</span>
      </div>
      <div className="detection-workspace">
        <section className="editor-panel">
          <div className="panel-heading">
            <div>
              <FileText size={16} />
              <h2>Input prompt</h2>
            </div>
            <button
              className="icon-button"
              onClick={() => {
                setText("");
                setResult(null);
                setError("");
                editor.current?.focus();
              }}
              disabled={loading || !text}
              aria-label="Clear prompt"
              title="Clear prompt"
            >
              <X size={17} />
            </button>
          </div>
          <div className="editor-options">
            <label>
              <Settings2 size={14} />
              <span className="sr-only">Detector</span>
              <select
                aria-label="Detector"
                value={detector}
                disabled={loading}
                onChange={(e) => setDetector(e.target.value as DetectorType)}
              >
                <option value="improved">Improved detector</option>
                <option value="baseline">Baseline detector</option>
              </select>
            </label>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={preprocess}
                disabled={loading}
                onChange={(e) => setPreprocess(e.target.checked)}
              />
              <span className="toggle-track" />
              <span>Normalize</span>
            </label>
          </div>
          <div className="prompt-editor">
            <div className="editor-line-gutter" aria-hidden="true">
              01
              <br />
              02
              <br />
              03
              <br />
              04
              <br />
              05
              <br />
              06
              <br />
              07
              <br />
              08
              <br />
              09
              <br />
              10
            </div>
            <textarea
              ref={editor}
              aria-label="Prompt for evaluation"
              placeholder={
                "Paste a prompt here.\nLook for the instruction behind the words."
              }
              value={text}
              maxLength={MAX_TEXT_LENGTH}
              disabled={loading}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  void run();
                }
              }}
              spellCheck={false}
            />
          </div>
          <div className="editor-status">
            <span>
              <i /> Plain text
            </span>
            <span>{text.length.toLocaleString()} / 20,000 characters</span>
          </div>
          <div className="preset-library">
            <label htmlFor="prompt-preset">START WITH AN EXAMPLE</label>
            <select
              id="prompt-preset"
              value=""
              disabled={loading}
              onChange={(e) => {
                setText(e.target.value);
                editor.current?.focus();
              }}
            >
              <option value="" disabled>
                Choose a research prompt…
              </option>
              {promptOptions.map((option) => (
                <option key={option.text} value={option.text}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="example-chips">
              {[0, 3, 6].map((index) => (
                <button
                  key={index}
                  disabled={loading}
                  onClick={() => setText(promptOptions[index].text)}
                >
                  {
                    [
                      "Instruction override",
                      "Role-play bypass",
                      "Benign request",
                    ][[0, 3, 6].indexOf(index)]
                  }
                </button>
              ))}
            </div>
          </div>
          <div className="editor-bottom">
            <span>Input is processed by the InjeX API.</span>
            <button
              className="primary"
              disabled={!text.trim() || loading}
              onClick={() => void run()}
            >
              {loading ? (
                <LoaderCircle size={17} className="spin" />
              ) : (
                <ScanLine size={17} />
              )}
              {loading ? "Inspecting prompt…" : "Run detection"}
              {!loading ? <ArrowRight size={16} /> : null}
            </button>
          </div>
        </section>
        <section
          className="inspector-panel"
          aria-live="polite"
          aria-busy={loading}
        >
          <div className="panel-heading">
            <div>
              <SlidersHorizontal size={16} />
              <h2>Detection inspector</h2>
            </div>
            <span className="panel-index">OUTPUT / 01</span>
          </div>
          <div
            className="inspector-tabs"
            role="tablist"
            aria-label="Result details"
          >
            {["Summary", "Normalized text", "Response"].map((name) => (
              <button
                role="tab"
                id={`detect-tab-${name.replace(/ /g, "-")}`}
                aria-controls="detect-tab-panel"
                aria-selected={tab === name}
                tabIndex={tab === name ? 0 : -1}
                key={name}
                className={tab === name ? "active" : ""}
                onClick={() => setTab(name)}
                onKeyDown={(event) => {
                  const names = ["Summary", "Normalized text", "Response"];
                  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                    event.preventDefault();
                    const next =
                      names[
                        (names.indexOf(tab) +
                          (event.key === "ArrowRight" ? 1 : 2)) %
                          3
                      ];
                    setTab(next);
                    document
                      .getElementById(`detect-tab-${next.replace(/ /g, "-")}`)
                      ?.focus();
                  }
                }}
              >
                {name}
              </button>
            ))}
          </div>
          {error ? (
            <div className="inspector-content">
              <UnavailableState text={error} />
              <p className="muted">
                Your input is still in the editor. No classification was
                produced.
              </p>
              <button className="secondary" onClick={() => void run()}>
                Try again <ArrowRight size={14} />
              </button>
            </div>
          ) : null}
          {!result && !error ? (
            <div className="inspector-empty">
              <div className={`scan-glyph ${loading ? "is-scanning" : ""}`}>
                <ScanLine size={40} strokeWidth={1} />
              </div>
              <span className="eyebrow">
                {loading ? "REQUEST IN PROGRESS" : "AWAITING INPUT"}
              </span>
              <h3>
                {loading
                  ? "Inspecting your prompt"
                  : "Every signal starts\nwith a prompt."}
              </h3>
              <p>
                {loading
                  ? "Waiting for the research API. Classification and timing will appear when it responds."
                  : "Run a detection to inspect the classification, model score, and normalized input."}
              </p>
              <div className="inspector-empty-stages">
                <span>INPUT</span>
                <i />
                <span>INSPECT</span>
                <i />
                <span>CLASSIFY</span>
              </div>
            </div>
          ) : null}
          {result ? (
            <div
              className="inspector-content"
              role="tabpanel"
              id="detect-tab-panel"
              aria-labelledby={`detect-tab-${tab.replace(/ /g, "-")}`}
            >
              {stale ? (
                <div className="stale-note">
                  Input or settings changed. This result belongs to the previous
                  run.
                </div>
              ) : null}
              {!result.available || result.label === "unavailable" ? (
                <UnavailableState
                  text={
                    result.reason ||
                    "The selected detector did not produce a classification."
                  }
                />
              ) : null}
              {tab === "Summary" ? (
                <>
                  <div className="verdict-heading">
                    <span className="eyebrow">CLASSIFICATION</span>
                    <Badge label={result.label} available={result.available} />
                  </div>
                  <div className="score-display">
                    <strong>
                      {result.available && result.label !== "unavailable"
                        ? formatPercent(result.score)
                        : "—"}
                    </strong>
                    <span>
                      MODEL SCORE
                      <br />
                      <small>Probability for the injection class</small>
                    </span>
                  </div>
                  <div className="score-track">
                    <span
                      style={{
                        width: `${result.available && result.label !== "unavailable" ? (result.score ?? 0) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <p className="score-note">
                    Classification also uses rule overrides. Score alone does
                    not determine the final label.
                  </p>
                  <div className="result-grid">
                    <div>
                      <small>Detector</small>
                      <strong>{result.detector}</strong>
                    </div>
                    <div>
                      <small>Processing duration</small>
                      <strong>{formatMs(result.processing_ms)}</strong>
                    </div>
                    <div>
                      <small>Normalization</small>
                      <strong>
                        {result.preprocessed ? "Enabled" : "Disabled"}
                      </strong>
                    </div>
                    <div>
                      <small>State</small>
                      <strong>
                        {result.available && result.label !== "unavailable"
                          ? "Classified"
                          : "Unavailable"}
                      </strong>
                    </div>
                  </div>
                  <div className="recommendation">
                    <CheckCheck size={18} />
                    <div>
                      <span>RECOMMENDATION</span>
                      <p>{result.recommendation}</p>
                    </div>
                  </div>
                  <details>
                    <summary>Inspect submitted input</summary>
                    <pre>{submitted}</pre>
                  </details>
                </>
              ) : tab === "Normalized text" ? (
                <>
                  <p className="muted">
                    Text returned by the detector after optional Unicode and
                    whitespace normalization.
                  </p>
                  <pre className="normalized-output">
                    {result.normalized_text}
                  </pre>
                </>
              ) : (
                <>
                  <div className="response-heading">
                    <span className="mono">API RESPONSE</span>
                    <button
                      className="icon-button"
                      aria-label="Copy API response"
                      onClick={() => {
                        void navigator.clipboard
                          .writeText(JSON.stringify(result, null, 2))
                          .then(() => setCopied(true))
                          .catch(() => setCopied(false));
                      }}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                </>
              )}
            </div>
          ) : null}
        </section>
      </div>
      <div className="workspace-footnote">
        <span className="mono">RESEARCH NOTE /</span>
        <p>
          A detector classification is a research signal, not a security
          guarantee. Always interpret results in the context of your
          application.
        </p>
      </div>
    </>
  );
}
