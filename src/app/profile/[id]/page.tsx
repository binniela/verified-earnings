import { notFound } from "next/navigation";
import Link from "next/link";
import { BadgeCheck, CalendarDays, MapPin } from "lucide-react";
import { formatCurrency, formatPeriod, initials } from "@/lib/format";
import { getProfileBundle } from "@/lib/data";

const claimDot: Record<string, string> = {
  career:   "bg-[#58A6FF]",
  business: "bg-[#3FB950]",
  freelance:"bg-[#D29922]",
  trading:  "bg-[#A371F7]",
};

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { user, claims, offers } = getProfileBundle(params.id);

  if (!user) notFound();

  const displayName = claims.every((c) => c.displayAnonymously) ? user.anonymousName : user.name;
  const totalVerified = claims.reduce((sum, c) => sum + c.amountCents, 0);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      {/* Profile header */}
      <div className="mb-10 flex items-start gap-5">
        <div className="flex size-14 shrink-0 items-center justify-center bg-[#0d1117] text-base font-black text-[#58A6FF]">
          {initials(displayName)}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-[#f0f6fc]">{displayName}</h1>
          {user.headline && <p className="mt-1 text-sm text-[#8b949e]">{user.headline}</p>}
          <div className="mt-3 flex flex-wrap gap-6">
            <div>
              <span className="text-sm font-black text-[#f0f6fc]">{claims.length}</span>
              <span className="ml-1.5 text-xs text-[#8b949e]">verified claims</span>
            </div>
            {totalVerified > 0 && (
              <div>
                <span className="text-sm font-black text-[#f0f6fc]">{formatCurrency(totalVerified, true)}</span>
                <span className="ml-1.5 text-xs text-[#8b949e]">total proven</span>
              </div>
            )}
            {offers.length > 0 && (
              <div>
                <span className="text-sm font-black text-[#3FB950]">{offers.length}</span>
                <span className="ml-1.5 text-xs text-[#8b949e]">mentor offers</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verified claims */}
      <section className="mb-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#8b949e]">Verified claims</h2>
        {claims.length === 0 ? (
          <p className="text-sm text-[#8b949e]">No public claims yet.</p>
        ) : (
          <div className="divide-y divide-[#1a1f27]">
            {claims.map((claim) => (
              <div key={claim.id} className="py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className={`mt-1.5 size-2 shrink-0 rounded-full ${claimDot[claim.claimType]}`} />
                    <div>
                      <p className="text-sm font-semibold text-[#f0f6fc]">{claim.role}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-[#8b949e]">
                        <MapPin className="size-3" />
                        {claim.city}, {claim.state}
                        <span className="mx-1">·</span>
                        {formatPeriod(claim.periodStart, claim.periodEnd)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-[#f0f6fc]">{formatCurrency(claim.amountCents, true)}</p>
                    <p className="text-[10px] text-[#8b949e]">{claim.amountBasis.replaceAll("_", " ")}</p>
                  </div>
                </div>
                {claim.summary && (
                  <p className="mt-3 pl-5 text-xs leading-6 text-[#8b949e]">{claim.summary}</p>
                )}
                <div className="mt-2 pl-5 flex items-center gap-2">
                  <BadgeCheck className="size-3.5 text-[#58A6FF]" />
                  <span className="text-[10px] text-[#58A6FF]">Document verified</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Mentor offers */}
      {offers.length > 0 && (
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#8b949e]">Mentor offers</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {offers.map((offer) => (
              <div key={offer.id} className="border border-[#1a1f27] p-4 hover:border-[#30363d] transition-colors">
                <h3 className="text-sm font-semibold text-[#f0f6fc]">{offer.title}</h3>
                <p className="mt-1 text-xs text-[#8b949e]">{offer.durationMinutes} min session</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-base font-black text-[#f0f6fc]">{formatCurrency(offer.rateCents)}</span>
                  <Link
                    href={offer.calendlyUrl ?? "#"}
                    className="flex items-center gap-1.5 text-xs text-[#58A6FF] hover:text-white transition-colors"
                  >
                    <CalendarDays className="size-3.5" />
                    Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
