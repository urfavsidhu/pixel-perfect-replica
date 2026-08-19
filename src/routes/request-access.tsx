import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { getAccessRequestResult, requestFullAccess } from "@/lib/access.functions";
import type { AccessRequestResult } from "@/lib/access.server";

export const Route = createFileRoute("/request-access")({
  head: () => ({
    meta: [
      { title: "Request Full Access | Authenticity Validator" },
      {
        name: "description",
        content:
          "Employers can request full certificate details using a student ID and access key. The student approves or denies each request.",
      },
      { property: "og:title", content: "Request Full Certificate Access" },
      {
        property: "og:description",
        content: "Consent-based access to full academic certificate records.",
      },
    ],
  }),
  component: RequestAccessPage,
});

function RequestAccessPage() {
  const submit = useServerFn(requestFullAccess);
  const check = useServerFn(getAccessRequestResult);

  const [form, setForm] = useState({
    studentDisplayId: "",
    accessKey: "",
    requesterName: "",
    requesterOrganization: "",
    requesterEmail: "",
  });
  const [requestId, setRequestId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AccessRequestResult | null>(null);

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await submit({ data: form });
      if (!response.ok) setError(response.error);
      else setRequestId(response.requestId);
    } catch {
      setError("Could not submit the request. Check the details and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function onCheck(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setResult(await check({ data: { requestId } }));
    } catch {
      setError("Could not look up that request reference.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
            <ShieldCheck className="size-5 text-accent" aria-hidden />
            Authenticity Validator
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/verify">Public status check</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-5xl gap-10 px-6 py-14 md:grid-cols-2">
        <section>
          <h1 className="text-3xl font-semibold">Request full access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You need the student&apos;s ID and their current access key. The student decides whether
            to allow or deny. Approved access lasts 24 hours.
          </p>

          <form onSubmit={onSubmit} className="surface mt-6 space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="studentDisplayId">Student ID</Label>
              <Input
                id="studentDisplayId"
                className="font-mono"
                placeholder="STU2026-4KQP"
                value={form.studentDisplayId}
                onChange={(e) => update("studentDisplayId", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accessKey">Access key</Label>
              <Input
                id="accessKey"
                className="font-mono"
                placeholder="7GQK-2M4P-K44L"
                value={form.accessKey}
                onChange={(e) => update("accessKey", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requesterName">Your name</Label>
              <Input
                id="requesterName"
                value={form.requesterName}
                onChange={(e) => update("requesterName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requesterOrganization">Organization</Label>
              <Input
                id="requesterOrganization"
                value={form.requesterOrganization}
                onChange={(e) => update("requesterOrganization", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requesterEmail">Work email</Label>
              <Input
                id="requesterEmail"
                type="email"
                value={form.requesterEmail}
                onChange={(e) => update("requesterEmail", e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Submitting…" : "Submit request"}
            </Button>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </form>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Check a request</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Keep your request reference. Use it to see the decision and, once allowed, the full
            record.
          </p>

          <form onSubmit={onCheck} className="surface mt-6 space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="requestId">Request reference</Label>
              <Input
                id="requestId"
                className="font-mono text-xs"
                value={requestId}
                onChange={(e) => setRequestId(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="outline" className="w-full" disabled={busy}>
              Check status
            </Button>
          </form>

          {result ? (
            <div className="surface mt-6 space-y-4 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge status={result.status} />
              </div>
              {result.status === "denied" ? (
                <p className="text-sm text-muted-foreground">Access denied by user.</p>
              ) : null}
              {result.status === "pending" ? (
                <p className="text-sm text-muted-foreground">
                  Waiting for the student to respond.
                </p>
              ) : null}
              {result.status === "allowed" && result.student ? (
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">{result.student.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {result.student.display_id}
                    </p>
                  </div>
                  {result.certificates.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No certificates on record.</p>
                  ) : (
                    result.certificates.map((cert) => (
                      <div key={cert.certificate_id} className="rounded-md border p-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs">{cert.certificate_id}</span>
                          <StatusBadge status={cert.status} />
                        </div>
                        <p className="mt-2 font-medium">{cert.degree ?? "—"}</p>
                        <p className="text-muted-foreground">
                          {cert.department ?? "—"} · {cert.graduation_year ?? "—"} · Grade{" "}
                          {cert.grade_or_cgpa ?? "—"}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Rule-Based Verification Score: {cert.trust_score}/100
                        </p>
                      </div>
                    ))
                  )}
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
