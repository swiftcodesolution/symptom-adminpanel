import { db } from "@/lib/firebaseAdmin.mjs";
import { requireAdmin } from "@/lib/authAdmin";
import { NextRequest, NextResponse } from "next/server";

// GET single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; userId: string }> }
) {
  const { companyId, userId } = await params;

  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();

    // Verify user belongs to this company
    if (userData?.companyId !== companyId) {
      return NextResponse.json(
        { error: "User not in this company" },
        { status: 403 }
      );
    }

    return NextResponse.json({ id: userDoc.id, ...userData });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// PATCH update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; userId: string }> }
) {
  const { companyId, userId } = await params;

  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    if (userData?.companyId !== companyId) {
      return NextResponse.json(
        { error: "User not in this company" },
        { status: 403 }
      );
    }

    // Remove sensitive fields that shouldn't be updated this way
    const { password, companyId: _, ...updateData } = body;

    await userRef.update({
      ...updateData,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; userId: string }> }
) {
  const { companyId, userId } = await params;

  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    if (userData?.companyId !== companyId) {
      return NextResponse.json(
        { error: "User not in this company" },
        { status: 403 }
      );
    }

    await userRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
