import { NextRequest } from "next/server";
import { analyzeDocumentVerification } from "@/lib/verification";
import { earningClaims } from "@/lib/seed-data";
import { getClaim } from "@/lib/data";
import { fail, ok } from "@/lib/api-utils";
import type { DocumentType } from "@/lib/types";

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return fail("Expected multipart form data.", 400);
  }

  const claimId = String(formData.get("claimId") || "");
  const documentType = String(formData.get("documentType") || "") as DocumentType;
  const extractedText = String(formData.get("extractedText") || "");
  const claim = getClaim(claimId);

  if (!claim) {
    return fail("Claim not found.", 404);
  }

  const analysis = analyzeDocumentVerification({
    claimType: claim.claimType,
    documentType,
    claimedAmountCents: claim.amountCents,
    extractedText,
    peerClaims: earningClaims,
    claimForOutlier: claim,
  });

  return ok({
    claimId,
    documentType,
    privateStoragePath: `private/verification-docs/${claimId}/${documentType}-${Date.now()}.pdf`,
    retentionPolicy: "delete_raw_document_after_30_days",
    ...analysis,
  });
}
