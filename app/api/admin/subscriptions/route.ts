// app\api\admin\subscriptions\route.ts
import { db } from "@/lib/firebaseAdmin.mjs";
import { requireAdmin } from "@/lib/authAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("=".repeat(80));
  console.log("ADMIN SUBSCRIPTIONS API - REQUEST START");
  console.log("=".repeat(80));

  const admin = await requireAdmin(request);
  if (!admin) {
    console.error("ADMIN SUBSCRIPTIONS API - Unauthorized access attempt");
    console.log("=".repeat(80));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("\n📡 Fetching subscriptions data from Firestore...");

    const [plansSnap, companiesSnap, usersSnap] = await Promise.all([
      db.collection("subscriptions").get(),
      db.collection("companies").get(),
      db.collection("users").get(),
    ]);

    console.log("\n✅ Data fetch complete");
    console.log("\n" + "=".repeat(80));
    console.log("📊 SUBSCRIPTIONS SUMMARY");
    console.log("=".repeat(80));
    console.log("Plans count:", plansSnap.size);
    console.log("Companies count:", companiesSnap.size);
    console.log("Users count:", usersSnap.size);

    const plans = plansSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const b2bCompanies = companiesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const b2cUsers = usersSnap.docs
      .map(
        (doc) =>
          ({ id: doc.id, ...doc.data() } as {
            id: string;
            userType?: string;
            activeSubscriptionId?: string;
          })
      )
      .filter((u) => u.userType === "individual" && u.activeSubscriptionId);

    // Placeholder metrics
    const revenue = 0;
    const trialUsers = 0;
    const churnRate = 0;

    const response = {
      plans,
      b2cSubscribers: b2cUsers,
      b2bCompanies,
      revenue,
      trialUsers,
      churnRate,
    };

    console.log("\n" + "=".repeat(80));
    console.log("📤 FINAL RESPONSE OBJECT:");
    console.log("=".repeat(80));
    console.log(JSON.stringify(response, null, 2));
    console.log("\n" + "=".repeat(80));
    console.log("✅ ADMIN SUBSCRIPTIONS API - Response prepared successfully");
    console.log("=".repeat(80) + "\n");

    return NextResponse.json(response);
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("❌ ADMIN SUBSCRIPTIONS API - ERROR OCCURRED");
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
