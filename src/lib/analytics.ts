import type { ClaimType, EarningClaim, MapSegment, MentorOffer } from "@/lib/types";

export type ClaimFilters = {
  claimType?: ClaimType;
  category?: string;
  role?: string;
  city?: string;
  minAmount?: number;
  maxAmount?: number;
  mentorOnly?: boolean;
};

export const MIN_PERCENTILE_SAMPLE = 20;

export function publicClaims(claims: EarningClaim[]) {
  return claims.filter(
    (claim) => claim.visibilityStatus === "public" && claim.verificationStatus === "approved",
  );
}

export function filterClaims(
  claims: EarningClaim[],
  filters: ClaimFilters,
  mentorOffers: MentorOffer[] = [],
) {
  const mentorClaimIds = new Set(
    mentorOffers.filter((offer) => offer.status === "active").map((offer) => offer.claimId),
  );

  return publicClaims(claims).filter((claim) => {
    if (filters.claimType && claim.claimType !== filters.claimType) return false;
    if (filters.category && claim.category !== filters.category) return false;
    if (filters.role && claim.role !== filters.role) return false;
    if (filters.city && claim.city !== filters.city) return false;
    if (filters.minAmount && claim.amountCents < filters.minAmount) return false;
    if (filters.maxAmount && claim.amountCents > filters.maxAmount) return false;
    if (filters.mentorOnly && !mentorClaimIds.has(claim.id)) return false;

    return true;
  });
}

export function median(values: number[]) {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
  }

  return sorted[middle];
}

export function percentileRank(values: number[], amount: number) {
  if (values.length === 0) return null;

  const belowOrEqual = values.filter((value) => value <= amount).length;
  return Math.round((belowOrEqual / values.length) * 100);
}

export function topThreshold(values: number[], topPercent: number) {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => b - a);
  const index = Math.max(0, Math.ceil(values.length * (topPercent / 100)) - 1);

  return sorted[index] ?? sorted[0];
}

export function getMapSegments(claims: EarningClaim[], mentorOffers: MentorOffer[]): MapSegment[] {
  const publicClaimList = publicClaims(claims);
  const mentorClaimIds = new Set(
    mentorOffers.filter((offer) => offer.status === "active").map((offer) => offer.claimId),
  );
  const grouped = new Map<string, EarningClaim[]>();

  for (const claim of publicClaimList) {
    const key = [claim.claimType, claim.category, claim.city, claim.state].join("|");
    const current = grouped.get(key) ?? [];
    grouped.set(key, [...current, claim]);
  }

  return Array.from(grouped.entries())
    .map(([key, segmentClaims]) => {
      const [claimType, category, city, state] = key.split("|");
      const amounts = segmentClaims.map((claim) => claim.amountCents);

      return {
        key,
        claimType: claimType as ClaimType,
        category,
        city,
        state,
        count: segmentClaims.length,
        medianCents: median(amounts),
        topCents: Math.max(...amounts),
        mentorCount: segmentClaims.filter((claim) => mentorClaimIds.has(claim.id)).length,
        percentileAvailable: segmentClaims.length >= MIN_PERCENTILE_SAMPLE,
      };
    })
    .sort((a, b) => b.count - a.count || b.medianCents - a.medianCents);
}

export function getRankForClaim(claims: EarningClaim[], claim: EarningClaim) {
  const peerClaims = publicClaims(claims).filter(
    (peer) =>
      peer.claimType === claim.claimType &&
      peer.amountBasis === claim.amountBasis &&
      peer.category === claim.category &&
      peer.city === claim.city,
  );
  const amounts = peerClaims.map((peer) => peer.amountCents);

  return {
    sampleSize: peerClaims.length,
    percentile:
      peerClaims.length >= MIN_PERCENTILE_SAMPLE ? percentileRank(amounts, claim.amountCents) : null,
    medianCents: median(amounts),
    top25Cents: topThreshold(amounts, 25),
    top10Cents: topThreshold(amounts, 10),
    percentileAvailable: peerClaims.length >= MIN_PERCENTILE_SAMPLE,
  };
}

export function getPersonalizedFeed(
  claims: EarningClaim[],
  followedValues: string[],
  mentorOffers: MentorOffer[],
) {
  const followed = new Set(followedValues);
  const mentorClaimIds = new Set(
    mentorOffers.filter((offer) => offer.status === "active").map((offer) => offer.claimId),
  );

  return publicClaims(claims)
    .map((claim) => ({
      claim,
      score:
        Number(followed.has(claim.claimType)) +
        Number(followed.has(claim.category)) +
        Number(followed.has(claim.city)) +
        Number(mentorClaimIds.has(claim.id)),
    }))
    .sort((a, b) => b.score - a.score || Date.parse(b.claim.createdAt) - Date.parse(a.claim.createdAt))
    .map((item) => item.claim);
}
