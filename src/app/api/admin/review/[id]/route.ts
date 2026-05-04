import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createReferralForClaim } from "@/lib/referral";
import { verificationDocs, earningClaims } from "@/lib/seed-data";
import { fail, ok } from "@/lib/api-utils";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const doc = verificationDocs.find((item) => item.id === params.id);
  const body = await request.json().catch(() => ({}));

  if (!doc) {
    return fail("Verification document not found.", 404);
  }

  if (!["approved", "rejected"].includes(body.reviewStatus)) {
    return fail("reviewStatus must be approved or rejected.", 422);
  }

  if (body.reviewStatus === "rejected" && !body.rejectionReason) {
    return fail("A rejection reason is required.", 422);
  }

  // When approving, set the claim to gated and auto-create a referral record.
  // If bypassGate is true, set to public immediately (admin seeding path).
  if (body.reviewStatus === "approved") {
    const claim = earningClaims.find((c) => c.id === doc.claimId);
    const newVisibility = body.bypassGate ? "public" : "gated";

    const supabase = createSupabaseServerClient();

    if (supabase && claim) {
      await supabase
        .from("earning_claims")
        .update({ verification_status: "approved", visibility_status: newVisibility, verified_at: new Date().toISOString() })
        .eq("id", doc.claimId);

      if (newVisibility === "gated") {
        await createReferralForClaim(supabase, doc.claimId, claim.userId);
      }
    }
  }

  return ok({
    ...doc,
    reviewStatus: body.reviewStatus,
    rejectionReason: body.rejectionReason,
    reviewedAt: new Date().toISOString(),
    rawDocumentDeletionScheduled: true,
    claimVisibility: body.reviewStatus === "approved" ? (body.bypassGate ? "public" : "gated") : undefined,
  });
}
