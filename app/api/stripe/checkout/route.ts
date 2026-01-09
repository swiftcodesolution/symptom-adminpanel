// app/api/stripe/checkout/route.ts
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebaseAdmin.mjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("=".repeat(80));
  console.log("STRIPE CHECKOUT API - Creating checkout session");
  console.log("=".repeat(80));

  try {
    const body = await request.json();
    const { userId, priceId, userEmail, userName } = body;

    // Validation
    if (!userId || !priceId) {
      return NextResponse.json(
        { error: "userId and priceId are required" },
        { status: 400 }
      );
    }

    console.log("Creating checkout for:", { userId, priceId, userEmail });

    // Check if user exists in Firebase
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const email = userEmail || userData?.email;

    // Check if user already has a Stripe customer ID
    let customerId = userData?.subscription?.stripeCustomerId;

    if (!customerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: email,
        name: userName || userData?.name || userData?.displayName,
        metadata: {
          firebaseUserId: userId,
        },
      });
      customerId = customer.id;
      console.log("Created new Stripe customer:", customerId);
    } else {
      console.log("Using existing Stripe customer:", customerId);
    }

    // Get the base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/subscribe/${userId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscribe/${userId}/cancel`,
      metadata: {
        firebaseUserId: userId,
      },
      subscription_data: {
        metadata: {
          firebaseUserId: userId,
        },
      },
      // Optional: Allow promotion codes
      allow_promotion_codes: true,
      // Optional: Collect billing address
      billing_address_collection: "auto",
    });

    console.log("Checkout session created:", session.id);

    // Store the customer ID in Firebase if it's new
    if (!userData?.subscription?.stripeCustomerId) {
      await db.collection("users").doc(userId).update({
        "subscription.stripeCustomerId": customerId,
        "subscription.updatedAt": Date.now(),
      });
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
