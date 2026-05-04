import { clsx } from "clsx";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export type Tone = "info" | "success" | "warning" | "danger" | "trading" | "neutral";

export const toneStyles: Record<Tone, { text: string; bg: string; border: string; dot: string }> = {
  info: {
    text: "text-ops-info",
    bg: "bg-[rgba(88,166,255,0.12)]",
    border: "border-[rgba(88,166,255,0.35)]",
    dot: "bg-ops-info",
  },
  success: {
    text: "text-ops-success",
    bg: "bg-[rgba(63,185,80,0.12)]",
    border: "border-[rgba(63,185,80,0.35)]",
    dot: "bg-ops-success",
  },
  warning: {
    text: "text-ops-warning",
    bg: "bg-[rgba(210,153,34,0.12)]",
    border: "border-[rgba(210,153,34,0.35)]",
    dot: "bg-ops-warning",
  },
  danger: {
    text: "text-ops-danger",
    bg: "bg-[rgba(248,81,73,0.12)]",
    border: "border-[rgba(248,81,73,0.35)]",
    dot: "bg-ops-danger",
  },
  trading: {
    text: "text-ops-trading",
    bg: "bg-[rgba(163,113,247,0.12)]",
    border: "border-[rgba(163,113,247,0.35)]",
    dot: "bg-ops-trading",
  },
  neutral: {
    text: "text-ops-muted",
    bg: "bg-ops-surface",
    border: "border-ops-border",
    dot: "bg-ops-muted",
  },
};

export const opsLabels = {
  verifiedClaims: "Verified claims",
  manualReview: "Manual review required",
  moreData: "More data needed",
  rankOnline: "Rank cards online",
  mentorSignal: "Mentor signal",
  proofDossier: "Proof dossier",
  watchMarket: "Watch market",
  proofIntake: "Proof intake",
  saveBriefing: "Save briefing",
  shareProof: "Share proof card",
  followSegment: "Follow segment",
};

export function CommandShell({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <main className={clsx("min-h-[calc(100vh-65px)] bg-ops-bg text-ops-text", className)}>
      <div className="mx-auto max-w-[1600px] px-4 py-5 md:px-6">{children}</div>
    </main>
  );
}

export function CommandHeader({
  eyebrow,
  title,
  children,
  actions,
  status,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  status?: ReactNode;
}) {
  return (
    <header className="border border-ops-border bg-ops-panel p-4 md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-ops-info">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-black uppercase tracking-[0.08em] text-ops-text md:text-4xl">
            {title}
          </h1>
          {children ? <div className="mt-3 max-w-3xl text-sm leading-6 text-ops-muted">{children}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2 md:justify-end">{actions}</div> : null}
      </div>
      {status ? <div className="mt-4 border-t border-ops-border pt-3">{status}</div> : null}
    </header>
  );
}

export function CommandPanel({
  title,
  eyebrow,
  children,
  className,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={clsx("border border-ops-border bg-ops-panel", className)}>
      <div className="border-b border-ops-border px-4 py-3">
        {eyebrow ? <p className="text-[9px] font-black uppercase tracking-[0.22em] text-ops-info">{eyebrow}</p> : null}
        <h2 className="mt-1 text-[12px] font-black uppercase tracking-[0.16em] text-ops-text">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function CommandGrid({
  left,
  center,
  right,
  className,
}: {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("mt-5 grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_360px]", className)}>
      <aside className="space-y-5">{left}</aside>
      <section className="min-w-0 space-y-5">{center}</section>
      <aside className="space-y-5">{right}</aside>
    </div>
  );
}

export function MetricTile({
  label,
  value,
  tone = "info",
  meta,
}: {
  label: string;
  value: string;
  tone?: Tone;
  meta?: string;
}) {
  const styles = toneStyles[tone];

  return (
    <div className="border border-ops-border bg-ops-surface p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-ops-muted">{label}</p>
      <p className={clsx("mt-2 text-xl font-black", styles.text)}>{value}</p>
      {meta ? <p className="mt-1 text-[10px] leading-4 text-ops-muted">{meta}</p> : null}
    </div>
  );
}

export function StatusPill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const styles = toneStyles[tone];

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 border px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em]",
        styles.bg,
        styles.border,
        styles.text,
        className,
      )}
    >
      <span className={clsx("size-1.5", styles.dot)} />
      {children}
    </span>
  );
}

export function ActionChip({
  children,
  tone = "neutral",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }) {
  const styles = toneStyles[tone];

  return (
    <button
      className={clsx(
        "inline-flex h-9 items-center justify-center gap-2 border px-3 text-[10px] font-black uppercase tracking-[0.14em] transition hover:border-ops-info/60 hover:text-ops-info",
        styles.bg,
        styles.border,
        styles.text,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ActionLink({
  children,
  tone = "neutral",
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { tone?: Tone }) {
  const styles = toneStyles[tone];

  return (
    <a
      className={clsx(
        "inline-flex h-9 items-center justify-center gap-2 border px-3 text-[10px] font-black uppercase tracking-[0.14em] transition hover:border-ops-info/60 hover:text-ops-info",
        styles.bg,
        styles.border,
        styles.text,
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  return (
    <button
      className={clsx(
        "inline-flex h-10 items-center justify-center gap-2 border px-4 text-[10px] font-black uppercase tracking-[0.14em] transition",
        variant === "primary" && "border-ops-info/50 bg-ops-info/15 text-ops-info hover:bg-ops-info/20",
        variant === "secondary" && "border-ops-border bg-ops-surface text-ops-text hover:border-ops-info/50",
        variant === "ghost" && "border-transparent text-ops-muted hover:border-ops-border hover:text-ops-text",
        className,
      )}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  return (
    <a
      href={href}
      className={clsx(
        "inline-flex h-10 items-center justify-center gap-2 border px-4 text-[10px] font-black uppercase tracking-[0.14em] transition",
        variant === "primary" && "border-ops-info/50 bg-ops-info/15 text-ops-info hover:bg-ops-info/20",
        variant === "secondary" && "border-ops-border bg-ops-surface text-ops-text hover:border-ops-info/50",
        variant === "ghost" && "border-transparent text-ops-muted hover:border-ops-border hover:text-ops-text",
        className,
      )}
    >
      {children}
    </a>
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("border border-ops-border bg-ops-panel", className)} {...props} />;
}

export function SectionHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? <p className="text-[10px] font-black uppercase tracking-[0.22em] text-ops-info">{eyebrow}</p> : null}
      <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.08em] text-ops-text md:text-5xl">{title}</h1>
      {children ? <div className="mt-4 text-sm leading-6 text-ops-muted">{children}</div> : null}
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return <MetricTile label={label} value={value} />;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-dashed border-ops-border bg-ops-panel p-8 text-center">
      <h3 className="text-[12px] font-black uppercase tracking-[0.16em] text-ops-text">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-ops-muted">{body}</p>
    </div>
  );
}

export function MetadataRow({ label, value }: { label: string; value?: ReactNode }) {
  if (!value) return null;

  return (
    <div className="flex items-start justify-between gap-3 border-b border-ops-border/70 py-2 text-[11px] last:border-b-0">
      <span className="font-bold uppercase tracking-[0.12em] text-ops-muted">{label}</span>
      <span className="text-right text-ops-text">{value}</span>
    </div>
  );
}
