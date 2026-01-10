// app/api/admin/subscriptions/stats/route.ts
import { db } from "@/lib/firebaseAdmin.mjs";
import { requireAdmin } from "@/lib/authAdmin";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("=".repeat(80));
  console.log("ADMIN SUBSCRIPTION STATS API");
  console.log("=".repeat(80));

  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch stats from Stripe directly for accuracy
    const [activeSubscriptions, trialingSubscriptions, pastDueSubscriptions] =
      await Promise.all([
        stripe.subscriptions.list({ status: "active", limit: 100 }),
        stripe.subscriptions.list({ status: "trialing", limit: 100 }),
        stripe.subscriptions.list({ status: "past_due", limit: 100 }),
      ]);

    // Calculate MRR (Monthly Recurring Revenue)
    let mrr = 0;
    const allActive = [
      ...activeSubscriptions.data,
      ...trialingSubscriptions.data,
    ];

    for (const sub of allActive) {
      const price = sub.items.data[0]?.price;
      if (price?.unit_amount) {
        if (price.recurring?.interval === "year") {
          mrr += price.unit_amount / 12; // Convert yearly to monthly
        } else if (price.recurring?.interval === "month") {
          mrr += price.unit_amount / (price.recurring?.interval_count || 1);
        } else if (price.recurring?.interval === "week") {
          mrr += (price.unit_amount * 52) / 12; // Convert weekly to monthly
        } else {
          mrr += price.unit_amount;
        }
      }
    }

    // Get customers who will cancel at period end
    const cancelingCount = activeSubscriptions.data.filter(
      (sub) => sub.cancel_at_period_end
    ).length;

    // Get company count from Firebase
    const companiesSnapshot = await db.collection("companies").get();
    const activeCompanies = companiesSnapshot.docs.filter(
      (doc) => doc.data().status === "active"
    ).length;

    // Get total B2C users with any subscription interaction
    const usersSnapshot = await db.collection("users").get();
    const usersWithSubscription = usersSnapshot.docs.filter((doc) => {
      const data = doc.data();
      return data.subscription?.stripeCustomerId;
    }).length;

    const stats = {
      mrr: mrr / 100, // Convert cents to dollars
      activeSubscriptions: activeSubscriptions.data.length,
      trialingSubscriptions: trialingSubscriptions.data.length,
      pastDueSubscriptions: pastDueSubscriptions.data.length,
      cancelingSubscriptions: cancelingCount,
      totalB2CCustomers: usersWithSubscription,
      totalB2BCompanies: companiesSnapshot.size,
      activeB2BCompanies: activeCompanies,
    };

    console.log("Stats:", stats);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching subscription stats:", error);
    // Return partial stats if Stripe fails
    try {
      const companiesSnapshot = await db.collection("companies").get();
      const usersSnapshot = await db.collection("users").get();

      const usersWithSubscription = usersSnapshot.docs.filter((doc) => {
        const data = doc.data();
        return data.subscription?.stripeCustomerId;
      });

      const activeUsers = usersWithSubscription.filter((doc) => {
        const data = doc.data();
        return data.subscription?.status === "active";
      });

      return NextResponse.json({
        mrr: 0,
        activeSubscriptions: activeUsers.length,
        trialingSubscriptions: 0,
        pastDueSubscriptions: 0,
        cancelingSubscriptions: 0,
        totalB2CCustomers: usersWithSubscription.length,
        totalB2BCompanies: companiesSnapshot.size,
        activeB2BCompanies: companiesSnapshot.docs.filter(
          (doc) => doc.data().status === "active"
        ).length,
        error: "Stripe API unavailable, showing cached data",
      });
    } catch (fallbackError) {
      console.log(fallbackError);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
  }
}
