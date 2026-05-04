import type { AmountBasis, ClaimType, VerificationTier } from "@/lib/types";

const basisLabels: Record<AmountBasis, string> = {
  annual_salary: "annual salary",
  total_comp: "total comp",
  offer: "offer verified",
  w2_income: "W-2 income",
  gross_1099_income: "gross 1099 income",
  net_self_employment_income: "net self-employment income",
  business_net_profit: "business net profit",
  owner_income: "owner income",
  realized_trading_pnl: "realized trading P&L",
};

const claimTypeLabels: Record<ClaimType, string> = {
  career: "Careers",
  business: "Businesses",
  freelance: "Freelance",
  trading: "Trading",
};

export function formatCurrency(cents: number, compact = false) {
  const amount = cents / 100;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  }).format(amount);
}

export function formatBasis(basis: AmountBasis) {
  return basisLabels[basis];
}

export function formatClaimType(type: ClaimType) {
  return claimTypeLabels[type];
}

export function formatPeriod(start: string, end: string) {
  const startYear = new Date(start).getUTCFullYear();
  const endYear = new Date(end).getUTCFullYear();

  return startYear === endYear ? `${endYear}` : `${startYear}-${endYear}`;
}

export function formatBadge(tier: VerificationTier, basis: AmountBasis) {
  if (tier === 2) {
    return "Connected-source verified";
  }

  if (basis === "business_net_profit") {
    return "Net profit verified";
  }

  if (basis === "owner_income") {
    return "Owner income verified";
  }

  if (basis === "realized_trading_pnl") {
    return "Realized P&L verified";
  }

  if (basis === "offer") {
    return "Offer verified";
  }

  return "Document-reviewed";
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
