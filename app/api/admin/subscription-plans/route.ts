import { db } from "@/lib/firebaseAdmin.mjs";
import { requireAdmin } from "@/lib/authAdmin";
import { NextRequest, NextResponse } from "next/server";

// GET all subscription plans
export async function GET(request: NextRequest) {
  console.log("=".repeat(80));
  console.log("ADMIN SUBSCRIPTION PLANS API - GET ALL");
  console.log("=".repeat(80));

  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snap = await db
      .collection("subscriptionPlans")
      .orderBy("price", "asc")
      .get();

    const plans = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Plans fetched:", plans.length);
    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST create new subscription plan
export async function POST(request: NextRequest) {
  console.log("=".repeat(80));
  console.log("ADMIN SUBSCRIPTION PLANS API - CREATE");
  console.log("=".repeat(80));

  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("Creating plan with data:", JSON.stringify(body, null, 2));

    // Validation
    if (!body.name || body.price === undefined || !body.type) {
      return NextResponse.json(
        { error: "Name, price, and type are required" },
        { status: 400 }
      );
    }

    const planData = {
      name: body.name,
      description: body.description || "",
      price: Number(body.price),
      billingCycle: body.billingCycle || "monthly", // monthly, yearly
      type: body.type, // b2c, b2b
      features: body.features || [],
      maxUsers: body.maxUsers || 1, // -1 for unlimited
      isActive: body.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection("subscriptionPlans").add(planData);

    console.log("Plan created with ID:", docRef.id);
    return NextResponse.json({ id: docRef.id, ...planData }, { status: 201 });
  } catch (error) {
    console.error("Error creating plan:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
