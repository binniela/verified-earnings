import { NextRequest } from "next/server";
import { claimSchema } from "@/lib/claim-rules";
import { earningClaims } from "@/lib/seed-data";
import { filterClaims } from "@/lib/analytics";
import { fail, ok } from "@/lib/api-utils";
import type { ClaimFilters, } from "@/lib/analytics";
import type { ClaimType, EarningClaim } from "@/lib/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filters: ClaimFilters = {
    claimType: (searchParams.get("claimType") || undefined) as ClaimType | undefined,
    category: searchParams.get("category") || undefined,
    role: searchParams.get("role") || undefined,
    city: searchParams.get("city") || undefined,
  };

  return ok(filterClaims(earningClaims, filters));
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = claimSchema.safeParse(body);

  if (!parsed.success) {
    return fail("Claim validation failed.", 422, parsed.error.flatten());
  }

  const claim: EarningClaim = {
    id: `claim-draft-${Date.now()}`,
    userId: "user-demo",
    claimType: parsed.data.claimType,
    amountBasis: parsed.data.amountBasis as EarningClaim["amountBasis"],
    amountCents: parsed.data.amountCents,
    periodStart: parsed.data.periodStart,
    periodEnd: parsed.data.periodEnd,
    role: parsed.data.role,
    category: parsed.data.category,
    city: parsed.data.city,
    state: parsed.data.state,
    country: parsed.data.country,
    verificationStatus: "draft",
    verificationTier: 0,
    visibilityStatus: "private",
    displayAnonymously: parsed.data.displayAnonymously,
    shareSlug: `draft-${Date.now()}`,
    documentType: parsed.data.documentType as EarningClaim["documentType"],
    createdAt: new Date().toISOString(),
    summary: parsed.data.summary,
    proofNote: "Draft claim created. Upload proof before it can appear publicly.",
    mentorReady: false,
    riskFlags: [],
  };

  return ok({ claim, next: "/verify" }, { status: 201 });
}
