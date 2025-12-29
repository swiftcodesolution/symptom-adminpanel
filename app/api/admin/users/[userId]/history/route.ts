// app\api\admin\users\[userId]\history\route.ts
import { db } from "@/lib/firebaseAdmin.mjs";
import { requireAdmin } from "@/lib/authAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  console.log("=".repeat(80));
  console.log("ADMIN USER HISTORY API - REQUEST START");
  console.log("=".repeat(80));
  console.log("Request for userId:", userId);

  const admin = await requireAdmin(request);
  if (!admin) {
    console.error("ADMIN USER HISTORY API - Unauthorized access attempt");
    console.log("=".repeat(80));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("\n📡 Fetching medical history from Firestore...");

    const reportsSnap = await db
      .collection("medicalReports")
      .where("userId", "==", userId)
      .get();

    console.log("\n✅ Data fetch complete");
    console.log("\n" + "=".repeat(80));
    console.log("📊 HISTORY SUMMARY");
    console.log("=".repeat(80));
    console.log("Reports count:", reportsSnap.size);
    if (reportsSnap.size > 0)
      console.log(
        "Sample report:",
        JSON.stringify(reportsSnap.docs[0].data(), null, 2)
      );

    const history = reportsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("\n" + "=".repeat(80));
    console.log("📤 FINAL RESPONSE OBJECT:");
    console.log("=".repeat(80));
    console.log(JSON.stringify({ history }, null, 2));
    console.log("\n" + "=".repeat(80));
    console.log(
      "✅ ADMIN USER HISTORY API - Response prepared successfully for userId:",
      userId
    );
    console.log("=".repeat(80) + "\n");

    return NextResponse.json({ history });
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("❌ ADMIN USER HISTORY API - ERROR OCCURRED");
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
