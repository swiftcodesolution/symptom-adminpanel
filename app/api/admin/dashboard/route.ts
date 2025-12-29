// app\api\admin\dashboard\route.ts
import { db } from "@/lib/firebaseAdmin.mjs";
import { requireAdmin } from "@/lib/authAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("=".repeat(80));
  console.log("ADMIN DASHBOARD API - REQUEST START");
  console.log("=".repeat(80));

  const admin = await requireAdmin(request);
  if (!admin) {
    console.error("ADMIN DASHBOARD API - Unauthorized access attempt");
    console.log("=".repeat(80));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("\n📡 Fetching dashboard metrics from Firestore...");

    const [usersSnap, activeUsersSnap, chatsSnap, medicinesSnap, sosSnap] =
      await Promise.all([
        db.collection("users").get(),
        db.collection("users").where("status", "==", "active").get(),
        db.collection("chatHistory").where("status", "==", "ongoing").get(),
        db.collection("medicines").where("active", "==", true).get(),
        db.collection("emergencyContacts").get(),
      ]);

    console.log("\n✅ Data fetch complete");
    console.log("\n" + "=".repeat(80));
    console.log("📊 METRICS SUMMARY");
    console.log("=".repeat(80));
    console.log("Total Users:", usersSnap.size);
    console.log("Active Users:", activeUsersSnap.size);
    console.log("Ongoing Chats:", chatsSnap.size);
    console.log("Active Medicines:", medicinesSnap.size);
    console.log("SOS Events:", sosSnap.size);

    const response = {
      totalUsers: usersSnap.size,
      activeUsers: activeUsersSnap.size,
      ongoingChats: chatsSnap.size,
      activeMedicines: medicinesSnap.size,
      sosEvents: sosSnap.size,
    };

    console.log("\n" + "=".repeat(80));
    console.log("📤 FINAL RESPONSE OBJECT:");
    console.log("=".repeat(80));
    console.log(JSON.stringify(response, null, 2));
    console.log("\n" + "=".repeat(80));
    console.log("✅ ADMIN DASHBOARD API - Response prepared successfully");
    console.log("=".repeat(80) + "\n");

    return NextResponse.json(response);
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("❌ ADMIN DASHBOARD API - ERROR OCCURRED");
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
