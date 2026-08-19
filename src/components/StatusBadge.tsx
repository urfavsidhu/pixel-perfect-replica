import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  verified: "bg-success/12 text-success border-success/30",
  pending: "bg-warning/15 text-warning-foreground border-warning/40",
  revoked: "bg-destructive/12 text-destructive border-destructive/30",
  rejected: "bg-destructive/12 text-destructive border-destructive/30",
  allowed: "bg-success/12 text-success border-success/30",
  denied: "bg-destructive/12 text-destructive border-destructive/30",
  expired: "bg-muted text-muted-foreground border-border",
  not_found: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const key = status.toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize tracking-wide",
        styles[key] ?? "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      {key.replace(/_/g, " ")}
    </span>
  );
}
