import { demoCurrentUserId, earningClaims, follows, mentorOffers } from "@/lib/seed-data";
import { getPersonalizedFeed } from "@/lib/analytics";
import { ok } from "@/lib/api-utils";

export async function GET() {
  const followedValues = follows
    .filter((follow) => follow.userId === demoCurrentUserId)
    .map((follow) => follow.targetValue);

  return ok(getPersonalizedFeed(earningClaims, followedValues, mentorOffers));
}
