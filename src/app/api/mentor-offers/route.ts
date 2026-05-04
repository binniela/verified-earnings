import { NextRequest } from "next/server";
import { getClaim } from "@/lib/data";
import { mentorOffers } from "@/lib/seed-data";
import { fail, ok } from "@/lib/api-utils";

export async function GET() {
  return ok(mentorOffers.filter((offer) => offer.status === "active"));
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const claim = body?.claimId ? getClaim(body.claimId) : undefined;

  if (!claim) {
    return fail("An approved claimId is required.", 422);
  }

  if (claim.verificationStatus !== "approved" || claim.visibilityStatus !== "public") {
    return fail("Mentor offers require an approved public claim.", 403);
  }

  return ok(
    {
      id: `mentor-${Date.now()}`,
      userId: claim.userId,
      claimId: claim.id,
      title: body.title,
      topics: body.topics ?? [],
      rateCents: body.rateCents,
      durationMinutes: body.durationMinutes ?? 60,
      status: "draft",
      createdAt: new Date().toISOString(),
    },
    { status: 201 },
  );
}
