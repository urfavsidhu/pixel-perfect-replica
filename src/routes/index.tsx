import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, KeyRound, FileSearch, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Authenticity Validator for Academia" },
      {
        name: "description",
        content:
          "Verify academic certificates instantly with hash checks, QR validation and consent-based access to full records.",
      },
      { property: "og:title", content: "Authenticity Validator for Academia" },
      {
        property: "og:description",
        content:
          "A privacy-first platform for verifying academic certificates: public status checks and consent-based full access.",
      },
    ],
  }),
  component: Home,
});

const pillars = [
  {
    icon: FileSearch,
    title: "Public status check",
    body: "Anyone can confirm whether a certificate is valid, revoked or unknown — with zero personal data exposed.",
  },
  {
    icon: KeyRound,
    title: "Consent-based access",
    body: "Employers request full records with the student's ID and access key. Only the student can approve, for 24 hours.",
  },
  {
    icon: Lock,
    title: "Tamper evidence",
    body: "Every record carries a SHA-256 file hash and a rule-based verification score built from deterministic checks.",
  },
];

function Home() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <ShieldCheck className="size-5 text-accent" aria-hidden />
            Authenticity Validator
          </div>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/verify">Verify</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/request-access">Request access</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            Academic credential integrity
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl leading-tight font-semibold">
            Verify an academic certificate without exposing a single personal detail.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Institutions issue authoritative records. Students hold the keys to their own data.
            Employers get a definitive answer — and nothing more, unless the student agrees.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/verify">Check a certificate</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/request-access">Request full access</Link>
            </Button>
          </div>
        </section>

        <section className="border-y border-border bg-card">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-3">
            {pillars.map((pillar) => (
              <article key={pillar.title}>
                <pillar.icon className="size-6 text-accent" aria-hidden />
                <h2 className="mt-4 text-xl font-semibold">{pillar.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold">How consent works</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              "Requester submits the student ID and current access key.",
              "The student sees the request in their dashboard.",
              "Allow grants 24-hour access; Deny closes it immediately.",
              "Every decision is written to the audit log.",
            ].map((step, index) => (
              <li key={step} className="surface p-5">
                <span className="font-mono text-sm text-accent">0{index + 1}</span>
                <p className="mt-2 text-sm text-muted-foreground">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Rule-based verification. No AI scoring, no third-party data processing.
      </footer>
    </div>
  );
}
