import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyCertificate } from "@/lib/verify.functions";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify a Certificate | Authenticity Validator" },
      {
        name: "description",
        content:
          "Enter a certificate ID to confirm whether it is verified, revoked or not found. No personal details are shown.",
      },
      { property: "og:title", content: "Verify a Certificate" },
      {
        property: "og:description",
        content: "Public certificate status check — verified, revoked or not found.",
      },
    ],
  }),
  component: VerifyPage,
});

const outcomes: Record<
  string,
  { icon: typeof CheckCircle2; label: string; note: string; tone: string }
> = {
  VERIFIED: {
    icon: CheckCircle2,
    label: "Verified",
    note: "This certificate matches an authoritative institution record.",
    tone: "text-success",
  },
  REVOKED: {
    icon: AlertTriangle,
    label: "Revoked",
    note: "This certificate has been revoked by the issuing authority.",
    tone: "text-destructive",
  },
  PENDING: {
    icon: Clock,
    label: "Pending review",
    note: "This certificate exists but has not completed verification.",
    tone: "text-warning-foreground",
  },
  NOT_FOUND: {
    icon: XCircle,
    label: "Not found",
    note: "No certificate exists with that ID.",
    tone: "text-muted-foreground",
  },
  RATE_LIMITED: {
    icon: AlertTriangle,
    label: "Too many checks",
    note: "Please wait a minute before checking again.",
    tone: "text-warning-foreground",
  },
};

function VerifyPage() {
  const run = useServerFn(verifyCertificate);
  const [certificateId, setCertificateId] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const response = await run({ data: { certificateId } });
      setResult(response.result);
    } catch {
      setError("Verification is unavailable right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const outcome = result ? (outcomes[result] ?? outcomes["NOT_FOUND"]!) : null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
            <ShieldCheck className="size-5 text-accent" aria-hidden />
            Authenticity Validator
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/request-access">Request full access</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
        <h1 className="text-3xl font-semibold">Certificate verification</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter a certificate ID. Only its validity status is shown.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="certificateId">Certificate ID</Label>
            <Input
              id="certificateId"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              placeholder="ABC20261234"
              required
              minLength={3}
              className="font-mono"
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {busy ? "Checking…" : "Verify"}
          </Button>
        </form>

        {error ? <p className="mt-6 text-sm text-destructive">{error}</p> : null}

        {outcome ? (
          <div className="surface mt-8 flex items-start gap-4 p-6">
            <outcome.icon className={`mt-0.5 size-7 shrink-0 ${outcome.tone}`} aria-hidden />
            <div>
              <p className={`text-xl font-semibold ${outcome.tone}`}>{outcome.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{outcome.note}</p>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
