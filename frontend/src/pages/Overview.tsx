import { lazy, Suspense, useRef, useState } from "react";
import VisualBoundary from "../components/visuals/VisualBoundary";
import { useVisuals } from "../components/visuals/VisualSystem";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Braces,
  FlaskConical,
  GitCompareArrows,
  ScanLine,
} from "lucide-react";
import { useApi, formatPercent, promptOptions } from "../lib/api";
import type { HealthResponse, Page, ComparisonResponse } from "../lib/api";

const ChromeSculpture = lazy(
  () => import("../components/visuals/ChromeSculpture"),
);
const chromeFallback = (
  <img
    src={`${import.meta.env.BASE_URL}images/void-chrome.webp`}
    alt=""
    width="1536"
    height="1024"
    fetchPriority="high"
  />
);

const chapters = [
  {
    number: "01",
    name: "Detect",
    subtitle: "INTERROGATE THE INPUT",
    icon: ScanLine,
    text: "Separate the instruction from the language. Inspect normalization, classification, and the signal behind the score.",
    destination: "Live Detection" as Page,
  },
  {
    number: "02",
    name: "Distort",
    subtitle: "CHALLENGE THE BOUNDARY",
    icon: FlaskConical,
    text: "Change the characters. Split the instruction. Follow actual obfuscated variants through an adversarial experiment.",
    destination: "Attack Lab" as Page,
  },
  {
    number: "03",
    name: "Measure",
    subtitle: "RETURN TO THE EVIDENCE",
    icon: GitCompareArrows,
    text: "Put the baseline beside the improved detector. Study what changes, what holds, and what the metrics can actually tell you.",
    destination: "Comparison" as Page,
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
  const [preset, setPreset] = useState(0);
  const sculpture = useRef<HTMLDivElement>(null);
  const { running } = useVisuals();
  const launch = () => {
    try {
      sessionStorage.setItem("injex-draft", preview);
    } catch {}
    onNavigate("Live Detection");
  };
  return (
    <div className="void-overview">
      <section
        className="void-hero"
        onPointerMove={(event) => {
          if (
            !running ||
            window.matchMedia(
              "(prefers-reduced-motion: reduce), (pointer: coarse)",
            ).matches
          )
            return;
          const rect = event.currentTarget.getBoundingClientRect();
          sculpture.current?.style.setProperty(
            "--shift",
            `${((event.clientX - rect.left) / rect.width - 0.5) * 14}px`,
          );
        }}
        onPointerLeave={() =>
          sculpture.current?.style.setProperty("--shift", "0px")
        }
      >
        <div className="hero-sculpture" ref={sculpture}>
          <VisualBoundary fallback={chromeFallback}>
            <Suspense fallback={chromeFallback}>
              <ChromeSculpture />
            </Suspense>
          </VisualBoundary>
        </div>
        <div className="void-hero-meta">
          <span>
            <i className="crosshair" /> INJEX / PROMPT SECURITY RESEARCH
          </span>
          <span>SILVER STUDY / 001</span>
        </div>
        <div className="void-hero-copy">
          <span className="hero-pretitle">THE INVISIBLE INSTRUCTION</span>
          <h1>
            LANGUAGE.
            <br />
            UNDER
            <br />
            <span>OBSERVATION.</span>
          </h1>
          <div className="hero-caption">
            <span className="mono">[ RESEARCH INSTRUMENT ]</span>
            <p>
              Look beyond what a prompt says.
              <br />
              Inspect its intent. Challenge the detector.
              <br />
              Let the evidence decide.
            </p>
          </div>
          <div className="hero-actions">
            <button
              className="primary"
              onClick={() => onNavigate("Live Detection")}
            >
              Launch detector <ArrowUpRight size={17} />
            </button>
            <button
              className="text-button"
              onClick={() =>
                document.getElementById("research")?.scrollIntoView({
                  behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)",
                  ).matches
                    ? "instant"
                    : "smooth",
                })
              }
            >
              Explore the research <ArrowDown size={14} />
            </button>
          </div>
        </div>
        <div className="hero-object-caption">
          <span>STUDY 001 / THE TRUST BOUNDARY</span>
          <span>HOVER TO SCULPT / DRAG TO ROTATE</span>
        </div>
        <div className="void-hero-bottom">
          <span>DETECT / DISTORT / MEASURE</span>
          <span>
            <i
              className={`status-dot ${health?.status === "ok" ? "online" : ""}`}
            />
            {health?.status === "ok"
              ? "RESEARCH API CONNECTED"
              : "RESEARCH API NOT CONNECTED"}
          </span>
          <ArrowDown size={16} />
        </div>
      </section>
      <section className="research-statement" id="research">
        <span className="eyebrow">THE QUESTION / 001</span>
        <h2>
          When does language
          <br />
          become <span>an instruction?</span>
        </h2>
        <p>
          A prompt can look like ordinary text and still attempt to cross a
          trust boundary. InjeX is an instrument for making that boundary
          visible.
        </p>
      </section>
      <section className="research-chapters" aria-label="The research loop">
        {chapters.map((chapter) => (
          <article className="research-chapter" key={chapter.number}>
            <span className="chapter-number">/{chapter.number}</span>
            <div>
              <span className="eyebrow">{chapter.subtitle}</span>
              <h3>
                {chapter.name}
                <span>.</span>
              </h3>
              <p>{chapter.text}</p>
            </div>
            <button
              className="chapter-launch"
              onClick={() => onNavigate(chapter.destination)}
              aria-label={`Open ${chapter.destination}`}
            >
              <chapter.icon size={20} strokeWidth={1} />
              <ArrowUpRight size={24} strokeWidth={1} />
            </button>
          </article>
        ))}
      </section>
      <section className="void-preview">
        <div className="preview-copy">
          <span className="eyebrow">THE FIRST OBSERVATION</span>
          <h2>
            A few words.
            <br />
            <span>A different intent.</span>
          </h2>
          <p>
            Choose a research prompt, or write your own. Take it to the real
            detector and inspect the returned evidence.
          </p>
          <span className="preview-privacy">
            <Braces size={17} /> No external prompt telemetry.
          </span>
        </div>
        <div className="preview-console">
          <div className="console-bar">
            <span>INPUT / PLAIN TEXT</span>
            <ScanLine size={16} />
          </div>
          <div className="preview-tabs">
            {["Instruction override", "Benign request", "Your prompt"].map(
              (name, index) => (
                <button
                  key={name}
                  className={preset === index ? "active" : ""}
                  onClick={() => {
                    setPreset(index);
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
              onChange={(event) => {
                setPreview(event.target.value);
                setPreset(2);
              }}
              placeholder="What would you like to inspect?"
              spellCheck={false}
            />
          </div>
          <div className="preview-console-bottom">
            <span>{preview.length} CHARACTERS</span>
            <button
              className="primary"
              onClick={launch}
              disabled={!preview.trim()}
            >
              Inspect prompt <ArrowUpRight size={16} />
            </button>
          </div>
          <p className="preview-disclaimer">
            Classification runs in the detector using the configured InjeX API.
          </p>
        </div>
      </section>
      <section className="overview-benchmark">
        <div className="section-heading">
          <span className="eyebrow">THE EVIDENCE / CLEAN TEST SET</span>
          <a className="text-button" href="#/comparison">
            Open benchmark <ArrowUpRight size={15} />
          </a>
        </div>
        <h2>
          Progress is a measurement.
          <br />
          <span>Never an assumption.</span>
        </h2>
        <div className="overview-benchmark-values">
          <div>
            <span>BASELINE ACCURACY</span>
            <strong>
              {data?.available
                ? formatPercent(data.baseline?.clean?.accuracy)
                : "—"}
            </strong>
            <small>Original training distribution</small>
          </div>
          <div>
            <span>IMPROVED ACCURACY</span>
            <strong>
              {data?.available
                ? formatPercent(data.improved?.clean?.accuracy)
                : "—"}
            </strong>
            <small>Adversarially augmented training</small>
          </div>
          <p>
            Word + character TF-IDF.
            <br />
            Logistic regression.
            <br />
            Real training evidence.
            <span>
              {data?.available
                ? "Values returned by the research API."
                : "No evaluation data has been returned."}
            </span>
          </p>
        </div>
      </section>
      <section className="void-cta">
        <span className="eyebrow">THE NEXT EXPERIMENT IS YOURS.</span>
        <a href="#/attack-lab">
          <span>
            ENTER
            <br />
            THE LAB.
          </span>
          <ArrowUpRight strokeWidth={0.7} />
        </a>
        <div>
          <span>INJEX / AN ACADEMIC EXPLORATION OF PROMPT SECURITY</span>
          <span>KEEP QUESTIONING THE INPUT.</span>
        </div>
      </section>
    </div>
  );
}
