import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createReferralForClaim, getReferralForClaim } from "@/lib/referral";
import { getClaim } from "@/lib/data";
import { fail, ok } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const claimId = request.nextUrl.searchParams.get("claimId");

  if (!claimId) {
    return fail("claimId is required.", 400);
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    // Demo mode — return a stub
    return ok({
      claimId,
      code: "DEMO1234",
      activationCount: 0,
      unlockThreshold: 2,
      unlocked: false,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invite/DEMO1234`,
    });
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail("Unauthorized.", 401);
  }

  const claim = getClaim(claimId);

  if (!claim) {
    return fail("Claim not found.", 404);
  }

  if (claim.userId !== user.id) {
    return fail("Forbidden.", 403);
  }

  const referral = await getReferralForClaim(supabase, claimId);

  if (!referral) {
    return fail("No referral found for this claim.", 404);
  }

  return ok({
    ...referral,
    unlocked: referral.activationCount >= referral.unlockThreshold,
    inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${referral.code}`,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.claimId) {
    return fail("claimId is required.", 400);
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return ok({
      claimId: body.claimId,
      code: "DEMO1234",
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invite/DEMO1234`,
      activationCount: 0,
      unlockThreshold: 2,
    });
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail("Unauthorized.", 401);
  }

  const claim = getClaim(body.claimId);

  if (!claim) {
    return fail("Claim not found.", 404);
  }

  if (claim.userId !== user.id) {
    return fail("Forbidden.", 403);
  }

  if (claim.verificationStatus !== "approved" || claim.visibilityStatus !== "gated") {
    return fail("Referral links can only be created for approved gated claims.", 422);
  }

  const existing = await getReferralForClaim(supabase, body.claimId);

  if (existing) {
    return ok({
      ...existing,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${existing.code}`,
    });
  }

  const referral = await createReferralForClaim(supabase, body.claimId, user.id);

  if (!referral) {
    return fail("Failed to create referral.", 500);
  }

  return ok(
    { ...referral, inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${referral.code}` },
    { status: 201 },
  );
}
