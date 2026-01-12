// app/api/stripe/webhook/route.ts
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebaseAdmin.mjs";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

// Helper to remove undefined values
function removeUndefined<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  const cleaned: Partial<T> = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

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

async function findUserByCustomerId(
  customerId: string
): Promise<string | null> {
  console.log("🔍 Searching for user with customerId:", customerId);

  const usersSnapshot = await db
    .collection("users")
    .where("subscription.stripeCustomerId", "==", customerId)
    .limit(1)
    .get();

  if (!usersSnapshot.empty) {
    const oderId = usersSnapshot.docs[0].id;
    console.log("✅ Found user by customerId:", oderId);
    return oderId;
  }

  console.log("❌ No user found with customerId:", customerId);
  return null;
}

async function updateUserSubscription(
  userId: string,
  subscription: Stripe.Subscription
): Promise<boolean> {
  console.log(`\n📝 Updating subscription for user: ${userId}`);
  console.log("Subscription ID:", subscription.id);
  console.log("Status:", subscription.status);

  try {
    // Get price and product info safely
    const priceItem = subscription.items.data[0];
    const priceData = priceItem?.price;
    const priceId = priceData?.id || null;

    let productId: string | null = null;
    if (typeof priceData?.product === "string") {
      productId = priceData.product;
    } else if (priceData?.product && typeof priceData.product === "object") {
      productId = (priceData.product as Stripe.Product).id;
    }

    // Get product name
    let planName = "Unknown Plan";
    if (productId) {
      try {
        const product = await stripe.products.retrieve(productId);
        planName = product.name;
      } catch (e) {
        console.error("Error fetching product:", e);
      }
    }

    // Access subscription properties using bracket notation for newer API versions
    const subAny = subscription as unknown as Record<string, unknown>;
    const currentPeriodStart = subAny["current_period_start"] as
      | number
      | undefined;
    const currentPeriodEnd = subAny["current_period_end"] as number | undefined;
    const cancelAtPeriodEnd = subAny["cancel_at_period_end"] as
      | boolean
      | undefined;
    const canceledAt = subAny["canceled_at"] as number | null | undefined;
    const created = subAny["created"] as number | undefined;

    // Build subscription data - no undefined values
    const subscriptionData = removeUndefined({
      stripeCustomerId: subscription.customer as string,
      subscriptionId: subscription.id,
      priceId: priceId,
      productId: productId,
      planName: planName,
      status: subscription.status,
      currentPeriodStart: currentPeriodStart ?? null,
      currentPeriodEnd: currentPeriodEnd ?? null,
      cancelAtPeriodEnd: cancelAtPeriodEnd ?? false,
      canceledAt: canceledAt ?? null,
      createdAt: created ? created * 1000 : Date.now(),
      updatedAt: Date.now(),
    });

    console.log(
      "Saving subscription data:",
      JSON.stringify(subscriptionData, null, 2)
    );

    await db.collection("users").doc(userId).update({
      subscription: subscriptionData,
    });

    console.log("✅ Successfully updated subscription for user:", userId);
    return true;
  } catch (error) {
    console.error("❌ Error updating subscription:", error);
    return false;
  }
}

async function handleSubscriptionEvent(
  subscription: Stripe.Subscription,
  eventType: string
): Promise<boolean> {
  console.log(`\n🔔 Handling ${eventType}`);
  console.log("Subscription ID:", subscription.id);
  console.log("Customer ID:", subscription.customer);

  // Try to find user ID from metadata first
  let userId: string | null = subscription.metadata?.firebaseUserId ?? null;

  // If not in metadata, search by customer ID
  if (!userId) {
    console.log("No firebaseUserId in metadata, searching by customer ID...");
    userId = await findUserByCustomerId(subscription.customer as string);
  }

  if (!userId) {
    console.error("❌ Could not find user for subscription");
    return false;
  }

  return await updateUserSubscription(userId, subscription);
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<boolean> {
  console.log("\n✅ Checkout session completed");
  console.log("Session ID:", session.id);
  console.log("Subscription:", session.subscription);

  const subscriptionId = session.subscription as string;

  if (!subscriptionId) {
    console.log("No subscription in session");
    return true;
  }

  // Fetch the full subscription
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Find user
  let userId: string | null = session.metadata?.firebaseUserId ?? null;
  if (!userId) {
    userId = await findUserByCustomerId(session.customer as string);
  }

  if (!userId) {
    console.error("❌ Could not find user for checkout session");
    return false;
  }

  return await updateUserSubscription(userId, subscription);
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<boolean> {
  console.log("\n💰 Invoice paid");

  // Access subscription using bracket notation
  const invoiceAny = invoice as unknown as Record<string, unknown>;
  const subscriptionId = invoiceAny["subscription"] as string | null;

  if (!subscriptionId) {
    console.log("No subscription on invoice");
    return true;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return await handleSubscriptionEvent(subscription, "invoice.paid");
}

export async function POST(request: NextRequest) {
  console.log("\n" + "=".repeat(80));
  console.log("🔔 STRIPE WEBHOOK RECEIVED");
  console.log("Timestamp:", new Date().toISOString());
  console.log("=".repeat(80));

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("❌ STRIPE_WEBHOOK_SECRET is not set!");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  try {
    const rawBody = await getRawBody(request);
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("❌ No stripe-signature header");
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      console.log("✅ Webhook signature verified");
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log("\n📨 Event Type:", event.type);
    console.log("Event ID:", event.id);

    let success = true;

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription") {
          success = await handleCheckoutCompleted(session);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        success = await handleSubscriptionEvent(subscription, event.type);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        let userId: string | null =
          subscription.metadata?.firebaseUserId ?? null;
        if (!userId) {
          userId = await findUserByCustomerId(subscription.customer as string);
        }
        if (userId) {
          await db.collection("users").doc(userId).update({
            "subscription.status": "canceled",
            "subscription.canceledAt": Date.now(),
            "subscription.updatedAt": Date.now(),
          });
          console.log("✅ Marked subscription as canceled");
        }
        break;
      }

      case "invoice.paid":
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        success = await handleInvoicePaid(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("⚠️ Payment failed for invoice:", invoice.id);
        const invoiceAny = invoice as unknown as Record<string, unknown>;
        const subscriptionId = invoiceAny["subscription"] as string | null;
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId
          );
          await handleSubscriptionEvent(subscription, event.type);
        }
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    console.log("\n" + "=".repeat(80));
    console.log(
      success
        ? "✅ Webhook processed successfully"
        : "⚠️ Webhook processed with issues"
    );
    console.log("=".repeat(80) + "\n");

    return NextResponse.json({ received: true, success });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("\n❌ Webhook error:", errorMessage);
    return NextResponse.json(
      { error: "Webhook handler failed", details: errorMessage },
      { status: 500 }
    );
  }
}
