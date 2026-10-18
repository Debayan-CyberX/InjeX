import type { ReactNode } from "react";
import { ArrowUpRight, CircleDashed, Unplug } from "lucide-react";

export function Card({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card ${className}`}>
      <div className="card-header">
        <h2>{title}</h2>
        {subtitle ? <span>{subtitle}</span> : null}
      </div>
      {children}
    </section>
  );
}
export function EmptyState({ text }: { text: string }) {
  return (
    <div className="empty-state">
      <CircleDashed size={28} strokeWidth={1} />
      <p>{text}</p>
    </div>
  );
}
export function UnavailableState({ text }: { text: string }) {
  return (
    <div className="unavailable-note" role="status">
      <Unplug size={17} />
      <span>{text}</span>
    </div>
  );
}
export function Badge({
  label,
  available = true,
}: {
  label: string;
  available?: boolean;
}) {
  const state = !available || label === "unavailable" ? "unavailable" : label;
  return (
    <span className={`label-chip ${state}`}>
      <i />
      {state === "prompt_injection"
        ? "Prompt injection"
        : state === "benign"
          ? "Benign"
          : "Unavailable"}
    </span>
  );
}
export function PageHeading({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">
          THE OBSERVATORY <span>/ {number}</span>
        </p>
        <h1>
          {title}
          <span className="copper">.</span>
        </h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
export function ResearchFooter() {
  return (
    <footer className="research-footer">
      <span>
        INJEX <span className="muted">/ An experiment in prompt security</span>
      </span>
      <a
        href="https://github.com/Debayan-CyberX/InjeX"
        target="_blank"
        rel="noreferrer"
      >
        View source <ArrowUpRight size={14} />
      </a>
    </footer>
  );
}
