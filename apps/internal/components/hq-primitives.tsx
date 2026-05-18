import Link from "next/link";
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

export function MetricCard({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
  tone?: Tone;
}) {
  return (
    <div className="hq-panel rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-text-secondary">{label}</p>
        <StatusPill tone={tone}>{tone}</StatusPill>
      </div>
      <div className="mt-3 text-3xl font-bold text-text-primary">{value}</div>
      {detail ? <div className="mt-2 text-sm text-text-tertiary">{detail}</div> : null}
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

export function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: Array<Array<React.ReactNode>>;
}) {
  if (rows.length === 0) {
    return <EmptyState title="No data yet">No records are available for this view.</EmptyState>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface-muted text-xs uppercase text-text-tertiary">
            <tr>
              {columns.map((column) => (
                <th className="whitespace-nowrap px-4 py-3 font-bold" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="text-text-secondary">
                {row.map((cell, cellIndex) => (
                  <td className="whitespace-nowrap px-4 py-3" key={cellIndex}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DepartmentLink({
  href,
  title,
  children,
}: {
  href: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      className="hq-panel block rounded-lg p-4 transition hover:-translate-y-0.5 hover:border-family-primary/30"
      href={href}
    >
      <h3 className="text-base font-bold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{children}</p>
    </Link>
  );
}

export function KeyValueList({
  items,
}: {
  items: Array<{ label: string; value: React.ReactNode }>;
}) {
  return (
    <dl className="divide-y divide-border rounded-lg border border-border bg-surface">
      {items.map((item) => (
        <div className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_1fr]" key={item.label}>
          <dt className="text-sm font-semibold text-text-tertiary">{item.label}</dt>
          <dd className="text-sm text-text-primary">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function RedactedValue({ label = "redacted" }: { label?: string }) {
  return (
    <span className="inline-flex rounded bg-surface-muted px-2 py-1 font-mono text-xs text-text-tertiary">
      {label}
    </span>
  );
}
