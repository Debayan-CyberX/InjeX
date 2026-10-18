import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  ArrowUpRight,
  FileSearch,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { api, useApi, formatPercent, formatMs, formatDate } from "../lib/api";
import type { HistoryResponse, HistorySort, LabelFilter } from "../lib/api";
import { Badge, EmptyState, UnavailableState } from "../components/ui";

export default function HistoryView() {
  const { data, loading, error, reload } = useApi<HistoryResponse>("/history");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<LabelFilter>("all");
  const [sort, setSort] = useState<HistorySort>("newest");
  const [selected, setSelected] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const items = data?.items || [];
  const shown = useMemo(() => {
    const query = search.toLowerCase().trim();
    return items
      .filter(
        (item) =>
          (filter === "all" || item.label === filter) &&
          (!query ||
            `${item.id} ${item.text} ${item.label} ${item.detector || ""}`
              .toLowerCase()
              .includes(query)),
      )
      .sort((a, b) => {
        if (sort === "newest")
          return Date.parse(b.created_at) - Date.parse(a.created_at);
        if (sort === "oldest")
          return Date.parse(a.created_at) - Date.parse(b.created_at);
        if (sort === "score_desc") return (b.score ?? -1) - (a.score ?? -1);
        if (sort === "score_asc") return (a.score ?? 2) - (b.score ?? 2);
        if (sort === "label") return a.label.localeCompare(b.label);
        return (a.detector || "").localeCompare(b.detector || "");
      });
  }, [items, search, filter, sort]);
  const record = items.find((item) => item.id === selected);
  const clear = async () => {
    if (
      deleting ||
      !items.length ||
      !window.confirm("Clear all history entries? This cannot be undone.")
    )
      return;
    setDeleting(true);
    setDeleteError("");
    try {
      await api("/history", { method: "DELETE" });
      setSelected("");
      reload();
    } catch (e) {
      setDeleteError(
        e instanceof Error ? e.message : "Unable to clear history.",
      );
    } finally {
      setDeleting(false);
    }
  };
  return (
    <>
      <div className="forensic-stats">
        <div>
          <span>RECORDED EVENTS</span>
          <strong>
            {loading || error ? "—" : items.length.toString().padStart(2, "0")}
          </strong>
        </div>
        <div>
          <span>INJECTION LABELS</span>
          <strong>
            {loading || error
              ? "—"
              : items
                  .filter(
                    (item) =>
                      item.available && item.label === "prompt_injection",
                  )
                  .length.toString()
                  .padStart(2, "0")}
          </strong>
        </div>
        <p>
          A record of decisions.
          <br />
          <span>Up to 200 events in shared process memory.</span>
        </p>
        <button
          className="danger"
          disabled={loading || deleting || !items.length}
          onClick={() => void clear()}
        >
          <Trash2 size={14} />
          {deleting ? "Clearing…" : "Clear history"}
        </button>
      </div>
      <div className="forensic-toolbar">
        <label className="search-input">
          <Search size={15} />
          <input
            aria-label="Search history"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompt, detector, or event ID…"
          />
        </label>
        <label>
          Classification
          <select
            aria-label="Filter history by classification"
            value={filter}
            onChange={(e) => setFilter(e.target.value as LabelFilter)}
          >
            <option value="all">All classifications</option>
            <option value="prompt_injection">Prompt injection</option>
            <option value="benign">Benign</option>
          </select>
        </label>
        <label>
          <ArrowDownUp size={12} /> Sort
          <select
            aria-label="Sort history"
            value={sort}
            onChange={(e) => setSort(e.target.value as HistorySort)}
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
          className="icon-button"
          disabled={loading || deleting}
          aria-label="Refresh history"
          onClick={reload}
        >
          <RefreshCw className={loading ? "spin" : ""} size={16} />
        </button>
      </div>
      {error || deleteError ? (
        <UnavailableState text={error || deleteError} />
      ) : null}
      <div className="forensic-workspace">
        <section className="event-ledger">
          <div className="ledger-title">
            <span>EVENT / CLASSIFICATION / INPUT</span>
            <span>{shown.length} MATCHING</span>
          </div>
          {loading ? (
            <EmptyState text="Retrieving the event log…" />
          ) : shown.length ? (
            <div className="event-list">
              {shown.map((item) => (
                <button
                  key={item.id}
                  className={`event-row ${selected === item.id ? "selected" : ""}`}
                  onClick={() => setSelected(item.id)}
                  aria-pressed={selected === item.id}
                  aria-label={`Inspect event ${item.id}`}
                >
                  <span
                    className={`event-mark ${item.available && item.label === "prompt_injection" ? "threat" : ""}`}
                  />
                  <span className="event-body">
                    <span className="event-meta">
                      <span>{formatDate(item.created_at)}</span>
                      <Badge label={item.label} available={item.available} />
                    </span>
                    <span className="event-prompt">{item.text}</span>
                    <span className="event-id">
                      {item.id.slice(0, 12)}{" "}
                      <span>/ {item.detector || "Not reported"}</span>
                    </span>
                  </span>
                  <span className="event-score">
                    {item.available ? formatPercent(item.score) : "—"}
                    <ArrowUpRight size={14} />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              text={
                error
                  ? "The event log could not be loaded."
                  : "No events match this investigation. Run a detection or change the filters."
              }
            />
          )}
        </section>
        <aside className="case-inspector">
          <div className="panel-heading">
            <div>
              <FileSearch size={15} />
              <h2>Event evidence</h2>
            </div>
            <span className="panel-index">READ ONLY</span>
          </div>
          {record ? (
            <div className="case-detail">
              <Badge label={record.label} available={record.available} />
              <h3>
                Inspect the
                <br />
                recorded signal.
              </h3>
              <dl>
                <div>
                  <dt>Event ID</dt>
                  <dd>{record.id}</dd>
                </div>
                <div>
                  <dt>Recorded</dt>
                  <dd>{formatDate(record.created_at)}</dd>
                </div>
                <div>
                  <dt>Detector</dt>
                  <dd>{record.detector || "Not reported"}</dd>
                </div>
                <div>
                  <dt>Model score</dt>
                  <dd>
                    {record.available ? formatPercent(record.score) : "—"}
                  </dd>
                </div>
                <div>
                  <dt>Processing</dt>
                  <dd>{formatMs(record.processing_ms)}</dd>
                </div>
              </dl>
              <span className="eyebrow">ORIGINAL INPUT</span>
              <pre className="case-prompt">{record.text}</pre>
              <p className="research-provenance">
                The model score and rule-based label can differ. This record is
                temporary and is shared by users of this API process.
              </p>
            </div>
          ) : (
            <div className="case-empty">
              <FileSearch size={38} strokeWidth={1} />
              <span className="eyebrow">NO EVENT SELECTED</span>
              <h3>
                Every decision
                <br />
                leaves a trace.
              </h3>
              <p>
                Select an event to inspect its input, classification, score, and
                timing.
              </p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
