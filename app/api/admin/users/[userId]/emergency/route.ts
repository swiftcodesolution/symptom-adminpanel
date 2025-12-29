// app\api\admin\users\[userId]\emergency\route.ts
import { db } from "@/lib/firebaseAdmin.mjs";
import { requireAdmin } from "@/lib/authAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  console.log("=".repeat(80));
  console.log("ADMIN USER EMERGENCY API - REQUEST START");
  console.log("=".repeat(80));
  console.log("Request for userId:", userId);

  const admin = await requireAdmin(request);
  if (!admin) {
    console.error("ADMIN USER EMERGENCY API - Unauthorized access attempt");
    console.log("=".repeat(80));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("\n📡 Fetching emergency logs from Firestore...");

    const snap = await db
      .collection("emergencyContacts")
      .where("userId", "==", userId)
      .get();

    console.log("\n✅ Data fetch complete");
    console.log("\n" + "=".repeat(80));
    console.log("📊 EMERGENCY SUMMARY");
    console.log("=".repeat(80));
    console.log("Logs count:", snap.size);
    if (snap.size > 0)
      console.log("Sample log:", JSON.stringify(snap.docs[0].data(), null, 2));

    const logs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    console.log("\n" + "=".repeat(80));
    console.log("📤 FINAL RESPONSE OBJECT:");
    console.log("=".repeat(80));
    console.log(JSON.stringify(logs, null, 2));
    console.log("\n" + "=".repeat(80));
    console.log(
      "✅ ADMIN USER EMERGENCY API - Response prepared successfully for userId:",
      userId
    );
    console.log("=".repeat(80) + "\n");

    return NextResponse.json(logs);
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("❌ ADMIN USER EMERGENCY API - ERROR OCCURRED");
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
