import Link from "next/link";
import { CalendarDays, ShieldCheck, Target } from "lucide-react";
import { VerificationBadge } from "@/components/badge";
import { ActionLink, Card, MetadataRow, StatusPill } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { getClaim, getUser } from "@/lib/data";
import type { MentorOffer } from "@/lib/types";

export function MentorCard({ offer }: { offer: MentorOffer }) {
  const claim = getClaim(offer.claimId);
  const user = getUser(offer.userId);

  if (!claim || !user) return null;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4 border-b border-ops-border pb-4">
        <div>
          <VerificationBadge tier={claim.verificationTier} basis={claim.amountBasis} />
          <h3 className="mt-3 text-[13px] font-black uppercase tracking-[0.12em] text-ops-text">
            <Link href={`/profile/${user.id}`} className="hover:text-ops-info">
              {offer.title}
            </Link>
          </h3>
          <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-ops-muted">
            {claim.displayAnonymously ? user.anonymousName : user.name}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-ops-text">{formatCurrency(offer.rateCents)}</p>
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-ops-muted">{offer.durationMinutes} min</p>
        </div>
      </div>

      <div className="mt-4 grid gap-1">
        <MetadataRow label="Verified basis" value={claim.amountBasis.replaceAll("_", " ")} />
        <MetadataRow label="Market" value={`${claim.category} / ${claim.city}`} />
        <MetadataRow label="Proof note" value={claim.proofNote} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {offer.topics.map((topic) => (
          <StatusPill key={topic} tone={topic.includes("education") ? "warning" : "neutral"}>
            {topic}
          </StatusPill>
        ))}
      </div>

      {claim.claimType === "trading" ? (
        <div className="mt-4 border border-ops-warning/35 bg-ops-warning/10 p-3 text-[11px] leading-5 text-ops-warning">
          <div className="mb-1 flex items-center gap-2 font-black uppercase tracking-[0.14em]">
            <ShieldCheck className="size-4" />
            Trading guardrail
          </div>
          Education only. No signals, copy trading, guaranteed returns, or performance promises.
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <ActionLink href={`/api/sessions?mentorOfferId=${offer.id}`} tone="success">
          <CalendarDays className="size-4" />
          Book session
        </ActionLink>
        <ActionLink href={`/profile/${user.id}`} tone="neutral">
          <Target className="size-4" />
          Proof dossier
        </ActionLink>
      </div>
    </Card>
  );
}
