// app/api/admin/subscriptions/sync/route.ts
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebaseAdmin.mjs";
import { requireAdmin } from "@/lib/authAdmin";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Helper to remove undefined values from object
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

// Helper to safely extract subscription properties (for newer Stripe API versions)
function getSubscriptionData(subscription: Stripe.Subscription) {
  const subAny = subscription as unknown as Record<string, unknown>;
  return {
    currentPeriodStart: subAny["current_period_start"] as number | undefined,
    currentPeriodEnd: subAny["current_period_end"] as number | undefined,
    cancelAtPeriodEnd: subAny["cancel_at_period_end"] as boolean | undefined,
    canceledAt: subAny["canceled_at"] as number | null | undefined,
    created: subAny["created"] as number | undefined,
  };
}

// POST - Sync a specific user's subscription from Stripe
export async function POST(request: NextRequest) {
  console.log("=".repeat(80));
  console.log("SYNC SUBSCRIPTION API - Single User");
  console.log("=".repeat(80));

  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, stripeCustomerId } = body;

    if (!userId && !stripeCustomerId) {
      return NextResponse.json(
        { error: "userId or stripeCustomerId required" },
        { status: 400 }
      );
    }

    let customerId = stripeCustomerId;
    let targetUserId = userId;

    // If we have userId, get the customer ID from Firebase
    if (userId && !stripeCustomerId) {
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      customerId = userDoc.data()?.subscription?.stripeCustomerId;
      if (!customerId) {
        return NextResponse.json(
          { error: "User has no Stripe customer ID" },
          { status: 400 }
        );
      }
    }

    // If we only have customer ID, find the user
    if (stripeCustomerId && !userId) {
      const usersSnapshot = await db
        .collection("users")
        .where("subscription.stripeCustomerId", "==", stripeCustomerId)
        .limit(1)
        .get();

      if (usersSnapshot.empty) {
        return NextResponse.json(
          { error: "No user found with this Stripe customer ID" },
          { status: 404 }
        );
      }
      targetUserId = usersSnapshot.docs[0].id;
    }

    console.log("Syncing subscription for user:", targetUserId);
    console.log("Stripe customer ID:", customerId);

    // Fetch subscriptions from Stripe
    let subscriptions;
    try {
      subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        limit: 1,
        status: "all",
      });
    } catch (stripeError) {
      const errorMessage =
        stripeError instanceof Error
          ? stripeError.message
          : String(stripeError);
      console.error("Stripe API error:", errorMessage);
      return NextResponse.json(
        { error: "Failed to fetch from Stripe", details: errorMessage },
        { status: 500 }
      );
    }

    if (subscriptions.data.length === 0) {
      // No subscription found - update status
      const noSubData = removeUndefined({
        stripeCustomerId: customerId,
        subscriptionId: null,
        priceId: null,
        productId: null,
        planName: null,
        status: "no_subscription",
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        canceledAt: null,
        updatedAt: Date.now(),
      });

      await db.collection("users").doc(targetUserId).update({
        subscription: noSubData,
      });

      return NextResponse.json({
        success: true,
        userId: targetUserId,
        message: "No active subscription found in Stripe",
        subscription: noSubData,
      });
    }

    const subscription = subscriptions.data[0];
    console.log("Found subscription:", subscription.id);
    console.log("Subscription status:", subscription.status);

    // Get price and product info safely
    const priceItem = subscription.items.data[0];
    const priceData = priceItem?.price;
    const priceId = priceData?.id || null;

    // Product can be a string ID or expanded object
    let productId: string | null = null;
    if (typeof priceData?.product === "string") {
      productId = priceData.product;
    } else if (priceData?.product && typeof priceData.product === "object") {
      productId = (priceData.product as Stripe.Product).id;
    }

    console.log("Price ID:", priceId);
    console.log("Product ID:", productId);

    // Get product name
    let planName = "Unknown Plan";
    if (productId) {
      try {
        const product = await stripe.products.retrieve(productId);
        planName = product.name;
        console.log("Plan name:", planName);
      } catch (e) {
        console.error("Error fetching product:", e);
      }
    }

    // Extract subscription properties safely
    const subData = getSubscriptionData(subscription);

    // Build subscription data - ensure no undefined values
    const subscriptionData = removeUndefined({
      stripeCustomerId: customerId,
      subscriptionId: subscription.id,
      priceId: priceId,
      productId: productId,
      planName: planName,
      status: subscription.status,
      currentPeriodStart: subData.currentPeriodStart ?? null,
      currentPeriodEnd: subData.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: subData.cancelAtPeriodEnd ?? false,
      canceledAt: subData.canceledAt ?? null,
      createdAt: subData.created ? subData.created * 1000 : Date.now(),
      updatedAt: Date.now(),
    });

    console.log(
      "Subscription data to save:",
      JSON.stringify(subscriptionData, null, 2)
    );

    // Update Firebase
    await db.collection("users").doc(targetUserId).update({
      subscription: subscriptionData,
    });

    console.log("✅ Subscription synced successfully");

    return NextResponse.json({
      success: true,
      userId: targetUserId,
      subscription: subscriptionData,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error syncing subscription:", errorMessage);
    return NextResponse.json(
      {
        error: "Failed to sync subscription",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

// PUT - Sync ALL users with Stripe customer IDs
export async function PUT(request: NextRequest) {
  console.log("=".repeat(80));
  console.log("SYNC ALL SUBSCRIPTIONS API");
  console.log("=".repeat(80));

  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all users with stripeCustomerId
    const usersSnapshot = await db.collection("users").get();

    const usersWithCustomerId = usersSnapshot.docs.filter((doc) => {
      const data = doc.data();
      return data.subscription?.stripeCustomerId;
    });

    console.log(
      `Found ${usersWithCustomerId.length} users with Stripe customer IDs`
    );

    const results = {
      total: usersWithCustomerId.length,
      synced: 0,
      failed: 0,
      noSubscription: 0,
      details: [] as Array<{
        userId: string;
        status: string;
        planName?: string;
        error?: string;
      }>,
    };

    for (const userDoc of usersWithCustomerId) {
      const userData = userDoc.data();
      const customerId = userData.subscription?.stripeCustomerId;

      try {
        // Fetch subscription from Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          limit: 1,
          status: "all",
        });

        if (subscriptions.data.length === 0) {
          results.noSubscription++;
          results.details.push({
            userId: userDoc.id,
            status: "no_subscription",
          });

          // Update user to reflect no subscription
          await db
            .collection("users")
            .doc(userDoc.id)
            .update({
              subscription: removeUndefined({
                stripeCustomerId: customerId,
                subscriptionId: null,
                status: "no_subscription",
                updatedAt: Date.now(),
              }),
            });
          continue;
        }

        const subscription = subscriptions.data[0];

        // Get price and product info safely
        const priceItem = subscription.items.data[0];
        const priceData = priceItem?.price;
        const priceId = priceData?.id || null;

        let productId: string | null = null;
        if (typeof priceData?.product === "string") {
          productId = priceData.product;
        } else if (
          priceData?.product &&
          typeof priceData.product === "object"
        ) {
          productId = (priceData.product as Stripe.Product).id;
        }

        // Get product name
        let planName = "Unknown Plan";
        if (productId) {
          try {
            const product = await stripe.products.retrieve(productId);
            planName = product.name;
          } catch (e) {
            // Ignore
            console.log(e);
          }
        }

        // Extract subscription properties safely
        const subData = getSubscriptionData(subscription);

        // Build subscription data
        const subscriptionData = removeUndefined({
          stripeCustomerId: customerId,
          subscriptionId: subscription.id,
          priceId: priceId,
          productId: productId,
          planName: planName,
          status: subscription.status,
          currentPeriodStart: subData.currentPeriodStart ?? null,
          currentPeriodEnd: subData.currentPeriodEnd ?? null,
          cancelAtPeriodEnd: subData.cancelAtPeriodEnd ?? false,
          canceledAt: subData.canceledAt ?? null,
          createdAt: subData.created ? subData.created * 1000 : Date.now(),
          updatedAt: Date.now(),
        });

        // Update Firebase
        await db.collection("users").doc(userDoc.id).update({
          subscription: subscriptionData,
        });

        results.synced++;
        results.details.push({
          userId: userDoc.id,
          status: subscription.status,
          planName: planName,
        });
        console.log(
          `✅ Synced user ${userDoc.id} - ${subscription.status} - ${planName}`
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        results.failed++;
        results.details.push({
          userId: userDoc.id,
          status: "error",
          error: errorMessage,
        });
        console.error(`❌ Failed to sync user ${userDoc.id}:`, errorMessage);
      }

      // Add small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("\nSync complete:", {
      synced: results.synced,
      failed: results.failed,
      noSubscription: results.noSubscription,
    });

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in bulk sync:", errorMessage);
    return NextResponse.json(
      { error: "Failed to sync subscriptions", details: errorMessage },
      { status: 500 }
    );
  }
}
