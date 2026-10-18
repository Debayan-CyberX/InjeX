import { useEffect, useRef, useState } from "react";
import {
  Activity,
  BookOpen,
  ChartNoAxesCombined,
  Database,
  FlaskConical,
  GitBranch,
  History,
  Layers3,
  LayoutDashboard,
  Pause,
  Play,
  ScanLine,
  X,
} from "lucide-react";
import type { Page } from "../../lib/api";
import { useVisuals } from "./VisualSystem";
import GlassDockSurface from "./GlassDockSurface";

const primary = [
  { name: "Overview", label: "Overview", icon: LayoutDashboard },
  { name: "Live Detection", label: "Detect", icon: ScanLine },
  { name: "Attack Lab", label: "Attack Lab", icon: FlaskConical },
  { name: "Comparison", label: "Compare", icon: ChartNoAxesCombined },
] as const;
const research = [
  {
    name: "Analytics",
    label: "Evaluation and confusion matrix",
    icon: Activity,
  },
  { name: "History", label: "Investigate recorded decisions", icon: History },
  { name: "Dataset", label: "Source data and provenance", icon: Database },
  {
    name: "Architecture",
    label: "Explore the detection pipeline",
    icon: GitBranch,
  },
  { name: "About", label: "Research, methodology and credits", icon: BookOpen },
] as const;
const slug = (name: string) => name.toLowerCase().replace(/ /g, "-");

export default function CommandDock({ page }: { page: Page }) {
  const { paused, reduced, toggle } = useVisuals();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const more = useRef<HTMLButtonElement>(null);
  const first = useRef<HTMLAnchorElement>(null);
  useEffect(() => setOpen(false), [page]);
  useEffect(() => {
    if (!open) return;
    first.current?.focus({ preventScroll: true });
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        more.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", keyboard);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", keyboard);
    };
  }, [open]);
  const moreActive = research.some((item) => item.name === page);
  return (
    <nav
      className="glass-command-dock"
      aria-label="Workspace command dock"
      ref={root}
    >
      {open ? (
        <div
          className="dock-research-menu"
          id="dock-research-menu"
          role="dialog"
          aria-label="Research navigation"
        >
          <div className="dock-menu-heading">
            <span>RESEARCH INSTRUMENTS</span>
            <button
              aria-label="Close research navigation"
              onClick={() => {
                setOpen(false);
                more.current?.focus();
              }}
            >
              <X size={15} />
            </button>
          </div>
          {research.map(({ name, label, icon: Icon }, index) => (
            <a
              key={name}
              href={`#/${slug(name)}`}
              ref={index === 0 ? first : undefined}
              aria-current={page === name ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} strokeWidth={1.5} />
              <span>
                <strong>{name}</strong>
                <small>{label}</small>
              </span>
              <span className="dock-menu-index">0{index + 5}</span>
            </a>
          ))}
        </div>
      ) : null}
      <GlassDockSurface />
      <div className="glass-dock-actions">
        {primary.map(({ name, label, icon: Icon }) => (
          <a
            key={name}
            href={`#/${slug(name)}`}
            aria-label={`Dock: ${name}`}
            title={name}
            aria-current={page === name ? "page" : undefined}
          >
            <Icon size={18} strokeWidth={1.5} />
            <span>{label}</span>
          </a>
        ))}
        <span className="glass-dock-divider" />
        <button
          ref={more}
          onClick={() => setOpen((value) => !value)}
          aria-label="Open research navigation"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? "dock-research-menu" : undefined}
          className={moreActive || open ? "dock-active" : ""}
        >
          <Layers3 size={18} strokeWidth={1.5} />
          <span>Research</span>
        </button>
        <span className="glass-dock-divider" />
        <button
          onClick={toggle}
          aria-label={
            reduced
              ? "Reduced motion enabled"
              : paused
                ? "Resume visual motion"
                : "Pause visual motion"
          }
          aria-pressed={paused || reduced}
          disabled={reduced}
          title={
            reduced
              ? "Motion is paused by your device preference"
              : "Pause or resume silver light and chrome motion"
          }
        >
          {paused || reduced ? <Play size={16} /> : <Pause size={16} />}
          <span>{paused || reduced ? "Still light" : "Live light"}</span>
        </button>
      </div>
    </nav>
  );
}
