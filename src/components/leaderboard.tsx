"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BadgeCheck, CalendarDays, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { publicClaims } from "@/lib/analytics";
import type { ClaimType, EarningClaim } from "@/lib/types";
import { getMentorOfferForClaim, getUser } from "@/lib/data";

const claimTypes: { value: ClaimType | "all" | "mentors"; label: string }[] = [
  { value: "mentors",  label: "Mentors"   },
  { value: "all",      label: "All"       },
  { value: "career",   label: "Career"    },
  { value: "business", label: "Business"  },
  { value: "freelance",label: "Freelance" },
  { value: "trading",  label: "Trading"   },
];

const sortOptions = [
  { value: "amount", label: "Highest first" },
  { value: "recent", label: "Most recent"  },
];

const claimDot: Record<ClaimType, string> = {
  career:   "bg-[#58A6FF]",
  business: "bg-[#3FB950]",
  freelance:"bg-[#D29922]",
  trading:  "bg-[#A371F7]",
};

const rankStyle = (rank: number) => {
  if (rank === 1) return "text-[#F0C060]";
  if (rank === 2) return "text-[#C0C8D4]";
  if (rank === 3) return "text-[#C4855A]";
  return "text-[#3D444D]";
};

function EarnerRow({ claim, rank }: { claim: EarningClaim; rank: number }) {
  const user = getUser(claim.userId);
  const mentorOffer = getMentorOfferForClaim(claim.id);
  const displayName = claim.displayAnonymously ? user?.anonymousName : user?.name;

  return (
    <div className="group flex items-center gap-5 border-b border-[#1a1f27] px-4 py-4 transition-colors hover:bg-[#0d1117]">
      {/* Rank */}
      <span className={`w-8 shrink-0 text-right text-sm font-black tabular-nums ${rankStyle(rank)}`}>
        {String(rank).padStart(2, "0")}
      </span>

      {/* Claim type dot */}
      <span className={`size-2 shrink-0 rounded-full ${claimDot[claim.claimType]}`} />

      {/* Name + role */}
      <Link href={`/profile/${claim.userId}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#f0f6fc] group-hover:text-white">
          {displayName}
        </p>
        <p className="mt-0.5 truncate text-xs text-[#8b949e]">
          {claim.role}
          {claim.city ? <> &middot; <MapPin className="mb-0.5 inline size-3" /> {claim.city}</> : null}
        </p>
      </Link>

      {/* Verified check */}
      {claim.verificationTier > 0 && (
        <BadgeCheck className="hidden size-4 shrink-0 text-[#58A6FF] sm:block" />
      )}

      {/* Amount */}
      <div className="shrink-0 text-right">
        <p className="text-base font-black text-[#f0f6fc]">
          {formatCurrency(claim.amountCents, true)}
        </p>
        <p className="text-[10px] text-[#8b949e]">
          {claim.amountBasis.replaceAll("_", " ")}
        </p>
      </div>

      {/* Book button — only for mentors */}
      {mentorOffer ? (
        <Link
          href={mentorOffer.calendlyUrl ?? `/profile/${claim.userId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden shrink-0 items-center gap-1.5 border border-[#3FB950] px-3 py-1.5 text-xs font-semibold text-[#3FB950] transition-colors hover:bg-[#3FB950] hover:text-[#0a0c10] sm:flex"
          onClick={(e) => e.stopPropagation()}
        >
          <CalendarDays className="size-3" />
          Book · {formatCurrency(mentorOffer.rateCents)}
        </Link>
      ) : (
        <span className="hidden w-[100px] shrink-0 sm:block" />
      )}
    </div>
  );
}

export function Leaderboard({
  claims: rawClaims,
  cities,
}: {
  claims: EarningClaim[];
  cities: string[];
}) {
  const [claimType, setClaimType] = useState<ClaimType | "all" | "mentors">("mentors");
  const [city, setCity] = useState("all");
  const [sort, setSort] = useState<"amount" | "recent">("amount");

  const claims = useMemo(() => {
    let list = publicClaims(rawClaims);
    if (claimType === "mentors") list = list.filter((c) => !!getMentorOfferForClaim(c.id));
    else if (claimType !== "all") list = list.filter((c) => c.claimType === claimType);
    if (city !== "all") list = list.filter((c) => c.city === city);
    if (sort === "amount") list = [...list].sort((a, b) => b.amountCents - a.amountCents);
    if (sort === "recent") list = [...list].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    return list;
  }, [rawClaims, claimType, city, sort]);

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1a1f27] px-4 pb-4 pt-2">
        {/* Claim type tabs */}
        <div className="flex gap-1">
          {claimTypes.map((t) => (
            <button
              key={t.value}
              onClick={() => setClaimType(t.value)}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                claimType === t.value
                  ? "text-[#f0f6fc]"
                  : "text-[#8b949e] hover:text-[#c9d1d9]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Right filters */}
        <div className="flex items-center gap-4">
          {/* City */}
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-transparent text-xs text-[#8b949e] focus:outline-none hover:text-[#c9d1d9] cursor-pointer"
          >
            <option value="all">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Sort */}
          <div className="flex gap-1">
            {sortOptions.map((s) => (
              <button
                key={s.value}
                onClick={() => setSort(s.value as "amount" | "recent")}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                  sort === s.value
                    ? "text-[#f0f6fc]"
                    : "text-[#8b949e] hover:text-[#c9d1d9]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div>
        {claims.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-[#8b949e]">No verified claims match these filters.</p>
        ) : (
          claims.map((claim, i) => (
            <EarnerRow key={claim.id} claim={claim} rank={i + 1} />
          ))
        )}
      </div>
    </div>
  );
}
