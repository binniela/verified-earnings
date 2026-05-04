import { describe, expect, it } from "vitest";
import { earningClaims, mentorOffers } from "../seed-data";
import { filterClaims, getMapSegments, getRankForClaim, publicClaims } from "../analytics";

describe("analytics", () => {
  it("only exposes approved public claims", () => {
    const claims = publicClaims(earningClaims);

    expect(claims.every((claim) => claim.verificationStatus === "approved")).toBe(true);
    expect(claims.every((claim) => claim.visibilityStatus === "public")).toBe(true);
    expect(claims.some((claim) => claim.id === "claim-caleb-pending")).toBe(false);
  });

  it("keeps claim type comparisons separate", () => {
    const businessClaims = filterClaims(earningClaims, { claimType: "business" }, mentorOffers);

    expect(businessClaims.every((claim) => claim.claimType === "business")).toBe(true);
    expect(businessClaims.every((claim) => claim.amountBasis === "business_net_profit" || claim.amountBasis === "owner_income")).toBe(true);
  });

  it("only enables percentiles when the segment has enough samples", () => {
    const denseClaim = earningClaims.find((claim) => claim.id === "claim-nyc-eng-20");
    const sparseClaim = earningClaims.find((claim) => claim.id === "claim-darius-agency");

    expect(denseClaim).toBeDefined();
    expect(sparseClaim).toBeDefined();

    const denseRank = getRankForClaim(earningClaims, denseClaim!);
    const sparseRank = getRankForClaim(earningClaims, sparseClaim!);

    expect(denseRank.percentileAvailable).toBe(true);
    expect(denseRank.percentile).not.toBeNull();
    expect(sparseRank.percentileAvailable).toBe(false);
    expect(sparseRank.percentile).toBeNull();
  });

  it("builds social map segments with mentor counts", () => {
    const segments = getMapSegments(earningClaims, mentorOffers);
    const agencyAustin = segments.find((segment) => segment.category === "Agency" && segment.city === "Austin");

    expect(agencyAustin?.mentorCount).toBe(1);
    expect(segments.length).toBeGreaterThan(0);
  });
});
