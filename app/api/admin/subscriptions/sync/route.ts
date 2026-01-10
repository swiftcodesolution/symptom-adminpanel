// app/api/admin/subscriptions/sync/route.ts
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebaseAdmin.mjs";
import { requireAdmin } from "@/lib/authAdmin";
import { NextRequest, NextResponse } from "next/server";

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
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: "all",
    });

    if (subscriptions.data.length === 0) {
      // No subscription found - update status
      await db.collection("users").doc(targetUserId).update({
        "subscription.status": "no_subscription",
        "subscription.updatedAt": Date.now(),
      });

      return NextResponse.json({
        success: true,
        userId: targetUserId,
        message: "No active subscription found in Stripe",
        subscription: { status: "no_subscription" },
      });
    }

    const subscription = subscriptions.data[0];
    console.log("Found subscription:", subscription.id, subscription.status);

    // Get product name
    const priceData = subscription.items.data[0]?.price;
    const productId =
      typeof priceData?.product === "string"
        ? priceData.product
        : priceData?.product?.id;

    let planName = "Unknown Plan";
    if (
      typeof priceData?.product === "object" &&
      (priceData.product as any)?.name
    ) {
      planName = (priceData.product as any).name;
    } else if (productId) {
      try {
        const product = await stripe.products.retrieve(productId);
        planName = (product as any).name || "Unknown Plan";
      } catch (e) {
        console.error("Error fetching product:", e);
      }
    }

    // Build subscription data
    const subscriptionData = {
      stripeCustomerId: customerId,
      subscriptionId: subscription.id,
      priceId: priceData?.id,
      productId: productId,
      planName: planName,
      status: subscription.status,
      currentPeriodStart: (subscription as any).current_period_start,
      currentPeriodEnd: (subscription as any).current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at || null,
      createdAt: subscription.created * 1000,
      updatedAt: Date.now(),
    };

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
    console.error("Error syncing subscription:", error);
    return NextResponse.json(
      {
        error: "Failed to sync subscription",
        details: (error as Error).message,
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
          await db.collection("users").doc(userDoc.id).update({
            "subscription.status": "no_subscription",
            "subscription.subscriptionId": null,
            "subscription.updatedAt": Date.now(),
          });
          continue;
        }

        const subscription = subscriptions.data[0];

        // Get product name
        const productId = subscription.items.data[0]?.price.product as string;
        let planName = "Unknown Plan";
        try {
          const product = await stripe.products.retrieve(productId);
          planName = (product as any).name || "Unknown Plan";
        } catch (e) {
          // Ignore
          console.log(e);
        }

        // Update Firebase
        await db
          .collection("users")
          .doc(userDoc.id)
          .update({
            subscription: {
              stripeCustomerId: customerId,
              subscriptionId: subscription.id,
              priceId: subscription.items.data[0]?.price.id,
              productId: productId,
              planName: planName,
              status: subscription.status,
              currentPeriodStart: (subscription as any).current_period_start,
              currentPeriodEnd: (subscription as any).current_period_end,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              canceledAt: subscription.canceled_at || null,
              createdAt: subscription.created * 1000,
              updatedAt: Date.now(),
            },
          });

        results.synced++;
        results.details.push({
          userId: userDoc.id,
          status: subscription.status,
          planName: planName,
        });
        console.log(`✅ Synced user ${userDoc.id} - ${subscription.status}`);
      } catch (error) {
        results.failed++;
        results.details.push({
          userId: userDoc.id,
          status: "error",
          error: (error as Error).message,
        });
        console.error(`❌ Failed to sync user ${userDoc.id}:`, error);
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
    console.error("Error in bulk sync:", error);
    return NextResponse.json(
      { error: "Failed to sync subscriptions" },
      { status: 500 }
    );
  }
}
