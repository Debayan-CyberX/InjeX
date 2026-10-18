import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Braces,
  ChevronRight,
  FlaskConical,
  GitCompareArrows,
  ScanLine,
} from "lucide-react";
import Observatory from "../components/Observatory";
import SpotlightCard from "../components/SpotlightCard";
import { useApi, formatPercent, promptOptions } from "../lib/api";
import type { HealthResponse, Page, ComparisonResponse } from "../lib/api";

const chapters = [
  {
    word: "Detect",
    no: "01",
    icon: ScanLine,
    caption: "READ BETWEEN THE INSTRUCTIONS",
    text: "Inspect the input before it crosses a trust boundary. Normalize the text, extract its features, and examine the classification.",
    destination: "Live Detection" as Page,
    code: ["raw_prompt", "normalize(input)", "classify(features)"],
  },
  {
    word: "Distort",
    no: "02",
    icon: FlaskConical,
    caption: "CHANGE THE SURFACE",
    text: "Substitute characters. Split instructions. Introduce Unicode. Explore how small changes can challenge a detector.",
    destination: "Attack Lab" as Page,
    code: [
      "ignore instructions",
      "1gn0re instructi0ns",
      "inspect the difference",
    ],
  },
  {
    word: "Measure",
    no: "03",
    icon: GitCompareArrows,
    caption: "LET THE EVIDENCE SPEAK",
    text: "Compare baseline and adversarially trained models on clean and transformed inputs. Every improvement needs evidence.",
    destination: "Comparison" as Page,
    code: [
      "baseline / improved",
      "clean / adversarial",
      "accuracy · precision · recall",
    ],
  },
];
export default function Overview({
  health,
  onNavigate,
}: {
  health: HealthResponse | null;
  onNavigate: (page: Page) => void;
}) {
  const { data } = useApi<ComparisonResponse>("/comparison");
  const [preview, setPreview] = useState(promptOptions[0].text);
  const [active, setActive] = useState(0);
  const launch = () => {
    try {
      sessionStorage.setItem("injex-draft", preview);
    } catch {
      /* The editor works without browser storage. */
    }
    onNavigate("Live Detection");
  };
  return (
    <div className="overview">
      <section className="hero">
        <div className="hero-topline">
          <p className="eyebrow">
            <span className="tiny-cross">+</span> ADVERSARIAL PROMPT RESEARCH
          </p>
          <span className="hero-index">
            EST. 2026 <span>/</span> VOL. 001
          </span>
        </div>
        <div className="hero-composition">
          <div className="hero-copy">
            <div className="hero-label">
              <span /> LANGUAGE IS AN INTERFACE. AND A VULNERABILITY.
            </div>
            <h1>
              Trust is an
              <br />
              attack
              <br />
              <em>surface.</em>
            </h1>
            <p className="hero-description">
              See the instruction beneath the language.
              <br />A research workspace to detect prompt injections,
              <br className="desktop-break" /> challenge the detector, and
              measure what holds.
            </p>
            <div className="hero-actions">
              <button
                className="primary"
                onClick={() => onNavigate("Live Detection")}
              >
                Launch detector <ArrowUpRight size={18} />
              </button>
              <a
                href="#research"
                onClick={(event) => {
                  event.preventDefault();
                  document
                    .getElementById("research")
                    ?.scrollIntoView({
                      behavior: window.matchMedia(
                        "(prefers-reduced-motion: reduce)",
                      ).matches
                        ? "instant"
                        : "smooth",
                    });
                }}
              >
                Explore the research <ArrowDown size={15} />
              </a>
            </div>
          </div>
          <Observatory />
        </div>
        <div className="hero-bottom">
          <div>
            <span className="mono">01 — 03</span>
            <span className="hero-bottom-line" />
            <span>DETECT. DISTORT. MEASURE.</span>
          </div>
          <span className="hero-bottom-right">
            A clearer view of the input boundary <ArrowDown size={14} />
          </span>
        </div>
      </section>
      <section className="research-intro" id="research">
        <div>
          <p className="eyebrow">THE RESEARCH LOOP</p>
          <h2>
            One prompt.
            <br />
            <span className="muted">Three perspectives.</span>
          </h2>
        </div>
        <p>
          Security is a question you keep asking.
          <br />
          Move from an initial signal to an adversarial experiment, then back to
          the evidence.
        </p>
      </section>
      <div className="chapter-grid">
        {chapters.map((chapter, i) => (
          <SpotlightCard
            key={chapter.no}
            className="chapter-card"
            spotlightColor="#eba36d"
            intensity={0.08}
            borderGlow={0.2}
            flare={false}
          >
            <div className="chapter-top">
              <span className="mono">/{chapter.no}</span>
              <chapter.icon size={22} strokeWidth={1.3} />
            </div>
            <p className="chapter-caption">{chapter.caption}</p>
            <h3>
              {chapter.word}
              <span>↗</span>
            </h3>
            <p className="chapter-description">{chapter.text}</p>
            <div className={`chapter-study study-${i}`} aria-hidden="true">
              {chapter.code.map((line, n) => (
                <div key={line}>
                  <span>0{n + 1}</span>
                  <code>{line}</code>
                  {n === 1 ? <i /> : null}
                </div>
              ))}
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate(chapter.destination)}
            >
              Open {chapter.destination.toLowerCase()} <ArrowRight size={15} />
            </button>
          </SpotlightCard>
        ))}
      </div>
      <section className="preview-section">
        <div className="preview-copy">
          <p className="eyebrow">THE FIRST QUESTION</p>
          <h2>
            What is this
            <br />
            prompt <em>really</em>
            <br />
            asking?
          </h2>
          <p>
            Start with an example, or write your own. Open it in the detector to
            inspect the actual classification.
          </p>
          <div className="preview-note">
            <Braces size={18} />
            <span>
              Your input goes to the configured InjeX API.
              <br />
              No external analytics or prompt telemetry.
            </span>
          </div>
        </div>
        <div className="preview-console">
          <div className="console-bar">
            <div>
              <i />
              <i />
              <i />
            </div>
            <span>PROMPT / INSPECTION</span>
            <ScanLine size={15} />
          </div>
          <div className="preview-tabs">
            {["Instruction override", "Benign request", "Your prompt"].map(
              (name, index) => (
                <button
                  key={name}
                  className={active === index ? "active" : ""}
                  onClick={() => {
                    setActive(index);
                    setPreview(
                      index === 0
                        ? promptOptions[0].text
                        : index === 1
                          ? promptOptions[6].text
                          : "",
                    );
                  }}
                >
                  {name}
                </button>
              ),
            )}
          </div>
          <div className="preview-editor">
            <span className="line-number">01</span>
            <textarea
              aria-label="Detector preview prompt"
              value={preview}
              maxLength={20000}
              onChange={(e) => {
                setPreview(e.target.value);
                setActive(2);
              }}
              placeholder="Write the prompt you want to inspect…"
            />
          </div>
          <div className="preview-console-bottom">
            <span>{preview.length} characters</span>
            <button
              className="primary"
              onClick={launch}
              disabled={!preview.trim()}
            >
              Inspect prompt <ArrowUpRight size={16} />
            </button>
          </div>
          <p className="preview-disclaimer">
            <span
              className={`status-dot ${health?.status === "ok" ? "online" : ""}`}
            />
            {health?.status === "ok"
              ? "API connected · Classification runs in the detector"
              : "Service offline · Editor available, detection requires API"}
          </p>
        </div>
      </section>
      <section className="evidence-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">EVIDENCE, NOT ASSUMPTIONS</p>
            <h2>
              Improvement is
              <br />
              <em>something you measure.</em>
            </h2>
          </div>
          <button
            className="text-button"
            onClick={() => onNavigate("Comparison")}
          >
            Compare the models <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="evidence-row">
          <div>
            <span>BASELINE / CLEAN ACCURACY</span>
            <strong>
              {data?.available
                ? formatPercent(data.baseline?.clean?.accuracy)
                : "—"}
            </strong>
            <small>Original training distribution</small>
          </div>
          <div>
            <span>IMPROVED / CLEAN ACCURACY</span>
            <strong className="copper">
              {data?.available
                ? formatPercent(data.improved?.clean?.accuracy)
                : "—"}
            </strong>
            <small>Adversarially augmented training</small>
          </div>
          <div className="evidence-context">
            <span className="mono">THE EXPERIMENT</span>
            <p>
              Word + character TF-IDF.
              <br />
              Logistic regression.
              <br />
              The same evaluation scenarios.
            </p>
            <small>
              {data?.available
                ? "Values from backend training metadata."
                : "Evaluation data appears when the research API and training metadata are available."}
            </small>
          </div>
        </div>
      </section>
      <section className="overview-cta">
        <div>
          <p className="eyebrow">LOOK CLOSER</p>
          <h2>
            The input is where
            <br />
            <em>the experiment begins.</em>
          </h2>
        </div>
        <button
          className="round-link"
          onClick={() => onNavigate("Attack Lab")}
          aria-label="Open Attack Lab"
        >
          <ArrowUpRight size={40} strokeWidth={1} />
        </button>
        <span className="cta-caption">
          ENTER THE ATTACK LAB <ChevronRight size={14} />
        </span>
      </section>
    </div>
  );
}
