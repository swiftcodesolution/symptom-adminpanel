// app/api/stripe/plans/route.ts
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET() {
  console.log("=".repeat(80));
  console.log("STRIPE PLANS API - Fetching active plans from Stripe");
  console.log("=".repeat(80));

  try {
    // Fetch all active prices with their products
    // Only get prices that are:
    // 1. Active
    // 2. Recurring (subscriptions)
    // 3. Have metadata.type = 'b2c' (you'll set this in Stripe Dashboard)
    const prices = await stripe.prices.list({
      active: true,
      type: "recurring",
      expand: ["data.product"],
      limit: 100,
    });

    // Filter and format plans
    const plans = prices.data
      .filter((price) => {
        const product = price.product as Stripe.Product;
        // Filter out archived products and check for b2c type
        return (
          product.active &&
          (product.metadata?.type === "b2c" || !product.metadata?.type) // Include if no type specified or b2c
        );
      })
      .map((price) => {
        const product = price.product as Stripe.Product;

        return {
          priceId: price.id,
          productId: product.id,
          name: product.name,
          description: product.description || "",
          price: price.unit_amount || 0,
          currency: price.currency,
          interval: price.recurring?.interval || "month",
          intervalCount: price.recurring?.interval_count || 1,
          features: product.metadata?.features
            ? JSON.parse(product.metadata.features)
            : [],
          metadata: product.metadata,
          // For sorting
          sortOrder: parseInt(product.metadata?.sortOrder || "999"),
        };
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);

    console.log(`Found ${plans.length} active B2C plans`);

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Error fetching Stripe plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
