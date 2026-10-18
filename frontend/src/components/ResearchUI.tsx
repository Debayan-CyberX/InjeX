import { Download, RefreshCw } from "lucide-react";
import { EmptyState, UnavailableState } from "./ui";
import type { ReactNode } from "react";

export function ResearchState({
  loading,
  error,
  available,
  reason,
  children,
  retry,
}: {
  loading: boolean;
  error: string;
  available?: boolean;
  reason?: string | null;
  children: ReactNode;
  retry: () => void;
}) {
  if (loading) return <EmptyState text="Retrieving the research evidence…" />;
  if (error || !available)
    return (
      <section className="evidence-unavailable">
        <span className="eyebrow">EVIDENCE / UNAVAILABLE</span>
        <h2>
          The instrument is ready.
          <br />
          <span>The data is not here yet.</span>
        </h2>
        <UnavailableState
          text={
            error ||
            reason ||
            "No evaluation evidence is available from the service."
          }
        />
        <button className="secondary" onClick={retry}>
          <RefreshCw size={14} /> Retrieve again
        </button>
      </section>
    );
  return <>{children}</>;
}

export function SectionLabel({
  number,
  title,
  note,
}: {
  number: string;
  title: string;
  note?: string;
}) {
  return (
    <div className="section-label">
      <h2>
        <span>{number}</span>
        {title}
      </h2>
      {note ? <span className="mono">{note}</span> : null}
    </div>
  );
}

export function ExportData({
  filename,
  rows,
}: {
  filename: string;
  rows: (string | number | null | undefined)[][];
}) {
  const download = () => {
    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <button className="secondary export-button" onClick={download}>
      <Download size={14} /> Export CSV
    </button>
  );
}
