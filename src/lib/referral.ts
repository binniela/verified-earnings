import { REFERRAL_UNLOCK_THRESHOLD } from "@/lib/referral-config";
import type { Referral } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any;

export type ActivateResult = {
  activated: boolean;
  unlocked: boolean;
  activationCount: number;
  error?: string;
};

export function generateReferralCode(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
}

export async function createReferralForClaim(
  supabase: Db,
  claimId: string,
  creatorUserId: string,
): Promise<Referral | null> {
  const code = generateReferralCode();

  const { data, error } = await supabase
    .from("referrals")
    .insert({ code, claim_id: claimId, creator_user_id: creatorUserId, unlock_threshold: REFERRAL_UNLOCK_THRESHOLD })
    .select("id, code, claim_id, creator_user_id, unlock_threshold, unlocked_at, created_at")
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    code: data.code,
    claimId: data.claim_id,
    creatorUserId: data.creator_user_id,
    unlockThreshold: data.unlock_threshold,
    activationCount: 0,
    unlockedAt: data.unlocked_at ?? undefined,
    createdAt: data.created_at,
  };
}

export async function getReferralForClaim(
  supabase: Db,
  claimId: string,
): Promise<Referral | null> {
  const { data: referral, error } = await supabase
    .from("referrals")
    .select("id, code, claim_id, creator_user_id, unlock_threshold, unlocked_at, created_at")
    .eq("claim_id", claimId)
    .single();

  if (error || !referral) return null;

  const { count } = await supabase
    .from("referral_activations")
    .select("id", { count: "exact", head: true })
    .eq("referral_id", referral.id);

  return {
    id: referral.id,
    code: referral.code,
    claimId: referral.claim_id,
    creatorUserId: referral.creator_user_id,
    unlockThreshold: referral.unlock_threshold,
    activationCount: count ?? 0,
    unlockedAt: referral.unlocked_at ?? undefined,
    createdAt: referral.created_at,
  };
}

export async function getReferralByCode(
  supabase: Db,
  code: string,
): Promise<Referral | null> {
  const { data: referral, error } = await supabase
    .from("referrals")
    .select("id, code, claim_id, creator_user_id, unlock_threshold, unlocked_at, created_at")
    .eq("code", code)
    .single();

  if (error || !referral) return null;

  const { count } = await supabase
    .from("referral_activations")
    .select("id", { count: "exact", head: true })
    .eq("referral_id", referral.id);

  return {
    id: referral.id,
    code: referral.code,
    claimId: referral.claim_id,
    creatorUserId: referral.creator_user_id,
    unlockThreshold: referral.unlock_threshold,
    activationCount: count ?? 0,
    unlockedAt: referral.unlocked_at ?? undefined,
    createdAt: referral.created_at,
  };
}

export async function activateReferral(
  supabase: Db,
  code: string,
  activatedUserId: string,
): Promise<ActivateResult> {
  const { data: referral, error: lookupError } = await supabase
    .from("referrals")
    .select("id, creator_user_id, unlock_threshold, claim_id")
    .eq("code", code)
    .single();

  if (lookupError || !referral) {
    return { activated: false, unlocked: false, activationCount: 0, error: "Referral code not found." };
  }

  if (referral.creator_user_id === activatedUserId) {
    return { activated: false, unlocked: false, activationCount: 0, error: "You cannot activate your own referral link." };
  }

  const { error: insertError } = await supabase
    .from("referral_activations")
    .insert({ referral_id: referral.id, activated_user_id: activatedUserId });

  if (insertError) {
    if (insertError.code === "23505") {
      return { activated: false, unlocked: false, activationCount: 0, error: "You have already activated this referral link." };
    }
    return { activated: false, unlocked: false, activationCount: 0, error: "Failed to activate referral." };
  }

  const { count } = await supabase
    .from("referral_activations")
    .select("id", { count: "exact", head: true })
    .eq("referral_id", referral.id);

  const activationCount = count ?? 0;
  const unlocked = activationCount >= referral.unlock_threshold;

  if (unlocked) {
    await supabase
      .from("earning_claims")
      .update({ visibility_status: "public" })
      .eq("id", referral.claim_id);

    await supabase
      .from("referrals")
      .update({ unlocked_at: new Date().toISOString() })
      .eq("id", referral.id);
  }

  return { activated: true, unlocked, activationCount };
}
