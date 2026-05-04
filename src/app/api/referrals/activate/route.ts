import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { activateReferral } from "@/lib/referral";
import { fail, ok } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.code) {
    return fail("code is required.", 400);
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return ok({ activated: true, unlocked: false, activationCount: 1 });
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail("You must be signed in to activate a referral link.", 401);
  }

  const result = await activateReferral(supabase, body.code, user.id);

  if (!result.activated && result.error) {
    return fail(result.error, 422);
  }

  return ok(result);
}
