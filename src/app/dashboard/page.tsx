import Link from "next/link";
import { BadgeCheck, Clock, Lock } from "lucide-react";
import { ReferralGateCard } from "@/components/referral-gate-card";
import { getCurrentUserBundle } from "@/lib/data";
import { formatCurrency, formatPeriod } from "@/lib/format";

const statusColor: Record<string, string> = {
  approved: "text-[#3FB950]",
  pending:  "text-[#D29922]",
  draft:    "text-[#8b949e]",
  rejected: "text-[#F85149]",
  flagged:  "text-[#F85149]",
};

const visibilityIcon = (v: string) => {
  if (v === "public")  return <BadgeCheck className="size-3.5 text-[#58A6FF]" />;
  if (v === "gated")   return <Lock className="size-3.5 text-[#D29922]" />;
  return <Clock className="size-3.5 text-[#8b949e]" />;
};

export default function DashboardPage() {
  const { user, claims, follows, savedItems } = getCurrentUserBundle();
  const approved = claims.filter((c) => c.verificationStatus === "approved").length;
  const pending  = claims.filter((c) => c.verificationStatus === "pending").length;
  const gated    = claims.filter((c) => c.visibilityStatus === "gated");

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#f0f6fc]">{user.name}</h1>
          {user.headline && <p className="mt-1 text-sm text-[#8b949e]">{user.headline}</p>}
        </div>
        <Link
          href="/claim/new"
          className="inline-flex h-9 items-center border border-[#30363d] px-4 text-xs font-semibold text-[#f0f6fc] hover:border-[#8b949e] transition-colors"
        >
          + Add claim
        </Link>
      </div>

      {/* Stats strip */}
      <div className="mb-8 flex flex-wrap gap-8 border-b border-[#1a1f27] pb-8">
        <div>
          <p className="text-2xl font-black text-[#f0f6fc]">{claims.length}</p>
          <p className="mt-0.5 text-xs text-[#8b949e]">Claims</p>
        </div>
        <div>
          <p className="text-2xl font-black text-[#3FB950]">{approved}</p>
          <p className="mt-0.5 text-xs text-[#8b949e]">Approved</p>
        </div>
        <div>
          <p className="text-2xl font-black text-[#D29922]">{pending}</p>
          <p className="mt-0.5 text-xs text-[#8b949e]">Pending</p>
        </div>
        <div>
          <p className="text-2xl font-black text-[#f0f6fc]">{follows.length}</p>
          <p className="mt-0.5 text-xs text-[#8b949e]">Following</p>
        </div>
      </div>

      {/* Referral gate cards */}
      {gated.length > 0 && (
        <div className="mb-8 space-y-3">
          {gated.map((claim) => (
            <ReferralGateCard key={claim.id} claim={claim} />
          ))}
        </div>
      )}

      {/* Claims list */}
      <section className="mb-10">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#8b949e]">Your claims</h2>

        {claims.length === 0 ? (
          <p className="py-8 text-sm text-[#8b949e]">
            No claims yet.{" "}
            <Link href="/claim/new" className="text-[#58A6FF] hover:underline">
              Add your first claim →
            </Link>
          </p>
        ) : (
          <div className="divide-y divide-[#1a1f27]">
            {claims.map((claim) => (
              <div key={claim.id} className="flex items-center gap-4 py-4">
                {/* Visibility */}
                <span className="shrink-0">{visibilityIcon(claim.visibilityStatus)}</span>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#f0f6fc]">
                    {claim.role} · {claim.city}
                  </p>
                  <p className="mt-0.5 text-xs text-[#8b949e]">
                    {formatPeriod(claim.periodStart, claim.periodEnd)}
                  </p>
                </div>

                {/* Status */}
                <span className={`text-xs font-semibold ${statusColor[claim.verificationStatus] ?? "text-[#8b949e]"}`}>
                  {claim.verificationStatus}
                </span>

                {/* Amount */}
                <span className="shrink-0 text-sm font-black text-[#f0f6fc]">
                  {formatCurrency(claim.amountCents, true)}
                </span>

                <Link
                  href={`/verify`}
                  className="shrink-0 text-xs text-[#8b949e] hover:text-[#f0f6fc] transition-colors"
                >
                  Details →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Following */}
      {follows.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#8b949e]">Following</h2>
          <div className="flex flex-wrap gap-2">
            {follows.map((follow) => (
              <span
                key={follow.id}
                className="border border-[#1a1f27] px-3 py-1 text-xs text-[#8b949e]"
              >
                {follow.targetValue}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Saved */}
      {savedItems.length > 0 && (
        <section>
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#8b949e]">Saved</h2>
          <p className="text-sm text-[#8b949e]">{savedItems.length} saved items</p>
        </section>
      )}
    </main>
  );
}
