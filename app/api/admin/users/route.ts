// app/panel/api/admin/users/route.ts
import { db } from "@/lib/firebaseAdmin.mjs";
import { requireAdmin } from "@/lib/authAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("=".repeat(80));
  console.log("ADMIN USERS LIST API - REQUEST START");
  console.log("=".repeat(80));

  const admin = await requireAdmin(request);
  if (!admin) {
    console.error("ADMIN USERS LIST API - Unauthorized access attempt");
    console.log("=".repeat(80));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("\n📡 Fetching all users from Firestore...");

    const snap = await db.collection("users").get();

    console.log("\n✅ Data fetch complete");
    console.log("\n" + "=".repeat(80));
    console.log("📊 USERS SUMMARY");
    console.log("=".repeat(80));
    console.log("Total users count:", snap.size);
    if (snap.size > 0) {
      console.log("Sample user:", JSON.stringify(snap.docs[0].data(), null, 2));
    }

    const users = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("\n" + "=".repeat(80));
    console.log("📤 FINAL RESPONSE OBJECT:");
    console.log("=".repeat(80));
    console.log(JSON.stringify(users, null, 2));
    console.log("\n" + "=".repeat(80));
    console.log("✅ ADMIN USERS LIST API - Response prepared successfully");
    console.log("=".repeat(80) + "\n");

    return NextResponse.json(users);
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("❌ ADMIN USERS LIST API - ERROR OCCURRED");
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
