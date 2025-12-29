import { db } from "@/lib/firebaseAdmin.mjs";
import { requireAdmin } from "@/lib/authAdmin";
import { NextRequest, NextResponse } from "next/server";

// GET single plan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  const { planId } = await params;

  console.log("=".repeat(80));
  console.log("ADMIN SUBSCRIPTION PLAN API - GET", planId);
  console.log("=".repeat(80));

  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const doc = await db.collection("subscriptionPlans").doc(planId).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error fetching plan:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// PATCH update plan
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  const { planId } = await params;

  console.log("=".repeat(80));
  console.log("ADMIN SUBSCRIPTION PLAN API - UPDATE", planId);
  console.log("=".repeat(80));

  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("Updating plan with data:", JSON.stringify(body, null, 2));

    const planRef = db.collection("subscriptionPlans").doc(planId);
    const doc = await planRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.createdAt;

    await planRef.update(updateData);

    console.log("Plan updated successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// DELETE plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  const { planId } = await params;

  console.log("=".repeat(80));
  console.log("ADMIN SUBSCRIPTION PLAN API - DELETE", planId);
  console.log("=".repeat(80));

  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const planRef = db.collection("subscriptionPlans").doc(planId);
    const doc = await planRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Check if any users/companies are using this plan
    const [usersSnap, companiesSnap] = await Promise.all([
      db
        .collection("users")
        .where("activeSubscriptionId", "==", planId)
        .limit(1)
        .get(),
      db
        .collection("companies")
        .where("activeSubscriptionId", "==", planId)
        .limit(1)
        .get(),
    ]);

    if (!usersSnap.empty || !companiesSnap.empty) {
      return NextResponse.json(
        {
          error:
            "Cannot delete plan with active subscribers. Deactivate it instead.",
        },
        { status: 400 }
      );
    }

    await planRef.delete();

    console.log("Plan deleted successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting plan:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
