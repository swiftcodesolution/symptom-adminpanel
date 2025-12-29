/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/firebaseAdmin.mjs";
import { requireCompanyAdmin } from "@/lib/authCompany";
import { NextRequest, NextResponse } from "next/server";

// GET single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; userId: string }> }
) {
  const { companyId, userId } = await params;

  const verified = await requireCompanyAdmin(request, companyId);
  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const doc = await db.collection("users").doc(userId).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = doc.data();
    if (userData?.companyId !== companyId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ id: doc.id, ...userData });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// PATCH update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; userId: string }> }
) {
  const { companyId, userId } = await params;

  console.log("=".repeat(80));
  console.log("COMPANY UPDATE USER API");
  console.log("=".repeat(80));

  const verified = await requireCompanyAdmin(request, companyId);
  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (doc.data()?.companyId !== companyId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check for duplicate username if username is being changed
    if (body.username && body.username !== doc.data()?.username) {
      const duplicateSnap = await db
        .collection("users")
        .where("companyId", "==", companyId)
        .where("username", "==", body.username)
        .limit(1)
        .get();

      if (!duplicateSnap.empty) {
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 400 }
        );
      }
    }

    // Allowed fields to update
    const allowedFields = [
      "name",
      "email",
      "username",
      "phone",
      "employeeId",
      "department",
      "role",
      "status",
    ];

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    await userRef.update(updateData);

    console.log("User updated:", userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; userId: string }> }
) {
  const { companyId, userId } = await params;

  console.log("=".repeat(80));
  console.log("COMPANY DELETE USER API");
  console.log("=".repeat(80));

  const verified = await requireCompanyAdmin(request, companyId);
  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (doc.data()?.companyId !== companyId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await userRef.delete();

    console.log("User deleted:", userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
