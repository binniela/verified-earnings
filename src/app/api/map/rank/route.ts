import { NextRequest } from "next/server";
import { earningClaims } from "@/lib/seed-data";
import { getClaim } from "@/lib/data";
import { getMapSegments, getRankForClaim } from "@/lib/analytics";
import { mentorOffers } from "@/lib/seed-data";
import { fail, ok } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const claimId = request.nextUrl.searchParams.get("claimId");

  if (claimId) {
    const claim = getClaim(claimId);

    if (!claim) {
      return fail("Claim not found.", 404);
    }

    return ok(getRankForClaim(earningClaims, claim));
  }

  return ok({
    minimumPercentileSample: 20,
    segments: getMapSegments(earningClaims, mentorOffers),
  });
}
