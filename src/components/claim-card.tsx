import Link from "next/link";
import { Bookmark, MapPin, Radar, Share2, UserPlus } from "lucide-react";
import { VerificationBadge } from "@/components/badge";
import { ActionChip, ActionLink, Card, MetadataRow, StatusPill } from "@/components/ui";
import { formatBasis, formatClaimType, formatCurrency, formatPeriod } from "@/lib/format";
import { getMentorOfferForClaim, getUser } from "@/lib/data";
import type { EarningClaim } from "@/lib/types";

export function ClaimCard({ claim, compact = false }: { claim: EarningClaim; compact?: boolean }) {
  const user = getUser(claim.userId);
  const mentorOffer = getMentorOfferForClaim(claim.id);
  const displayName = claim.displayAnonymously ? user?.anonymousName : user?.name;

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ops-border pb-4">
        <div>
          <VerificationBadge tier={claim.verificationTier} basis={claim.amountBasis} />
          <h3 className="mt-3 text-[13px] font-black uppercase tracking-[0.12em] text-ops-text">
            <Link href={`/profile/${claim.userId}`} className="hover:text-ops-info">
              {displayName}
            </Link>
          </h3>
          <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-ops-muted">
            {claim.role} / {claim.category}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-ops-text">{formatCurrency(claim.amountCents)}</p>
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-ops-muted">
            {formatBasis(claim.amountBasis)}
          </p>
        </div>
      </div>

      {!compact ? <p className="mt-4 text-sm leading-6 text-ops-muted">{claim.summary}</p> : null}

      <div className="mt-4 grid gap-1">
        <MetadataRow label="Claim type" value={formatClaimType(claim.claimType)} />
        <MetadataRow label="Market" value={`${claim.city}, ${claim.state}`} />
        <MetadataRow label="Period" value={formatPeriod(claim.periodStart, claim.periodEnd)} />
        <MetadataRow label="Proof state" value={claim.proofNote} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatusPill tone={mentorOffer ? "success" : "neutral"}>
          {mentorOffer ? "Mentor signal" : "Proof only"}
        </StatusPill>
        <StatusPill tone={claim.claimType === "trading" ? "trading" : "info"}>
          <MapPin className="size-3" />
          {claim.city}
        </StatusPill>
        {claim.riskFlags.length > 0 ? <StatusPill tone="warning">Risk note</StatusPill> : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <ActionLink href={`/share/claim/${claim.shareSlug}`} tone="info">
          <Share2 className="size-4" />
          Share proof card
        </ActionLink>
        <ActionLink href={`/profile/${claim.userId}`} tone="neutral">
          <UserPlus className="size-4" />
          Follow signal
        </ActionLink>
        <ActionChip tone="neutral">
          <Bookmark className="size-4" />
          Save briefing
        </ActionChip>
        <ActionLink href={`/map?claimType=${claim.claimType}&category=${encodeURIComponent(claim.category)}&city=${encodeURIComponent(claim.city)}`} tone="neutral">
          <Radar className="size-4" />
          Watch market
        </ActionLink>
      </div>
    </Card>
  );
}
