import { z } from "zod";
import type { AmountBasis, ClaimType, DocumentType } from "@/lib/types";

export const claimTypes = ["career", "business", "freelance", "trading"] as const;

export const amountBasisByClaimType: Record<ClaimType, AmountBasis[]> = {
  career: ["annual_salary", "total_comp", "offer", "w2_income", "gross_1099_income"],
  business: ["business_net_profit", "owner_income"],
  freelance: ["gross_1099_income", "net_self_employment_income"],
  trading: ["realized_trading_pnl"],
};

export const acceptedProofByClaimType: Record<ClaimType, DocumentType[]> = {
  career: ["pay_stub", "w2", "1099", "offer_letter", "employment_contract"],
  freelance: ["1099", "tax_excerpt", "platform_payout", "invoice_bank_match"],
  business: [
    "schedule_c",
    "k1",
    "business_tax_return",
    "cpa_letter_pnl",
    "accounting_export",
  ],
  trading: ["brokerage_tax_form", "brokerage_statement", "broker_export"],
};

export const riskyRejectedProofs = [
  "screenshots",
  "discord claims",
  "leaderboard images",
  "unrealized gains",
  "revenue-only business claims",
];

export const claimSchema = z
  .object({
    claimType: z.enum(claimTypes),
    amountBasis: z.string(),
    amountCents: z.number().int().positive(),
    periodStart: z.string().min(8),
    periodEnd: z.string().min(8),
    role: z.string().min(2).max(120),
    category: z.string().min(2).max(120),
    city: z.string().min(2).max(80),
    state: z.string().min(2).max(80),
    country: z.string().default("US"),
    displayAnonymously: z.boolean().default(true),
    summary: z.string().min(10).max(280),
    documentType: z.string().optional(),
  })
  .superRefine((value, context) => {
    const allowedBasis = amountBasisByClaimType[value.claimType];

    if (!allowedBasis.includes(value.amountBasis as AmountBasis)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amountBasis"],
        message: `Amount basis must match ${value.claimType} claims.`,
      });
    }

    if (value.documentType) {
      const allowedDocs = acceptedProofByClaimType[value.claimType];

      if (!allowedDocs.includes(value.documentType as DocumentType)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["documentType"],
          message: `Document type is not accepted for ${value.claimType} claims.`,
        });
      }
    }

    if (new Date(value.periodEnd) < new Date(value.periodStart)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["periodEnd"],
        message: "Period end must be after period start.",
      });
    }
  });

export type ClaimInput = z.infer<typeof claimSchema>;

export function isDocumentAccepted(claimType: ClaimType, documentType: DocumentType) {
  return acceptedProofByClaimType[claimType].includes(documentType);
}

export function requiresManualReview(claimType: ClaimType, documentType?: DocumentType) {
  if (claimType !== "career") {
    return true;
  }

  return documentType === "1099" || documentType === "offer_letter";
}

export function canAutoApprove(claimType: ClaimType, documentType?: DocumentType) {
  return claimType === "career" && Boolean(documentType) && !requiresManualReview(claimType, documentType);
}
