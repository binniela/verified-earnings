import Link from "next/link";
import { Map } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#1a1f27] bg-[#0a0c10]/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-sm font-black uppercase tracking-widest text-[#f0f6fc]">
          Verified Earnings
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/map" className="flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-[#f0f6fc] transition-colors">
            <Map className="size-3.5" />
            Map
          </Link>
          <Link href="/mentors" className="text-xs text-[#8b949e] hover:text-[#f0f6fc] transition-colors">
            Mentors
          </Link>
          <Link href="/dashboard" className="text-xs text-[#8b949e] hover:text-[#f0f6fc] transition-colors">
            Dashboard
          </Link>
        </nav>

        <Link
          href="/claim/new"
          className="inline-flex h-8 items-center border border-[#30363d] px-4 text-xs font-semibold text-[#f0f6fc] hover:border-[#8b949e] transition-colors"
        >
          + Add yourself
        </Link>
      </div>
    </header>
  );
}
