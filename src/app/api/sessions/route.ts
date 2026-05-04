import { NextRequest } from "next/server";
import Stripe from "stripe";
import { mentorOffers } from "@/lib/seed-data";
import { fail, ok } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const mentorOfferId = request.nextUrl.searchParams.get("mentorOfferId");

  if (!mentorOfferId) {
    return fail("mentorOfferId is required.", 400);
  }

  const offer = mentorOffers.find((item) => item.id === mentorOfferId && item.status === "active");

  if (!offer) {
    return fail("Mentor offer not found.", 404);
  }

  return ok({
    mode: "demo",
    message: "POST this endpoint to create a Stripe Checkout Session in test/production.",
    offer,
    platformFeeCents: Math.round(offer.rateCents * 0.15),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const offer = mentorOffers.find((item) => item.id === body?.mentorOfferId && item.status === "active");

  if (!offer) {
    return fail("Active mentor offer is required.", 422);
  }

  if (!offer.stripeConnectedAccountId) {
    return fail("Mentor must complete Stripe Connect onboarding first.", 403);
  }

  const platformFeeCents = Math.round(offer.rateCents * 0.15);

  if (!process.env.STRIPE_SECRET_KEY) {
    return ok({
      mode: "demo",
      stripeCheckoutSessionId: `cs_demo_${Date.now()}`,
      amountCents: offer.rateCents,
      platformFeeCents,
      connectedAccountId: offer.stripeConnectedAccountId,
      status: "pending",
    });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: offer.rateCents,
          product_data: {
            name: offer.title,
            description: `${offer.durationMinutes} minute verified earnings mentorship session`,
          },
        },
      },
    ],
    payment_intent_data: {
      application_fee_amount: platformFeeCents,
      transfer_data: {
        destination: offer.stripeConnectedAccountId,
      },
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin}/dashboard?session=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin}/mentors?session=cancelled`,
  });

  return ok({ checkoutUrl: session.url, stripeCheckoutSessionId: session.id });
}
