import { MapPageClient } from "./map-client";
import { earningClaims, mentorOffers } from "@/lib/seed-data";
import { filterClaims, getMapSegments } from "@/lib/analytics";
import type { ClaimType } from "@/lib/types";

export default function MapPage({
  searchParams,
}: {
  searchParams: { claimType?: ClaimType; category?: string; city?: string; mentorOnly?: string };
}) {
  const activeClaimType = searchParams.claimType;
  const mentorOnly = searchParams.mentorOnly === "true";

  const allSegments = getMapSegments(earningClaims, mentorOffers);

  const segments = allSegments.filter((segment) => {
    if (activeClaimType && segment.claimType !== activeClaimType) return false;
    if (mentorOnly && segment.mentorCount === 0) return false;
    return true;
  });

  const initialSelected =
    allSegments.find(
      (s) =>
        (!searchParams.claimType || s.claimType === searchParams.claimType) &&
        (!searchParams.category || s.category === searchParams.category) &&
        (!searchParams.city || s.city === searchParams.city),
    ) ?? segments[0];

  const claims = filterClaims(earningClaims, {}, mentorOffers);

  return (
    <MapPageClient
      segments={segments}
      allClaims={claims}
      initialSelected={initialSelected}
      activeClaimType={activeClaimType}
      mentorOnly={mentorOnly}
    />
  );
}
