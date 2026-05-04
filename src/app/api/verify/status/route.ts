import { NextRequest } from "next/server";
import { getClaim } from "@/lib/data";
import { verificationDocs } from "@/lib/seed-data";
import { fail, ok } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const claimId = request.nextUrl.searchParams.get("claimId");

  if (!claimId) {
    return fail("claimId is required.", 400);
  }

  const claim = getClaim(claimId);

  if (!claim) {
    return fail("Claim not found.", 404);
  }

  return ok({
    claim,
    docs: verificationDocs.filter((doc) => doc.claimId === claimId),
  });
}
