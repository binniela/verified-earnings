import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { mentorOffers } from "@/lib/seed-data";
import { formatCurrency } from "@/lib/format";
import { getClaim, getUser } from "@/lib/data";
import type { ClaimType } from "@/lib/types";

const claimTypes: { value: ClaimType | "all"; label: string }[] = [
  { value: "all",      label: "All"       },
  { value: "career",   label: "Career"    },
  { value: "business", label: "Business"  },
  { value: "freelance",label: "Freelance" },
  { value: "trading",  label: "Trading"   },
];

const claimDot: Record<ClaimType, string> = {
  career:   "bg-[#58A6FF]",
  business: "bg-[#3FB950]",
  freelance:"bg-[#D29922]",
  trading:  "bg-[#A371F7]",
};

export default function MentorsPage({
  searchParams,
}: {
  searchParams: { claimType?: ClaimType };
}) {
  const activeType = searchParams.claimType;

  const offers = mentorOffers.filter((offer) => {
    if (offer.status !== "active") return false;
    const claim = getClaim(offer.claimId);
    if (!claim) return false;
    if (activeType && claim.claimType !== activeType) return false;
    return true;
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#f0f6fc]">Mentors</h1>
        <p className="mt-2 text-sm text-[#8b949e]">
          Every mentor&apos;s offer is tied to a verified earning claim. No vibes, no unverified credentials.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-1 border-b border-[#1a1f27] pb-1">
        {claimTypes.map((t) => (
          <Link
            key={t.value}
            href={t.value === "all" ? "/mentors" : `/mentors?claimType=${t.value}`}
            className={`px-3 py-2 text-xs font-semibold transition-colors ${
              (t.value === "all" && !activeType) || activeType === t.value
                ? "text-[#f0f6fc]"
                : "text-[#8b949e] hover:text-[#c9d1d9]"
            }`}
          >
            {t.label}
          </Link>
        ))}
        <span className="ml-auto py-2 text-xs text-[#8b949e]">{offers.length} mentors</span>
      </div>

      {/* Mentor grid */}
      {offers.length === 0 ? (
        <p className="py-16 text-center text-sm text-[#8b949e]">No mentors match this filter.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {offers.map((offer) => {
            const claim = getClaim(offer.claimId);
            const user = getUser(offer.userId);
            if (!claim || !user) return null;
            const displayName = claim.displayAnonymously ? user.anonymousName : user.name;

            return (
              <div key={offer.id} className="border border-[#1a1f27] p-5 hover:border-[#30363d] transition-colors">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 shrink-0 rounded-full ${claimDot[claim.claimType]}`} />
                    <Link href={`/profile/${user.id}`} className="text-xs text-[#8b949e] hover:text-[#f0f6fc] transition-colors">
                      {displayName}
                    </Link>
                  </div>
                  <span className="text-xs text-[#8b949e]">{offer.durationMinutes} min</span>
                </div>

                {/* Title */}
                <h3 className="mt-3 text-sm font-semibold text-[#f0f6fc]">{offer.title}</h3>

                {/* Verified claim */}
                <p className="mt-1 text-xs text-[#8b949e]">
                  Verified {formatCurrency(claim.amountCents, true)} · {claim.role} · {claim.city}
                </p>

                {/* Topics */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {offer.topics.map((topic) => (
                    <span key={topic} className="text-[10px] text-[#8b949e]">
                      {topic}
                    </span>
                  ))}
                </div>

                {claim.claimType === "trading" && (
                  <p className="mt-3 text-[11px] text-[#D29922]">
                    Education only — no signals or guaranteed returns.
                  </p>
                )}

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-[#1a1f27] pt-4">
                  <span className="text-base font-black text-[#f0f6fc]">
                    {formatCurrency(offer.rateCents)}
                    <span className="ml-1 text-xs font-normal text-[#8b949e]">/ {offer.durationMinutes} min</span>
                  </span>
                  <Link
                    href={offer.calendlyUrl ?? `/profile/${user.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 border border-[#3FB950] px-3 py-1.5 text-xs font-semibold text-[#3FB950] transition-colors hover:bg-[#3FB950] hover:text-[#0a0c10]"
                  >
                    <CalendarDays className="size-3.5" />
                    Book session
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
