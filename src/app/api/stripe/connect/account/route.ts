import { NextRequest } from "next/server";
import Stripe from "stripe";
import { fail, ok } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  if (!body.userId) {
    return fail("userId is required.", 422);
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return ok({
      mode: "demo",
      stripeConnectedAccountId: `acct_demo_${body.userId}`,
      onboardingRequired: true,
    });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const account = await stripe.accounts.create({
    type: "express",
    metadata: {
      userId: body.userId,
    },
  });

  return ok({ stripeConnectedAccountId: account.id, onboardingRequired: true });
}
