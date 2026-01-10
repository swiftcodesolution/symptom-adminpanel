// app/api/admin/subscriptions/b2c/route.ts
import { db } from "@/lib/firebaseAdmin.mjs";
import { requireAdmin } from "@/lib/authAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("=".repeat(80));
  console.log("ADMIN B2C SUBSCRIPTIONS API - GET ALL");
  console.log("=".repeat(80));

  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all users from Firebase
    const usersSnapshot = await db.collection("users").get();

    // Filter and map users who have subscription data
    const subscribers = usersSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || data.displayName || null,
          email: data.email || null,
          photoURL: data.photoURL || null,
          createdAt: data.createdAt?._seconds
            ? data.createdAt._seconds * 1000
            : data.createdAt?.toMillis?.() || null,
          subscription: data.subscription || null,
        };
      })
      .filter((user) => {
        // Include users who have either:
        // 1. A full subscription with subscriptionId
        // 2. A stripeCustomerId (meaning they started checkout)
        return (
          user.subscription?.subscriptionId ||
          user.subscription?.stripeCustomerId
        );
      })
      .sort((a, b) => {
        // Sort by subscription creation date or updatedAt
        const aTime =
          a.subscription?.createdAt ||
          a.subscription?.updatedAt ||
          a.createdAt ||
          0;
        const bTime =
          b.subscription?.createdAt ||
          b.subscription?.updatedAt ||
          b.createdAt ||
          0;
        return bTime - aTime;
      });

    console.log(`Found ${subscribers.length} users with subscription data`);

    // Categorize subscribers
    const activeCount = subscribers.filter(
      (s) => s.subscription?.status === "active"
    ).length;
    const trialingCount = subscribers.filter(
      (s) => s.subscription?.status === "trialing"
    ).length;
    const pastDueCount = subscribers.filter(
      (s) => s.subscription?.status === "past_due"
    ).length;
    const canceledCount = subscribers.filter(
      (s) => s.subscription?.status === "canceled"
    ).length;
    const incompleteCount = subscribers.filter(
      (s) => !s.subscription?.subscriptionId && s.subscription?.stripeCustomerId
    ).length;

    console.log(`  - Active: ${activeCount}`);
    console.log(`  - Trialing: ${trialingCount}`);
    console.log(`  - Past Due: ${pastDueCount}`);
    console.log(`  - Canceled: ${canceledCount}`);
    console.log(`  - Incomplete: ${incompleteCount}`);

    return NextResponse.json(subscribers);
  } catch (error) {
    console.error("Error fetching B2C subscribers:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
