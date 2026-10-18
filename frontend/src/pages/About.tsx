import { ArrowUpRight } from "lucide-react";
export default function About() {
  return (
    <div className="manifesto">
      <section className="manifesto-hero">
        <div className="manifesto-meta">
          <span className="eyebrow">A RESEARCH MANIFESTO</span>
          <span className="mono">INJEX / 2026</span>
        </div>
        <h2>
          QUESTION
          <br />
          THE
          <br />
          <span>INSTRUCTION.</span>
        </h2>
        <div className="manifesto-introduction">
          <span className="manifesto-cross" aria-hidden="true">
            ✳
          </span>
          <p>
            Language is an interface.
            <br />
            Trust is a boundary.
            <br />
            <span>Neither should be invisible.</span>
          </p>
          <p>
            InjeX is an academic research instrument for inspecting prompt
            injections, testing adversarial transformations, and measuring the
            limits of a conventional machine learning detector.
          </p>
        </div>
      </section>
      <section className="manifesto-section">
        <span className="eyebrow">01 / OUR POSITION</span>
        <div>
          <h3>
            Make the invisible
            <br />
            <span>inspectable.</span>
          </h3>
          <p>
            A prompt is not only a string of words. It can also be an attempt to
            redirect instructions, bypass policies, or influence a downstream
            system. We built InjeX to study that input boundary through
            experiments that can be inspected and repeated.
          </p>
          <p>
            The interface shows what the implementation can support: a
            classification, a model probability, normalized input, actual
            transformed variants, and stored evaluation evidence. Every result
            must remain connected to its source.
          </p>
        </div>
      </section>
      <section className="manifesto-section">
        <span className="eyebrow">02 / THE METHOD</span>
        <div>
          <h3>
            Small models.
            <br />
            <span>Explicit decisions.</span>
          </h3>
          <div className="manifesto-principles">
            {[
              [
                "I",
                "Represent",
                "Word and character TF-IDF convert the input into features. Logistic regression produces an injection-class probability.",
              ],
              [
                "II",
                "Challenge",
                "Character, spacing, punctuation, splitting, and Unicode transformations test how the detector responds to a changed surface.",
              ],
              [
                "III",
                "Compare",
                "Baseline and adversarially trained models are measured against clean and transformed test inputs. Improvement is a question, not a promise.",
              ],
            ].map(([n, title, text]) => (
              <article key={n}>
                <span>{n}</span>
                <h4>{title}</h4>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <a className="text-button" href="#/architecture">
            Read the technical blueprint <ArrowUpRight size={16} />
          </a>
        </div>
      </section>
      <section className="manifesto-section">
        <span className="eyebrow">03 / THE LIMITS</span>
        <div>
          <h3>
            A useful instrument
            <br />
            <span>knows its limits.</span>
          </h3>
          <div className="manifesto-limits">
            {[
              [
                "Classification is a signal.",
                "A benign label does not guarantee safety. Application context, tool permissions, and downstream behavior are outside the detector.",
              ],
              [
                "Probability is not certainty.",
                "Keyword and benign-task rules can override the label. The probability is not a calibrated security guarantee.",
              ],
              [
                "Evidence needs its artifacts.",
                "Real predictions require trained models. Benchmarks require stored evaluation metadata. Missing evidence is reported as unavailable.",
              ],
              [
                "History is temporary.",
                "Up to 200 records are shared in API process memory. They reset on restart and are not a private account archive.",
              ],
            ].map(([title, text], i) => (
              <div key={title}>
                <span>0{i + 1}</span>
                <h4>{title}</h4>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="manifesto-section">
        <span className="eyebrow">04 / THE PEOPLE</span>
        <div>
          <h3>
            Research is
            <br />
            <span>a shared practice.</span>
          </h3>
          <div className="manifesto-team">
            {[
              ["01", "Shripad Jadhav", "K017"],
              ["02", "Debayan Lahiry", "K032"],
              ["03", "Sarah Samel", "K049"],
            ].map(([n, name, roll]) => (
              <div key={roll}>
                <span>{n}</span>
                <h4>{name}</h4>
                <span>{roll}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="manifesto-section">
        <span className="eyebrow">05 / THE CONTEXT</span>
        <div>
          <h3>
            Inspired by research.
            <br />
            <span>Precise about the work.</span>
          </h3>
          <p>
            The repository identifies DataSentinel as a research inspiration.
            InjeX implements a TF-IDF and logistic regression pipeline, rather
            than DataSentinel’s full game-theoretic minimax detector. Its
            benchmarks measure the threshold-based path; interactive detection
            additionally applies rule overrides.
          </p>
          <a
            className="text-button"
            href="https://github.com/Debayan-CyberX/InjeX#machine-learning-approach"
            target="_blank"
            rel="noreferrer"
          >
            Explore the methodology and source <ArrowUpRight size={16} />
          </a>
        </div>
      </section>
      <div className="manifesto-end">
        <span>KEEP QUESTIONING.</span>
        <a href="#/live-detection" aria-label="Open detector">
          <ArrowUpRight size={56} strokeWidth={1} />
        </a>
      </div>
    </div>
  );
}
