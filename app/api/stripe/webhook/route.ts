// app/api/stripe/webhook/route.ts
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebaseAdmin.mjs";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Configure route as dynamic (required for webhooks)
export const dynamic = "force-dynamic";

// Helper to get raw body for webhook verification
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
  console.log("\n📝 Updating user subscription...");
  console.log("Event type:", eventType);
  console.log("Subscription ID:", subscription.id);
  console.log("Subscription status:", subscription.status);
  console.log("Subscription metadata:", JSON.stringify(subscription.metadata));

  const userId = subscription.metadata?.firebaseUserId;

  if (!userId) {
    console.error("❌ No firebaseUserId in subscription metadata!");
    console.log("Attempting to find user by customer ID...");

    // Try to find user by stripeCustomerId
    const customerId = subscription.customer as string;
    const usersSnapshot = await db
      .collection("users")
      .where("subscription.stripeCustomerId", "==", customerId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      console.error(
        "❌ Could not find user with stripeCustomerId:",
        customerId
      );
      return false;
    }

    const userDoc = usersSnapshot.docs[0];
    console.log("✅ Found user by customer ID:", userDoc.id);

    // Update using found user ID
    return await updateUserById(userDoc.id, subscription);
  }

  return await updateUserById(userId, subscription);
}

async function updateUserById(
  userId: string,
  subscription: Stripe.Subscription
) {
  console.log(`\n📝 Updating subscription for user: ${userId}`);

  const priceId = subscription.items.data[0]?.price.id;
  const productId = subscription.items.data[0]?.price.product as string;

  // Get product details for plan name
  let planName = "Unknown Plan";
  try {
    const product = await stripe.products.retrieve(productId);
    planName = product.name;
    console.log("Plan name:", planName);
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
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  console.log(
    "Subscription data to save:",
    JSON.stringify(subscriptionData, null, 2)
  );

  try {
    await db.collection("users").doc(userId).update({
      subscription: subscriptionData,
    });
    console.log(`✅ Successfully updated subscription for user ${userId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating user ${userId}:`, error);
    return false;
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log("\n🗑️ Handling subscription deletion...");

  const userId = subscription.metadata?.firebaseUserId;

  if (!userId) {
    // Try to find by customer ID
    const customerId = subscription.customer as string;
    const usersSnapshot = await db
      .collection("users")
      .where("subscription.stripeCustomerId", "==", customerId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      console.error("❌ Could not find user for deleted subscription");
      return;
    }

    const userDoc = usersSnapshot.docs[0];
    await db.collection("users").doc(userDoc.id).update({
      "subscription.status": "canceled",
      "subscription.canceledAt": Date.now(),
      "subscription.updatedAt": Date.now(),
    });
    console.log(`✅ Marked subscription as canceled for user ${userDoc.id}`);
    return;
  }

  await db.collection("users").doc(userId).update({
    "subscription.status": "canceled",
    "subscription.canceledAt": Date.now(),
    "subscription.updatedAt": Date.now(),
  });

  console.log(`✅ Marked subscription as canceled for user ${userId}`);
}

// Handle checkout session completed
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("\n✅ Checkout session completed!");
  console.log("Session ID:", session.id);
  console.log("Customer:", session.customer);
  console.log("Subscription:", session.subscription);
  console.log("Metadata:", JSON.stringify(session.metadata));

  const userId = session.metadata?.firebaseUserId;
  const subscriptionId = session.subscription as string;

  if (!userId) {
    console.error("❌ No firebaseUserId in checkout session metadata");
    return;
  }

  if (!subscriptionId) {
    console.error("❌ No subscription ID in checkout session");
    return;
  }

  // Fetch the full subscription from Stripe
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await updateUserById(userId, subscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
  }
}

// Handle invoice payment succeeded
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log("\n💰 Invoice payment succeeded!");
  console.log("Invoice ID:", invoice.id);
  console.log("Subscription ID:", (invoice as any).subscription);
  console.log("Customer ID:", invoice.customer);

  if (!(invoice as any).subscription) {
    console.log("No subscription on invoice, skipping...");
    return;
  }

  // Fetch the subscription and update
  try {
    const subscription = await stripe.subscriptions.retrieve(
      (invoice as any).subscription as string
    );
    await updateUserSubscription(subscription, "invoice.payment_succeeded");
  } catch (error) {
    console.error("Error handling invoice payment:", error);
  }
}

export async function POST(request: NextRequest) {
  console.log("\n" + "=".repeat(80));
  console.log("🔔 STRIPE WEBHOOK RECEIVED");
  console.log("=".repeat(80));
  console.log("Timestamp:", new Date().toISOString());

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

    console.log("Signature present:", !!signature);

    if (!signature) {
      console.error("❌ No stripe-signature header");
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    // Verify the webhook signature
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

    // Handle the event
    switch (event.type) {
      // Checkout completed - user just subscribed
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription") {
          await handleCheckoutCompleted(session);
        }
        break;

      // Subscription lifecycle events
      case "customer.subscription.created":
        console.log("\n🆕 Subscription CREATED");
        await updateUserSubscription(
          event.data.object as Stripe.Subscription,
          event.type
        );
        break;

      case "customer.subscription.updated":
        console.log("\n🔄 Subscription UPDATED");
        await updateUserSubscription(
          event.data.object as Stripe.Subscription,
          event.type
        );
        break;

      case "customer.subscription.deleted":
        console.log("\n❌ Subscription DELETED");
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      // Invoice/Payment events
      case "invoice.payment_succeeded":
        console.log("\n💵 Invoice payment SUCCEEDED");
        await handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice
        );
        break;

      case "invoice.paid":
        console.log("\n💵 Invoice PAID");
        await handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice
        );
        break;

      case "invoice.payment_failed":
        console.log("\n⚠️ Invoice payment FAILED");
        const failedInvoice = event.data.object as Stripe.Invoice;
        console.log("Failed invoice ID:", failedInvoice.id);
        // Optionally update user status
        if ((failedInvoice as any).subscription) {
          try {
            const subscription = await stripe.subscriptions.retrieve(
              (failedInvoice as any).subscription as string
            );
            await updateUserSubscription(
              subscription,
              "invoice.payment_failed"
            );
          } catch (error) {
            console.error("Error handling failed payment:", error);
          }
        }
        break;

      // Payment intent events (alternative way to track payments)
      case "payment_intent.succeeded":
        console.log("\n💳 Payment intent SUCCEEDED");
        // Usually handled via invoice events, but log for debugging
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    console.log("\n" + "=".repeat(80));
    console.log("✅ Webhook processing complete");
    console.log("=".repeat(80) + "\n");

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("\n❌ Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
