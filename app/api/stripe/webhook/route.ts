// app/api/stripe/webhook/route.ts
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebaseAdmin.mjs";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Configure route as dynamic (required for webhooks)
export const dynamic = "force-dynamic";

// Helper to get raw body
async function getRawBody(request: NextRequest): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  const reader = request.body?.getReader();

  if (!reader) {
    throw new Error("No request body");
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  return Buffer.concat(chunks);
}

// Update user subscription in Firebase
async function updateUserSubscription(
  subscription: Stripe.Subscription,
  eventType: string
) {
  const userId = subscription.metadata.firebaseUserId;

  if (!userId) {
    console.error("No firebaseUserId in subscription metadata");
    return;
  }

  console.log(`Updating subscription for user ${userId}, event: ${eventType}`);

  const priceId = subscription.items.data[0]?.price.id;
  const productId = subscription.items.data[0]?.price.product as string;

  // Get product details for plan name
  let planName = "Unknown Plan";
  try {
    const product = await stripe.products.retrieve(productId);
    planName = product.name;
  } catch (e) {
    console.error("Error fetching product:", e);
  }

  const subscriptionData = {
    stripeCustomerId: subscription.customer as string,
    subscriptionId: subscription.id,
    priceId: priceId,
    productId: productId,
    planName: planName,
    status: subscription.status,
    currentPeriodStart: (subscription as any).current_period_start,
    currentPeriodEnd: (subscription as any).current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAt: subscription.canceled_at || null,
    updatedAt: Date.now(),
  };

  // For new subscriptions, add createdAt
  if (eventType === "customer.subscription.created") {
    (subscriptionData as any).createdAt = Date.now();
  }

  await db.collection("users").doc(userId).update({
    subscription: subscriptionData,
  });

  console.log(
    `✅ Updated subscription for user ${userId}:`,
    subscriptionData.status
  );
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.firebaseUserId;

  if (!userId) {
    console.error("No firebaseUserId in subscription metadata");
    return;
  }

  console.log(`Subscription deleted for user ${userId}`);

  await db.collection("users").doc(userId).update({
    "subscription.status": "canceled",
    "subscription.canceledAt": Date.now(),
    "subscription.updatedAt": Date.now(),
  });

  console.log(`✅ Marked subscription as canceled for user ${userId}`);
}

export async function POST(request: NextRequest) {
  console.log("=".repeat(80));
  console.log("STRIPE WEBHOOK - Event received");
  console.log("=".repeat(80));

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  try {
    const rawBody = await getRawBody(request);
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("No stripe-signature header");
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log(`Processing event: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await updateUserSubscription(
          event.data.object as Stripe.Subscription,
          event.type
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case "invoice.payment_succeeded":
        // Optional: Handle successful payments
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Payment succeeded for invoice: ${invoice.id}`);
        break;

      case "invoice.payment_failed":
        // Optional: Handle failed payments
        const failedInvoice = event.data.object as Stripe.Invoice;
        console.log(`Payment failed for invoice: ${failedInvoice.id}`);
        // You might want to update user status or send notification
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
