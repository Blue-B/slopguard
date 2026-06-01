import Link from "next/link";
import { PLANS, PLAN_ORDER } from "@/lib/billing/plans";

const FEATURES = [
  {
    t: "1-click GitHub App",
    d: "Install on a repo or org in one click. No Action YAML, no CI config.",
  },
  {
    t: "Human-in-the-loop",
    d: "Quarantine + review comment only. Nothing is closed without an explicit /slop command.",
  },
  {
    t: "Provenance tagging",
    d: "Detects generator hints, a prompt fingerprint, and leaked assistant phrases.",
  },
  {
    t: "Policy-as-code",
    d: ".github/SLOP_POLICY.yml — thresholds, labels, allowlists, comment templates.",
  },
  {
    t: "Works without an LLM",
    d: "Heuristics-only mode runs with zero API keys — precision 100% on the golden set.",
  },
  {
    t: "No database",
    d: "History lives in GitHub labels and issues. Self-host the whole thing (MIT).",
  },
];

export default function Home() {
  return (
    <>
      <nav className="nav">
        <strong>🛡️ SlopGuard</strong>
        <div>
          <a href="#how">How it works</a>
          <a href="#pricing">Pricing</a>
          <Link href="/pricing">Plans</Link>
          <a href="https://github.com/Blue-B/slopguard">GitHub</a>
        </div>
      </nav>

      <header className="hero">
        <span className="badge">Maintainer burnout, solved</span>
        <h1>Stop AI slop from drowning your repo</h1>
        <p className="sub">
          SlopGuard scores incoming pull requests and issues for low-effort,
          machine-generated &ldquo;slop&rdquo;, tags their provenance, and
          quarantines them — then lets a human make the final call.
        </p>
        <div className="btn-row">
          <Link className="btn btn-primary" href="/setup">
            Install the GitHub App
          </Link>
          <a
            className="btn btn-ghost"
            href="https://github.com/Blue-B/slopguard"
          >
            Star on GitHub
          </a>
        </div>
        <p className="muted" style={{ marginTop: 16, fontSize: 13 }}>
          Open source · MIT · never auto-closes · free for public repos
        </p>
      </header>

      <section className="wide">
        <div className="grid">
          {FEATURES.map((f) => (
            <div className="card feature" key={f.t}>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="wide">
        <h2 className="section-title">How it works</h2>
        <p className="section-sub">
          A webhook triggers the detection agent. You get a score, a label, and
          a review comment.
        </p>
        <div className="card">
          <ol style={{ lineHeight: 1.9, margin: 0 }}>
            <li>
              A PR or issue is opened. GitHub calls{" "}
              <code>/api/webhook</code>.
            </li>
            <li>
              The agent runs static heuristics (boilerplate, emoji headers,
              empty body, prompt-injection) and an optional LLM judge.
            </li>
            <li>
              It scores 0–100, extracts provenance, and applies your{" "}
              <code>.github/SLOP_POLICY.yml</code>.
            </li>
            <li>
              At or above your threshold → <code>slop-quarantine</code> label +
              review comment.
            </li>
            <li>
              A maintainer replies <code>/slop approve</code>,{" "}
              <code>/slop reject</code>, or <code>/slop false-positive</code>.
            </li>
          </ol>
        </div>
      </section>

      <section id="pricing" className="wide">
        <h2 className="section-title">Pricing</h2>
        <p className="section-sub">
          The code is free to self-host. Paid tiers cover the managed LLM bill
          and org features.
        </p>
        <div className="grid">
          {PLAN_ORDER.map((id) => {
            const p = PLANS[id];
            return (
              <div
                className={`card plan${id === "pro" ? " featured" : ""}`}
                key={id}
              >
                <h3 style={{ margin: 0 }}>{p.name}</h3>
                <div className="price">
                  <span className="amt">${p.priceMonthly}</span>
                  <span className="per">/ month</span>
                </div>
                <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
                  {p.tagline}
                </p>
                <ul>
                  {p.features.map((feat) => (
                    <li key={feat}>{feat}</li>
                  ))}
                </ul>
                {id === "free" ? (
                  <Link className="btn btn-ghost" href="/setup">
                    Get started
                  </Link>
                ) : (
                  <a
                    className="btn btn-primary"
                    href={`/api/billing/checkout?plan=${id}`}
                  >
                    Choose {p.name}
                  </a>
                )}
              </div>
            );
          })}
        </div>
        <p className="section-sub" style={{ marginTop: 16, fontSize: 13 }}>
          Prefer to run it yourself? Everything is open source —{" "}
          <a href="https://github.com/Blue-B/slopguard">self-host for free</a>.
        </p>
      </section>

      <footer
        className="wide"
        style={{
          textAlign: "center",
          padding: "48px 24px",
          color: "var(--muted)",
          fontSize: 13,
        }}
      >
        SlopGuard · MIT ·{" "}
        <a href="https://github.com/Blue-B/slopguard">github.com/Blue-B/slopguard</a>
      </footer>
    </>
  );
}
