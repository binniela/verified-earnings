import { NextRequest } from "next/server";
import Stripe from "stripe";
import { fail, ok } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return ok({ mode: "demo", received: true });
  }

  if (!signature) {
    return fail("Missing Stripe signature.", 400);
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);

  if (event.type === "checkout.session.completed") {
    return ok({ received: true, sessionStatus: "confirmed" });
  }

  return ok({ received: true });
}
