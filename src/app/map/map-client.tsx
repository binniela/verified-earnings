"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, X } from "lucide-react";
import { GoogleCommandMap } from "@/components/google-command-map";
import { formatCurrency } from "@/lib/format";
import type { ClaimType, EarningClaim, MapSegment } from "@/lib/types";

const claimTypes: { value: ClaimType | "all"; label: string }[] = [
  { value: "all",      label: "All"       },
  { value: "career",   label: "Career"    },
  { value: "business", label: "Business"  },
  { value: "freelance",label: "Freelance" },
  { value: "trading",  label: "Trading"   },
];

const claimColor: Record<ClaimType, string> = {
  career:   "#58A6FF",
  business: "#3FB950",
  freelance:"#D29922",
  trading:  "#A371F7",
};

export function MapPageClient({
  segments,
  allClaims,
  initialSelected,
  activeClaimType,
  mentorOnly,
}: {
  segments: MapSegment[];
  allClaims: EarningClaim[];
  initialSelected?: MapSegment;
  activeClaimType?: ClaimType;
  mentorOnly: boolean;
}) {
  const [selected, setSelected] = useState<MapSegment | undefined>(initialSelected);

  const selectedClaims = selected
    ? allClaims.filter(
        (c) =>
          c.claimType === selected.claimType &&
          c.category === selected.category &&
          c.city === selected.city,
      )
    : [];

  return (
    <div className="flex h-[calc(100vh-49px)] flex-col">
      {/* Filter bar */}
      <div className="flex items-center gap-1 border-b border-[#1a1f27] bg-[#0a0c10] px-4 py-2">
        {claimTypes.map((t) => (
          <Link
            key={t.value}
            href={
              t.value === "all"
                ? "/map"
                : `/map?claimType=${t.value}${mentorOnly ? "&mentorOnly=true" : ""}`
            }
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
              (t.value === "all" && !activeClaimType) || activeClaimType === t.value
                ? "text-[#f0f6fc]"
                : "text-[#8b949e] hover:text-[#c9d1d9]"
            }`}
          >
            {t.label}
          </Link>
        ))}
        <Link
          href={`/map?${new URLSearchParams({ ...(activeClaimType ? { claimType: activeClaimType } : {}), mentorOnly: "true" })}`}
          className={`ml-2 px-3 py-1.5 text-xs font-semibold transition-colors ${
            mentorOnly ? "text-[#3FB950]" : "text-[#8b949e] hover:text-[#c9d1d9]"
          }`}
        >
          Mentors only
        </Link>

        <span className="ml-auto text-xs text-[#3D444D]">
          {segments.length} markets · click a city
        </span>
      </div>

      {/* Map — full width */}
      <div className="relative flex-1">
        <GoogleCommandMap
          segments={segments}
          selectedSegment={selected}
          onSelectSegment={setSelected}
        />

        {/* Segment overlay — slides up when a dot is clicked */}
        {selected && (
          <div className="absolute bottom-0 left-0 right-0 border-t border-[#1a1f27] bg-[#0a0c10]/96 backdrop-blur">
            <div className="mx-auto max-w-4xl px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                {/* Left: segment info */}
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ background: claimColor[selected.claimType] }}
                    />
                    <span className="text-xs text-[#8b949e]">
                      {selected.claimType} · {selected.category}
                    </span>
                  </div>
                  <h2 className="mt-1 text-lg font-black text-[#f0f6fc]">{selected.city}</h2>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6">
                  <div>
                    <p className="text-base font-black text-[#f0f6fc]">
                      {formatCurrency(selected.medianCents, true)}
                    </p>
                    <p className="text-[10px] text-[#8b949e]">Median</p>
                  </div>
                  <div>
                    <p className="text-base font-black text-[#f0f6fc]">
                      {formatCurrency(selected.topCents, true)}
                    </p>
                    <p className="text-[10px] text-[#8b949e]">Top</p>
                  </div>
                  <div>
                    <p className="text-base font-black text-[#f0f6fc]">{selected.count}</p>
                    <p className="text-[10px] text-[#8b949e]">Verified</p>
                  </div>
                  <div>
                    <p className="text-base font-black text-[#3FB950]">{selected.mentorCount}</p>
                    <p className="text-[10px] text-[#8b949e]">Mentors</p>
                  </div>
                </div>

                {/* Right: rank status + close */}
                <div className="flex items-center gap-4">
                  {selected.percentileAvailable ? (
                    <span className="flex items-center gap-1 text-xs text-[#3FB950]">
                      <BadgeCheck className="size-3.5" />
                      Rank cards on
                    </span>
                  ) : (
                    <span className="text-xs text-[#8b949e]">Need {20 - selected.count} more for rankings</span>
                  )}
                  <button onClick={() => setSelected(undefined)} className="text-[#8b949e] hover:text-[#f0f6fc]">
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              {/* Recent claims in this segment */}
              {selectedClaims.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3 border-t border-[#1a1f27] pt-3">
                  {selectedClaims.slice(0, 5).map((claim) => (
                    <Link
                      key={claim.id}
                      href={`/profile/${claim.userId}`}
                      className="text-xs text-[#8b949e] hover:text-[#f0f6fc] transition-colors"
                    >
                      {formatCurrency(claim.amountCents, true)} · {claim.role}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
