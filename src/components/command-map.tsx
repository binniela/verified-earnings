import Link from "next/link";
import {
  Activity,
  BadgeCheck,
  Bookmark,
  Crosshair,
  Layers3,
  Radio,
  Share2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { ClaimCard } from "@/components/claim-card";
import {
  ActionChip,
  ActionLink,
  CommandHeader,
  CommandPanel,
  CommandShell,
  MetricTile,
  StatusPill,
  type Tone,
} from "@/components/ui";
import { formatClaimType, formatCurrency } from "@/lib/format";
import type { ClaimType, EarningClaim, MapSegment } from "@/lib/types";

const cityPositions: Record<string, { x: number; y: number }> = {
  "Los Angeles": { x: 13, y: 63 },
  "San Francisco": { x: 10, y: 49 },
  Seattle: { x: 15, y: 22 },
  Denver: { x: 42, y: 50 },
  Austin: { x: 53, y: 72 },
  Chicago: { x: 62, y: 38 },
  Miami: { x: 82, y: 78 },
  "New York": { x: 86, y: 34 },
};

const claimTone: Record<ClaimType, { color: string; label: string; tone: Tone }> = {
  career: { color: "#58A6FF", label: "CAREER", tone: "info" },
  business: { color: "#3FB950", label: "BUSINESS", tone: "success" },
  freelance: { color: "#D29922", label: "FREELANCE", tone: "warning" },
  trading: { color: "#A371F7", label: "TRADING", tone: "trading" },
};

function LayerButton({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-9 items-center border px-3 text-[10px] font-black uppercase tracking-[0.14em] transition ${
        active
          ? "border-[#58A6FF]/50 bg-[#58A6FF]/14 text-[#58A6FF]"
          : "border-[#30363D] bg-[#0D1117] text-[#8B949E] hover:border-[#58A6FF]/35 hover:text-[#C9D1D9]"
      }`}
    >
      {label}
    </Link>
  );
}

export function CommandMap({
  segments,
  claims,
  selectedSegment,
  activeClaimType,
  mentorOnly,
}: {
  segments: MapSegment[];
  claims: EarningClaim[];
  selectedSegment?: MapSegment;
  activeClaimType?: ClaimType;
  mentorOnly: boolean;
}) {
  const selected = selectedSegment ?? segments[0];
  const selectedClaims = selected
    ? claims.filter(
        (claim) =>
          claim.claimType === selected.claimType &&
          claim.category === selected.category &&
          claim.city === selected.city,
      )
    : claims;
  const totalClaims = segments.reduce((sum, segment) => sum + segment.count, 0);
  const mentorCount = segments.reduce((sum, segment) => sum + segment.mentorCount, 0);

  return (
    <CommandShell>
        <CommandHeader
          eyebrow="Verified earnings operations"
          title="Social Earnings Map"
          actions={
            <>
            <LayerButton href="/map" active={!activeClaimType} label="All layers" />
            {(["career", "business", "freelance", "trading"] as ClaimType[]).map((type) => (
              <LayerButton key={type} href={`/map?claimType=${type}`} active={activeClaimType === type} label={claimTone[type].label} />
            ))}
            <LayerButton
              href={`/map?${new URLSearchParams({
                ...(activeClaimType ? { claimType: activeClaimType } : {}),
                mentorOnly: "true",
              })}`}
              active={mentorOnly}
              label="Mentors"
            />
            </>
          }
          status={
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-ops-info">
              <Radio className="size-4" />
              A command-center view of verified earning claims, mentor supply, sparse segments, and rank-ready markets.
            </div>
          }
        />

        <div className="mt-5 grid gap-5 xl:grid-cols-[280px_minmax(520px,1fr)_360px]">
          <aside className="space-y-5">
            <CommandPanel eyebrow="Intel layers" title="Network state">
              <div className="grid gap-3">
                <MetricTile label="Verified claims" value={`${totalClaims}`} tone="info" />
                <MetricTile label="Active mentors" value={`${mentorCount}`} tone="success" />
                <MetricTile label="Visible segments" value={`${segments.length}`} tone="warning" />
              </div>
              <div className="mt-4 border border-ops-border bg-ops-bg p-3">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-ops-muted">
                  <Layers3 className="size-4" />
                  Badge policy
                </div>
                <div className="space-y-2 text-[11px] leading-5 text-ops-text">
                  <p>Only approved public claims render on this map.</p>
                  <p>Business and trading proof stays manual-review only.</p>
                  <p>Rank cards unlock at n &gt;= 20 verified peers.</p>
                </div>
              </div>
            </CommandPanel>

            <CommandPanel eyebrow="Social graph" title="Follow targets">
              <div className="space-y-2">
                {segments.slice(0, 7).map((segment) => (
                  <Link
                    key={segment.key}
                    href={`/map?claimType=${segment.claimType}&category=${encodeURIComponent(segment.category)}&city=${encodeURIComponent(segment.city)}`}
                    className="flex items-center justify-between border border-ops-border bg-ops-surface px-3 py-2 text-[11px] hover:border-ops-info/50"
                  >
                    <span>
                      {segment.category} · {segment.city}
                    </span>
                    <span className="text-ops-info">{segment.count}</span>
                  </Link>
                ))}
              </div>
            </CommandPanel>
          </aside>

          <section className="border border-ops-border bg-[#05070A]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ops-border bg-ops-panel px-4 py-3">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-ops-text">
                <Crosshair className="size-4 text-ops-info" />
                Claim density surface
              </div>
              <div className="flex gap-2 text-[10px] font-black uppercase tracking-[0.14em]">
                <StatusPill tone="info">Rank aware</StatusPill>
                <StatusPill tone="success">Mentor signal</StatusPill>
              </div>
            </div>

            <div className="relative min-h-[620px] overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(88,166,255,0.14),transparent_26%),radial-gradient(circle_at_78%_72%,rgba(63,185,80,0.11),transparent_24%),linear-gradient(180deg,#0A0C10,#05070A)]">
              <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(88,166,255,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(88,166,255,0.10)_1px,transparent_1px)] [background-size:42px_42px]" />
              <div className="absolute inset-x-10 top-1/2 h-px bg-[#30363D]" />
              <div className="absolute inset-y-10 left-1/2 w-px bg-[#30363D]" />

              {segments.map((segment) => {
                const position = cityPositions[segment.city] ?? { x: 50, y: 50 };
                const tone = claimTone[segment.claimType].color;
                const size = Math.min(86, Math.max(34, 26 + segment.count * 2.2));
                const isSelected = selected?.key === segment.key;

                return (
                  <Link
                    key={segment.key}
                    href={`/map?claimType=${segment.claimType}&category=${encodeURIComponent(segment.category)}&city=${encodeURIComponent(segment.city)}${mentorOnly ? "&mentorOnly=true" : ""}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${position.x}%`, top: `${position.y}%` }}
                    aria-label={`${segment.category} in ${segment.city}`}
                  >
                    <span
                      className="absolute left-1/2 top-1/2 rounded-full opacity-25 blur-md"
                      style={{
                        width: size * 1.8,
                        height: size * 1.8,
                        marginLeft: -(size * 0.9),
                        marginTop: -(size * 0.9),
                        background: tone,
                      }}
                    />
                    <span
                      className={`relative flex items-center justify-center rounded-full border font-black text-[#F0F6FC] shadow-[0_0_34px_rgba(0,0,0,0.45)] ${
                        isSelected ? "outline outline-2 outline-offset-4 outline-[#F0F6FC]/60" : ""
                      }`}
                      style={{
                        width: size,
                        height: size,
                        borderColor: tone,
                        background: `linear-gradient(180deg, ${tone}33, #0D1117 72%)`,
                      }}
                    >
                      {segment.count}
                    </span>
                    <span className="absolute left-1/2 top-[calc(100%+10px)] w-44 -translate-x-1/2 border border-[#30363D] bg-[#0D1117]/90 px-2 py-1 text-center text-[10px] font-black uppercase tracking-[0.12em] text-[#C9D1D9]">
                      {segment.city} · {segment.category}
                    </span>
                  </Link>
                );
              })}

              <div className="absolute bottom-4 left-4 right-4 grid gap-3 md:grid-cols-4">
                {(["career", "business", "freelance", "trading"] as ClaimType[]).map((type) => (
                  <div key={type} className="border border-ops-border bg-ops-panel/92 p-3">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ background: claimTone[type].color }} />
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-ops-muted">{claimTone[type].label}</p>
                    </div>
                    <p className="mt-2 text-sm font-black text-ops-text">{formatClaimType(type)}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <CommandPanel eyebrow="Selected segment" title={selected ? `${selected.category} / ${selected.city}` : "No signal"}>
              {selected ? (
                <div>
                  <div className="grid grid-cols-2 gap-3">
                    <MetricTile label="Median" value={formatCurrency(selected.medianCents, true)} tone={claimTone[selected.claimType].tone} />
                    <MetricTile label="Top shown" value={formatCurrency(selected.topCents, true)} tone="neutral" />
                    <MetricTile label="Verified" value={`${selected.count}`} tone="info" />
                    <MetricTile label="Mentors" value={`${selected.mentorCount}`} tone="success" />
                  </div>
                  <div className="mt-4 border border-ops-border bg-ops-bg p-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em]">
                      {selected.percentileAvailable ? (
                        <>
                          <BadgeCheck className="size-4 text-ops-success" />
                          <span className="text-ops-success">Rank cards online</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="size-4 text-ops-warning" />
                          <span className="text-ops-warning">More data needed</span>
                        </>
                      )}
                    </div>
                    <p className="mt-2 text-[11px] leading-5 text-ops-muted">
                      {selected.percentileAvailable
                        ? "This segment has enough verified peers for percentile and rank-card generation."
                        : "This segment shows verified examples and ranges until it reaches 20 matched claims."}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <ActionChip tone="info">
                      <Users className="size-4" />
                      Follow segment
                    </ActionChip>
                    <ActionChip tone="neutral">
                      <Bookmark className="size-4" />
                      Save briefing
                    </ActionChip>
                    <ActionLink href={`/share/claim/${selectedClaims[0]?.shareSlug ?? ""}`} tone="info">
                      <Share2 className="size-4" />
                      Share proof card
                    </ActionLink>
                  </div>
                </div>
              ) : null}
            </CommandPanel>

            <CommandPanel eyebrow="Live claims" title="Briefing queue">
              <div className="space-y-3">
                {selectedClaims.slice(0, 5).map((claim) => (
                  <Link
                    key={claim.id}
                    href={`/profile/${claim.userId}`}
                    className="block border border-ops-border bg-ops-surface p-3 hover:border-ops-info/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-ops-text">{claim.role}</p>
                        <p className="mt-1 text-[10px] text-ops-muted">{claim.amountBasis.replaceAll("_", " ")}</p>
                      </div>
                      <p className="text-sm font-black" style={{ color: claimTone[claim.claimType].color }}>
                        {formatCurrency(claim.amountCents, true)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CommandPanel>
          </aside>
        </div>

        <section className="mt-5 grid gap-4 lg:grid-cols-2">
          {selectedClaims.slice(0, 4).map((claim) => (
            <div key={claim.id} className="[&_*]:tracking-normal">
              <ClaimCard claim={claim} />
            </div>
          ))}
        </section>

        <div className="mt-5 border border-ops-border bg-ops-panel p-4 text-[11px] leading-5 text-ops-muted">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-ops-info">
            <Activity className="size-4" />
            Attribution and adaptation note
          </div>
          The command-center mapping style is adapted from the public MIT-licensed Family Trip Command Center repo. This
          implementation uses Verified Earnings data and original components rather than copying trip-planning behavior.
        </div>
    </CommandShell>
  );
}
