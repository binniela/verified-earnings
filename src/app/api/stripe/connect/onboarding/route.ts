import { NextRequest } from "next/server";
import Stripe from "stripe";
import { fail, ok } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  if (!body.stripeConnectedAccountId) {
    return fail("stripeConnectedAccountId is required.", 422);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

  if (!process.env.STRIPE_SECRET_KEY) {
    return ok({
      mode: "demo",
      onboardingUrl: `${baseUrl}/dashboard?stripeConnect=demo`,
    });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const accountLink = await stripe.accountLinks.create({
    account: body.stripeConnectedAccountId,
    refresh_url: `${baseUrl}/dashboard?stripeConnect=refresh`,
    return_url: `${baseUrl}/dashboard?stripeConnect=complete`,
    type: "account_onboarding",
  });

  return ok({ onboardingUrl: accountLink.url });
}
