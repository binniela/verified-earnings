import { describe, expect, it } from "vitest";
import { claimSchema, isDocumentAccepted, requiresManualReview } from "../claim-rules";

describe("claim rules", () => {
  it("rejects revenue-like basis for business income", () => {
    const result = claimSchema.safeParse({
      claimType: "business",
      amountBasis: "gross_1099_income",
      amountCents: 12000000,
      periodStart: "2025-01-01",
      periodEnd: "2025-12-31",
      role: "Agency owner",
      category: "Agency",
      city: "Austin",
      state: "TX",
      summary: "Net profit should be verified instead of revenue.",
      documentType: "accounting_export",
    });

    expect(result.success).toBe(false);
  });

  it("accepts brokerage statements for trading claims", () => {
    expect(isDocumentAccepted("trading", "brokerage_statement")).toBe(true);
    expect(isDocumentAccepted("trading", "pay_stub")).toBe(false);
  });

  it("requires manual review for non-career claims", () => {
    expect(requiresManualReview("business", "accounting_export")).toBe(true);
    expect(requiresManualReview("freelance", "1099")).toBe(true);
    expect(requiresManualReview("career", "pay_stub")).toBe(false);
  });
});
