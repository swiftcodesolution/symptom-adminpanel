// app/api/stripe/portal/route.ts
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebaseAdmin.mjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("=".repeat(80));
  console.log("STRIPE PORTAL API - Creating portal session");
  console.log("=".repeat(80));

  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Get user's Stripe customer ID
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const customerId = userData?.subscription?.stripeCustomerId;

    if (!customerId) {
      return NextResponse.json(
        { error: "User has no active subscription" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/subscribe/${userId}`,
    });

    console.log("Portal session created:", session.id);

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
