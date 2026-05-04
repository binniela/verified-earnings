import type { ClaimType, DocumentType, EarningClaim } from "@/lib/types";
import { canAutoApprove, requiresManualReview } from "./claim-rules";
import { median, publicClaims } from "./analytics";

export type VerificationAnalysis = {
  parsedAmountCents?: number;
  incomeMatch: boolean;
  outlierFlagged: boolean;
  parserStatus: "parsed" | "manual_required" | "failed";
  parserNotes: string[];
  autoApprove: boolean;
};

export function extractDollarAmounts(text: string) {
  const matches = text.match(/\$?\s?(\d{1,3}(?:,\d{3})+|\d{4,})(?:\.\d{2})?/g) ?? [];

  return matches
    .map((match) => Number(match.replace(/[$,\s]/g, "")))
    .filter((amount) => Number.isFinite(amount) && amount > 0)
    .sort((a, b) => b - a);
}

export function amountMatchesClaim(parsedCents: number | undefined, claimedCents: number, tolerance = 0.1) {
  if (!parsedCents) return false;

  const difference = Math.abs(parsedCents - claimedCents);

  return difference / claimedCents <= tolerance;
}

export function getSegmentOutlierFlag(claims: EarningClaim[], claim: Pick<EarningClaim, "claimType" | "category" | "city" | "amountCents">) {
  const segment = publicClaims(claims).filter(
    (peer) =>
      peer.claimType === claim.claimType &&
      peer.category === claim.category &&
      peer.city === claim.city,
  );

  if (segment.length < 5) {
    return false;
  }

  const segmentMedian = median(segment.map((peer) => peer.amountCents));

  return segmentMedian > 0 && claim.amountCents > segmentMedian * 2.5;
}

export function analyzeDocumentVerification(options: {
  claimType: ClaimType;
  documentType?: DocumentType;
  claimedAmountCents: number;
  extractedText?: string;
  peerClaims: EarningClaim[];
  claimForOutlier: Pick<EarningClaim, "claimType" | "category" | "city" | "amountCents">;
}): VerificationAnalysis {
  const parserNotes: string[] = [];
  const amounts = options.extractedText ? extractDollarAmounts(options.extractedText) : [];
  const parsedAmountCents = amounts[0] ? amounts[0] * 100 : undefined;
  const incomeMatch = amountMatchesClaim(parsedAmountCents, options.claimedAmountCents);
  const outlierFlagged = getSegmentOutlierFlag(options.peerClaims, options.claimForOutlier);
  const manualReview = requiresManualReview(options.claimType, options.documentType);

  if (!options.extractedText) {
    parserNotes.push("No extractable text was available; manual review required.");
  }

  if (manualReview) {
    parserNotes.push("This claim type or document type requires manual review in MVP.");
  }

  if (!incomeMatch) {
    parserNotes.push("Parsed amount did not clearly match the claimed amount within 10%.");
  }

  if (outlierFlagged) {
    parserNotes.push("Claim is above the outlier threshold for its current segment.");
  }

  if (!options.documentType) {
    parserNotes.push("No document type supplied.");
  }

  const autoApprove =
    Boolean(options.documentType) &&
    canAutoApprove(options.claimType, options.documentType) &&
    incomeMatch &&
    !outlierFlagged;

  return {
    parsedAmountCents,
    incomeMatch,
    outlierFlagged,
    parserStatus: autoApprove ? "parsed" : amounts.length > 0 ? "manual_required" : "failed",
    parserNotes,
    autoApprove,
  };
}
