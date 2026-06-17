import { cn } from "@memvella/ui";

export type Tone = "neutral" | "good" | "warn" | "bad" | "info";

const toneClasses: Record<Tone, string> = {
  neutral: "border-border bg-surface-muted text-text-secondary",
  good: "border-status-success/25 bg-status-success/10 text-status-success",
  warn: "border-family-accent/25 bg-family-accent/10 text-family-primary",
  bad: "border-status-alert/25 bg-status-alert/10 text-status-alert",
  info: "border-family-muted/25 bg-family-muted/10 text-family-primary",
};

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: Tone;
}) {
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", toneClasses[tone])}>
      {children}
    </span>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-bold uppercase text-text-tertiary">{eyebrow}</p>
        ) : null}
        <h2 className="text-xl font-bold text-text-primary">{title}</h2>
      </div>
      {children ? <div className="text-sm text-text-secondary">{children}</div> : null}
    </div>
  );
}

export function HealthCard({
  title,
  status,
  tone = "neutral",
  children,
}: {
  title: string;
  status: string;
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <div className="hq-panel rounded-lg p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-base font-bold text-text-primary">{title}</h3>
        <StatusPill tone={tone}>{status}</StatusPill>
      </div>
      <div className="text-sm leading-6 text-text-secondary">{children}</div>
    </div>
  );
}

export function EmptyState({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface-muted/70 p-6">
      <h3 className="text-base font-bold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{children}</p>
    </div>
  );
}

