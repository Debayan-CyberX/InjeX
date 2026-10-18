import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  AudioLines,
  BookOpen,
  ChartNoAxesCombined,
  ChevronRight,
  Circle,
  Database,
  FlaskConical,
  GitBranch,
  Github,
  History,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  Radio,
  RefreshCw,
  ScanLine,
  X,
} from "lucide-react";
import type { Page, HealthResponse } from "./lib/api";
import { useApi } from "./lib/api";
import { EmptyState, PageHeading, ResearchFooter } from "./components/ui";
import Overview from "./pages/Overview";
import SilverBackdrop from "./components/visuals/SilverBackdrop";
import CommandDock from "./components/visuals/CommandDock";
import VisualBoundary from "./components/visuals/VisualBoundary";
import { useVisuals } from "./components/visuals/VisualSystem";

const Detect = lazy(() => import("./pages/Detect"));
const Attack = lazy(() => import("./pages/Attack"));
const Comparison = lazy(() => import("./pages/Comparison"));
const Analytics = lazy(() => import("./pages/Analytics"));
const HistoryView = lazy(() => import("./pages/History"));
const Dataset = lazy(() => import("./pages/Dataset"));
const Architecture = lazy(() => import("./pages/Architecture"));
const About = lazy(() => import("./pages/About"));

const groups = [
  {
    label: "WORKSPACE",
    items: [
      { name: "Overview", icon: LayoutDashboard },
      { name: "Live Detection", icon: ScanLine },
      { name: "Attack Lab", icon: FlaskConical },
    ],
  },
  {
    label: "RESEARCH",
    items: [
      { name: "Comparison", icon: ChartNoAxesCombined },
      { name: "Analytics", icon: Activity },
      { name: "History", icon: History },
      { name: "Dataset", icon: Database },
    ],
  },
  {
    label: "PROJECT",
    items: [
      { name: "Architecture", icon: GitBranch },
      { name: "About", icon: BookOpen },
    ],
  },
] as const;
const pages = groups.flatMap((group) => group.items.map((item) => item.name));
const slug = (page: Page) => page.toLowerCase().replace(/ /g, "-");
const currentPage = (): Page =>
  pages.find((page) => slug(page) === window.location.hash.slice(2)) ??
  "Overview";
const descriptions: Record<Page, string> = {
  Overview: "A research instrument for prompt security.",
  "Live Detection":
    "Inspect a prompt. Understand the signal. Make an informed decision.",
  "Attack Lab": "Change the surface. Test what the detector still sees.",
  Comparison:
    "The same evaluation set. Two approaches. Evidence over assumptions.",
  Analytics: "A closer look at the measurements behind the model.",
  History:
    "Trace the inputs, classifications, and decisions from this service session.",
  Dataset: "Understand the data before interpreting the results.",
  Architecture: "From raw language to a measured decision. Follow every stage.",
  About: "An academic exploration of trust at the input boundary.",
};

