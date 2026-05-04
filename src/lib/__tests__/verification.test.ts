import { describe, expect, it } from "vitest";
import { analyzeDocumentVerification, amountMatchesClaim, extractDollarAmounts } from "../verification";
import { earningClaims } from "../seed-data";

describe("verification", () => {
  it("extracts and sorts dollar amounts", () => {
    expect(extractDollarAmounts("Base salary $145,000 and bonus $20,000")).toEqual([145000, 20000]);
  });

  it("matches amounts within ten percent", () => {
    expect(amountMatchesClaim(14800000, 15000000)).toBe(true);
    expect(amountMatchesClaim(11000000, 15000000)).toBe(false);
  });

  it("auto-approves only low-risk career documents", () => {
    const claim = earningClaims.find((item) => item.id === "claim-nyc-eng-10")!;
    const analysis = analyzeDocumentVerification({
      claimType: "career",
      documentType: "pay_stub",
      claimedAmountCents: claim.amountCents,
      extractedText: "Annual salary $159,000",
      peerClaims: earningClaims,
      claimForOutlier: claim,
    });

    expect(analysis.autoApprove).toBe(true);
  });

  it("routes business claims to manual review even when amount matches", () => {
    const claim = earningClaims.find((item) => item.id === "claim-darius-agency")!;
    const analysis = analyzeDocumentVerification({
      claimType: "business",
      documentType: "cpa_letter_pnl",
      claimedAmountCents: claim.amountCents,
      extractedText: "Net profit $214,000",
      peerClaims: earningClaims,
      claimForOutlier: claim,
    });

    expect(analysis.incomeMatch).toBe(true);
    expect(analysis.autoApprove).toBe(false);
    expect(analysis.parserStatus).toBe("manual_required");
  });
});
