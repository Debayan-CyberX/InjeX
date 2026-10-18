import { ArrowUpRight, Github } from "lucide-react";

export default function About() {
  return (
    <>
      <section className="about-hero">
        <span className="eyebrow">WHY WE BUILT INJEX</span>
        <h2>
          Language carries intent.
          <br />
          <em>We study the boundary.</em>
        </h2>
        <p>
          Prompt injections blur the line between data and instructions. InjeX
          makes that boundary an object of study: something to inspect,
          challenge, and measure.
        </p>
        <a
          className="secondary"
          href="https://github.com/Debayan-CyberX/InjeX"
          target="_blank"
          rel="noreferrer"
        >
          <Github size={16} /> Explore the repository <ArrowUpRight size={16} />
        </a>
        <span className="about-watermark" aria-hidden="true">
          IX
        </span>
      </section>
      <div className="about-editorial">
        <span className="eyebrow">01 / THE APPROACH</span>
        <div>
          <h3>
            A research instrument,
            <br />
            built for asking better questions.
          </h3>
          <p>
            InjeX compares a baseline prompt-injection detector with a detector
            trained using adversarial augmentation. Word and character TF-IDF
            features feed a logistic regression classifier, with explicit rule
            overrides in the prediction path.
          </p>
          <p>
            The Attack Lab generates obfuscated prompt variants using character
            substitution, spacing changes, punctuation, instruction splitting,
            and Unicode substitution. Comparison and Analytics expose the
            evaluation evidence when training metadata is available.
          </p>
        </div>
      </div>
      <div className="about-editorial">
        <span className="eyebrow">02 / THE LIMITATIONS</span>
        <div>
          <h3>
            Useful evidence.
            <br />
            Careful interpretation.
          </h3>
          <div className="limitation-grid">
            <div>
              <span>01</span>
              <h4>Classification is a signal</h4>
              <p>
                A benign result does not guarantee safety. Context, tool
                permissions, and downstream behavior remain outside this
                detector.
              </p>
            </div>
            <div>
              <span>02</span>
              <h4>Scores need context</h4>
              <p>
                Keyword and benign-task rules can override the model label. The
                probability is not a calibrated security guarantee.
              </p>
            </div>
            <div>
              <span>03</span>
              <h4>Research needs artifacts</h4>
              <p>
                Detections require trained models; evaluations require metadata.
                Missing resources are reported as unavailable.
              </p>
            </div>
            <div>
              <span>04</span>
              <h4>History is temporary</h4>
              <p>
                The API keeps up to 200 records in shared process memory.
                History is not a private or durable account archive.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="about-editorial">
        <span className="eyebrow">03 / THE PEOPLE</span>
        <div>
          <h3>Built through collaboration.</h3>
          <div className="team-grid">
            {[
              { initials: "SJ", name: "Shripad Jadhav", roll: "K017" },
              { initials: "DL", name: "Debayan Lahiry", roll: "K032" },
              { initials: "SS", name: "Sarah Samel", roll: "K049" },
            ].map((person) => (
              <div key={person.roll}>
                <span className="team-avatar">{person.initials}</span>
                <h4>{person.name}</h4>
                <p className="mono">{person.roll}</p>
              </div>
            ))}
          </div>
          <p className="muted">An academic cybersecurity project.</p>
        </div>
      </div>
      <div className="about-editorial">
        <span className="eyebrow">04 / THE CONTEXT</span>
        <div>
          <h3>
            Inspired by research.
            <br />
            Explicit about implementation.
          </h3>
          <p>
            The repository identifies DataSentinel as a research inspiration for
            prompt-injection detection. This implementation uses TF-IDF and
            logistic regression; it does not implement DataSentinel’s full
            game-theoretic minimax detector.
          </p>
          <a
            className="text-button"
            href="https://github.com/Debayan-CyberX/InjeX#machine-learning-approach"
            target="_blank"
            rel="noreferrer"
          >
            Read the project methodology <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </>
  );
}
