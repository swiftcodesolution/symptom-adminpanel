// app/panel/api/admin/companies/[companyId]/users/route.ts
import { db } from "@/lib/firebaseAdmin.mjs";
import { requireAdmin } from "@/lib/authAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  console.log("=".repeat(80));
  console.log("ADMIN COMPANY USERS API - REQUEST START");
  console.log("=".repeat(80));

  // Properly await the params Promise
  const { companyId } = await params;

  console.log("Request for companyId:", companyId);

  const admin = await requireAdmin(request);
  if (!admin) {
    console.error("ADMIN COMPANY USERS API - Unauthorized access attempt");
    console.log("=".repeat(80));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!companyId) {
    console.error("ADMIN COMPANY USERS API - Missing companyId in params");
    console.log("=".repeat(80));
    return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
  }

  try {
    console.log("\n📡 Fetching company users from Firestore...");

    const snap = await db
      .collection("users")
      .where("companyId", "==", companyId)
      .get();

    console.log("\n✅ Data fetch complete");
    console.log("\n" + "=".repeat(80));
    console.log("📊 USERS SUMMARY");
    console.log("=".repeat(80));
    console.log("Users count:", snap.size);
    if (snap.size > 0)
      console.log("Sample user:", JSON.stringify(snap.docs[0].data(), null, 2));

    const users = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    console.log("\n" + "=".repeat(80));
    console.log("📤 FINAL RESPONSE OBJECT:");
    console.log("=".repeat(80));
    console.log(JSON.stringify(users, null, 2));
    console.log("\n" + "=".repeat(80));
    console.log(
      "✅ ADMIN COMPANY USERS API - Response prepared successfully for companyId:",
      companyId
    );
    console.log("=".repeat(80) + "\n");

    return NextResponse.json(users);
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("❌ ADMIN COMPANY USERS API - ERROR OCCURRED");
    console.log("=".repeat(80));
    console.error(
      "Error message:",
      error instanceof Error ? error.message : error
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );
    console.log("=".repeat(80) + "\n");

    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  console.log("=".repeat(80));
  console.log("ADMIN CREATE COMPANY USER API - REQUEST START");
  console.log("=".repeat(80));

  const { companyId } = await params;

  console.log("Request for companyId:", companyId);

  const admin = await requireAdmin(request);
  if (!admin) {
    console.error(
      "ADMIN CREATE COMPANY USER API - Unauthorized access attempt"
    );
    console.log("=".repeat(80));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!companyId) {
    console.error(
      "ADMIN CREATE COMPANY USER API - Missing companyId in params"
    );
    console.log("=".repeat(80));
    return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
  }

  const body = await request.json();
  console.log("Incoming body:", JSON.stringify(body, null, 2));

  try {
    console.log("\n📡 Creating new user in Firestore...");

    const newUserRef = await db.collection("users").add({
      ...body,
      companyId,
      userType: "company",
      createdAt: new Date(),
    });

    console.log("\n✅ User creation complete");
    console.log("\n" + "=".repeat(80));
    console.log("📊 NEW USER SUMMARY");
    console.log("=".repeat(80));
    console.log("New user ID:", newUserRef.id);

    console.log("\n" + "=".repeat(80));
    console.log("📤 FINAL RESPONSE OBJECT:");
    console.log("=".repeat(80));
    console.log(JSON.stringify({ id: newUserRef.id }, null, 2));
    console.log("\n" + "=".repeat(80));
    console.log(
      "✅ ADMIN CREATE COMPANY USER API - User created successfully for companyId:",
      companyId
    );
    console.log("=".repeat(80) + "\n");

    return NextResponse.json({ id: newUserRef.id }, { status: 201 });
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("❌ ADMIN CREATE COMPANY USER API - ERROR OCCURRED");
    console.log("=".repeat(80));
    console.error(
      "Error message:",
      error instanceof Error ? error.message : error
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );
    console.log("=".repeat(80) + "\n");

    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
