import Link from "next/link";
import { MapPin } from "lucide-react";
import { Leaderboard } from "@/components/leaderboard";
import { earningClaims, mentorOffers } from "@/lib/seed-data";
import { publicClaims, getMapSegments } from "@/lib/analytics";
import { formatCurrency } from "@/lib/format";

export default function Home() {
  const claims = publicClaims(earningClaims);
  const segments = getMapSegments(earningClaims, mentorOffers);
  const cities = Array.from(new Set(claims.map((c) => c.city))).sort();
  const totalVerified = claims.reduce((sum, c) => sum + c.amountCents, 0);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-[#f0f6fc]">
          Verified earnings,<br />ranked by proof.
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-7 text-[#8b949e]">
          Every claim is document-verified before it appears here.
          No screenshots, no self-reported numbers, no noise.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-6">
          <Link
            href="/claim/new"
            className="inline-flex h-10 items-center bg-[#f0f6fc] px-5 text-sm font-black uppercase tracking-widest text-[#0a0c10] hover:bg-white transition-colors"
          >
            Add yourself
          </Link>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 text-sm text-[#8b949e] hover:text-[#f0f6fc] transition-colors"
          >
            <MapPin className="size-4" />
            Map view
          </Link>
        </div>
      </div>

      {/* Stats strip */}
      <div className="mb-8 flex flex-wrap gap-8 border-b border-[#1a1f27] pb-8">
        <div>
          <p className="text-2xl font-black text-[#f0f6fc]">{claims.length}</p>
          <p className="mt-0.5 text-xs text-[#8b949e]">Verified earners</p>
        </div>
        <div>
          <p className="text-2xl font-black text-[#f0f6fc]">{formatCurrency(totalVerified, true)}</p>
          <p className="mt-0.5 text-xs text-[#8b949e]">Total proven earnings</p>
        </div>
        <div>
          <p className="text-2xl font-black text-[#f0f6fc]">{segments.length}</p>
          <p className="mt-0.5 text-xs text-[#8b949e]">Markets tracked</p>
        </div>
        <div>
          <p className="text-2xl font-black text-[#f0f6fc]">{mentorOffers.filter((o) => o.status === "active").length}</p>
          <p className="mt-0.5 text-xs text-[#8b949e]">Active mentors</p>
        </div>
      </div>

      {/* Leaderboard */}
      <Leaderboard claims={earningClaims} cities={cities} />
    </main>
  );
}
