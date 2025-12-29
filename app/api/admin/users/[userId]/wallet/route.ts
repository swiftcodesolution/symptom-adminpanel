// app\api\admin\users\[userId]\wallet\route.ts
import { db } from "@/lib/firebaseAdmin.mjs";
import { requireAdmin } from "@/lib/authAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  console.log("=".repeat(80));
  console.log("ADMIN USER WALLET API - REQUEST START");
  console.log("=".repeat(80));
  console.log("Request for userId:", userId);

  const admin = await requireAdmin(request);
  if (!admin) {
    console.error("ADMIN USER WALLET API - Unauthorized access attempt");
    console.log("=".repeat(80));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("\n📡 Fetching wallet data from Firestore...");

    const [insurance, doctors, pharmacies, contacts] = await Promise.all([
      db.collection("insurance").doc(userId).get(),
      db.collection("doctors").where("userId", "==", userId).get(),
      db.collection("pharmacies").where("userId", "==", userId).get(),
      db.collection("personalContacts").where("userId", "==", userId).get(),
    ]);

    console.log("\n✅ Data fetch complete");
    console.log("\n" + "=".repeat(80));
    console.log("📊 WALLET SUMMARY");
    console.log("=".repeat(80));
    console.log("Insurance exists:", insurance.exists);
    if (insurance.exists)
      console.log("Insurance data:", JSON.stringify(insurance.data(), null, 2));
    console.log("Doctors count:", doctors.size);
    console.log("Pharmacies count:", pharmacies.size);
    console.log("Contacts count:", contacts.size);

    const response = {
      insurance: insurance.exists ? insurance.data() : null,
      doctors: doctors.docs.map((d) => ({ id: d.id, ...d.data() })),
      pharmacies: pharmacies.docs.map((d) => ({ id: d.id, ...d.data() })),
      contacts: contacts.docs.map((d) => ({ id: d.id, ...d.data() })),
    };

    console.log("\n" + "=".repeat(80));
    console.log("📤 FINAL RESPONSE OBJECT:");
    console.log("=".repeat(80));
    console.log(JSON.stringify(response, null, 2));
    console.log("\n" + "=".repeat(80));
    console.log(
      "✅ ADMIN USER WALLET API - Response prepared successfully for userId:",
      userId
    );
    console.log("=".repeat(80) + "\n");

    return NextResponse.json(response);
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("❌ ADMIN USER WALLET API - ERROR OCCURRED");
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
