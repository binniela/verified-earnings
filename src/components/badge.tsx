import { clsx } from "clsx";
import { CheckCircle2, Link2, ShieldCheck } from "lucide-react";
import type { AmountBasis, VerificationTier } from "@/lib/types";
import { formatBadge } from "@/lib/format";
import { toneStyles, type Tone } from "@/components/ui";

function getTone(tier: VerificationTier, basis: AmountBasis): Tone {
  if (tier === 2) return "warning";
  if (basis === "realized_trading_pnl") return "trading";
  if (basis === "business_net_profit" || basis === "owner_income") return "success";
  return "info";
}

export function VerificationBadge({
  tier,
  basis,
  className,
}: {
  tier: VerificationTier;
  basis: AmountBasis;
  className?: string;
}) {
  const label = formatBadge(tier, basis);
  const Icon = tier === 2 ? Link2 : basis.includes("profit") || basis.includes("pnl") ? ShieldCheck : CheckCircle2;
  const tone = toneStyles[getTone(tier, basis)];

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em]",
        tone.bg,
        tone.border,
        tone.text,
        className,
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}
