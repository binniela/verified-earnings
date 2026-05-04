import { notFound } from "next/navigation";
import { Radar, Share2 } from "lucide-react";
import { VerificationBadge } from "@/components/badge";
import { ActionLink, CommandShell, MetadataRow, MetricTile, StatusPill } from "@/components/ui";
import { getClaimBySlug, getUser } from "@/lib/data";
import { formatBasis, formatCurrency, formatPeriod } from "@/lib/format";

export default function ClaimSharePage({ params }: { params: { slug: string } }) {
  const claim = getClaimBySlug(params.slug);

  if (!claim || claim.visibilityStatus !== "public") {
    notFound();
  }

  const user = getUser(claim.userId);
  const displayName = claim.displayAnonymously ? user?.anonymousName : user?.name;

  return (
    <CommandShell className="flex items-center">
      <div className="mx-auto w-full max-w-5xl">
        <div className="border border-ops-border bg-ops-panel p-8">
          <VerificationBadge tier={claim.verificationTier} basis={claim.amountBasis} />
          <p className="mt-8 text-[10px] font-black uppercase tracking-[0.22em] text-ops-info">Share proof card</p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.08em] text-ops-text">
            {formatCurrency(claim.amountCents)} {formatBasis(claim.amountBasis)}
          </h1>
          <p className="mt-4 max-w-3xl text-xl leading-8 text-ops-muted">
            {displayName} verified this result as a {claim.role} in {claim.city}, {claim.state}.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <MetricTile label="Category" value={claim.category} tone="info" />
            <MetricTile label="Period" value={formatPeriod(claim.periodStart, claim.periodEnd)} tone="warning" />
            <MetricTile label="Proof" value={claim.documentType?.replaceAll("_", " ") ?? "document"} tone="success" />
          </div>
          <div className="mt-6 border border-ops-border bg-ops-surface p-4">
            <MetadataRow label="Proof note" value={claim.proofNote} />
            <MetadataRow label="Claim type" value={claim.claimType} />
            <MetadataRow label="Basis" value={claim.amountBasis.replaceAll("_", " ")} />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <StatusPill tone={claim.claimType === "trading" ? "trading" : "success"}>Verified signal</StatusPill>
            <StatusPill tone="info">Public dossier</StatusPill>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            <ActionLink href={`/profile/${claim.userId}`} tone="info">
              <Share2 className="size-4" />
              View proof dossier
            </ActionLink>
            <ActionLink href={`/map?claimType=${claim.claimType}&category=${encodeURIComponent(claim.category)}&city=${encodeURIComponent(claim.city)}`} tone="neutral">
              <Radar className="size-4" />
              Watch market
            </ActionLink>
          </div>
        </div>
      </div>
    </CommandShell>
  );
}