export default function App() {
  const { running } = useVisuals();
  const [page, setPage] = useState<Page>(currentPage);
  const [open, setOpen] = useState(false);
  const {
    data: health,
    error,
    loading,
    reload,
  } = useApi<HealthResponse>("/health");
  const mainRef = useRef<HTMLElement>(null);
  const previousPage = useRef(page);
  useEffect(() => {
    const onHash = () => {
      setPage(currentPage());
      setOpen(false);
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    document.title = `InjeX — ${page}`;
    if (previousPage.current !== page)
      mainRef.current?.focus({ preventScroll: true });
    previousPage.current = page;
  }, [page]);
  useEffect(() => {
    if (!open) return;
    const sidebar = document.getElementById("primary-navigation");
    const focusedBefore = document.activeElement;
    const focusable = sidebar?.querySelectorAll<HTMLElement>(
      "a[href], button:not(:disabled)",
    );
    focusable?.[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Tab" && focusable?.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = oldOverflow;
      if (focusedBefore instanceof HTMLElement)
        focusedBefore.focus({ preventScroll: true });
    };
  }, [open]);
  const navigate = (destination: Page) => {
    window.location.hash = `/${slug(destination)}`;
    setOpen(false);
  };
  const online = Boolean(health?.status === "ok");
  const status = loading
    ? "Checking service"
    : online
      ? "API connected"
      : "Service offline";
  return (
    <div
      className={`app-shell silver-workspace ${page === "Overview" ? "overview-mode" : ""}`}
      data-motion={running ? "live" : "still"}
    >
      <VisualBoundary>
        <SilverBackdrop />
      </VisualBoundary>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          mainRef.current?.focus({ preventScroll: true });
          mainRef.current?.scrollIntoView({ block: "start" });
        }}
      >
        Skip to content
      </a>
      {open ? (
        <button
          className="nav-backdrop"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <aside
        className={`sidebar ${open ? "is-open" : ""}`}
        id="primary-navigation"
        aria-label="Application sidebar"
      >
        <a className="brand" href="#/overview" aria-label="InjeX overview">
          <span className="brand-symbol">
            <AudioLines size={26} strokeWidth={2.5} />
          </span>
          <span>
            Inje<span className="brand-x">X</span>
            <small>VOID / RESEARCH</small>
          </span>
        </a>
        <button
          className="mobile-nav-close icon-button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        >
          <X size={20} />
        </button>
        <div className="workspace-name">
          <span className="workspace-avatar">IX</span>
          <div>
            Prompt security<small>Experimental research</small>
          </div>
          <ChevronRight size={14} />
        </div>
        <nav aria-label="Primary">
          {groups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map(({ name, icon: Icon }) => (
                <a
                  href={`#/${slug(name)}`}
                  key={name}
                  className={name === page ? "active" : ""}
                  aria-current={page === name ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  <Icon size={18} strokeWidth={1.5} />
                  <span>{name}</span>
                  {name === "Attack Lab" ? (
                    <span className="nav-tag">LAB</span>
                  ) : null}
                  {name === page ? <i /> : null}
                </a>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="service-status">
            <span className={`status-dot ${online ? "online" : ""}`} />
            <div>
              {status}
              <small>
                {loading
                  ? "Establishing connection"
                  : online
                    ? health?.model?.improved
                      ? "Improved detector ready"
                      : "Model not loaded"
                    : "Experiments need an API"}
              </small>
            </div>
            <button
              className="icon-button"
              onClick={reload}
              disabled={loading}
              aria-label="Retry API connection"
              title="Retry connection"
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
            </button>
          </div>
          <a
            className="source-link"
            href="https://github.com/Debayan-CyberX/InjeX"
            target="_blank"
            rel="noreferrer"
          >
            <Github size={16} /> Open source research <ArrowUpRight size={14} />
          </a>
          <div className="sidebar-foot">
            <span>INJEX / RESEARCH v2</span>
            <PanelLeftClose size={14} />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="mobile-menu icon-button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="primary-navigation"
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <span className="desktop-crumb">Workspace</span>
            <ChevronRight size={13} />
            <span>{page}</span>
          </div>
          <div className="topbar-right">
            <span className="research-pill">
              <Circle size={6} fill="currentColor" /> OBSIDIAN / VOID
            </span>
            <a
              href="https://github.com/Debayan-CyberX/InjeX"
              target="_blank"
              rel="noreferrer"
              aria-label="InjeX GitHub repository"
            >
              <Github size={18} />
            </a>
            <span className="profile-mark">IX</span>
          </div>
        </header>
        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          className={`main-content page-${slug(page)}`}
          key={page}
        >
          {page !== "Overview" ? (
            <PageHeading
              number={String(pages.indexOf(page) + 1).padStart(2, "0")}
              title={page}
              description={descriptions[page]}
            >
              {page === "Live Detection" || page === "Attack Lab" ? (
                <span
                  className={`connection-label ${online ? "connected" : ""}`}
                >
                  <Radio size={14} />
                  {status}
                </span>
              ) : (
                <span className="page-edition">MONOCHROME / 2026</span>
              )}
            </PageHeading>
          ) : null}
          {page !== "Overview" && !loading && (error || !online) ? (
            <div className="connection-banner">
              <span className="status-dot" />
              <span>
                Research service offline. Results and datasets appear when the
                API is connected.
              </span>
              <button onClick={reload}>
                Retry connection <RefreshCw size={12} />
              </button>
            </div>
          ) : null}
          <Suspense fallback={<EmptyState text="Opening workspace…" />}>
            {page === "Overview" ? (
              <Overview health={health} onNavigate={navigate} />
            ) : page === "Live Detection" ? (
              <Detect />
            ) : page === "Attack Lab" ? (
              <Attack />
            ) : page === "Comparison" ? (
              <Comparison />
            ) : page === "Analytics" ? (
              <Analytics />
            ) : page === "History" ? (
              <HistoryView />
            ) : page === "Dataset" ? (
              <Dataset />
            ) : page === "Architecture" ? (
              <Architecture />
            ) : (
              <About />
            )}
          </Suspense>
          <ResearchFooter />
        </main>
      </div>
      <VisualBoundary>
        <CommandDock page={page} />
      </VisualBoundary>
    </div>
  );
}
