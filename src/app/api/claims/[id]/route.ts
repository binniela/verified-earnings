import { NextRequest } from "next/server";
import { getClaim } from "@/lib/data";
import { fail, ok } from "@/lib/api-utils";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const claim = getClaim(params.id);

  if (!claim || claim.visibilityStatus !== "public") {
    return fail("Claim not found.", 404);
  }

  return ok(claim);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const claim = getClaim(params.id);

  if (!claim) {
    return fail("Claim not found.", 404);
  }

  const updates = await request.json().catch(() => ({}));

  return ok({
    ...claim,
    ...updates,
    id: claim.id,
    verificationStatus: claim.verificationStatus,
    verificationTier: claim.verificationTier,
  });
}
