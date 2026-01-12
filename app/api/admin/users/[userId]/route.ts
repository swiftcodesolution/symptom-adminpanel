// app/panel/api/admin/users/[userId]/route.ts
import { db, auth } from "@/lib/firebaseAdmin.mjs";
import { requireAdmin } from "@/lib/authAdmin";
import { NextRequest, NextResponse } from "next/server";

/*
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params; // ✅ Await params

  console.log("=".repeat(80));
  console.log("ADMIN USER DETAILS API - REQUEST START");
  console.log("=".repeat(80));
  console.log("Request for userId:", userId);

  const admin = await requireAdmin(request);
  if (!admin) {
    console.error("ADMIN USER DETAILS API - Unauthorized access attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("\n📡 Fetching user details from Firestore...");

    const [
      userDoc,
      personalDetails,
      insurance,
      preferences,
      medicines,
      reports,
      emergency,
      doctors,
      pharmacies,
      contacts,
    ] = await Promise.all([
      db.collection("users").doc(userId).get(),
      db.collection("personalDetails").doc(userId).get(),
      db.collection("insurance").doc(userId).get(),
      db.collection("userPreferences").doc(userId).get(),
      db.collection("medicines").where("userId", "==", userId).get(),
      db.collection("medicalReports").where("userId", "==", userId).get(),
      db.collection("emergencyContacts").where("userId", "==", userId).get(),
      db.collection("doctors").where("userId", "==", userId).get(),
      db.collection("pharmacies").where("userId", "==", userId).get(),
      db.collection("personalContacts").where("userId", "==", userId).get(),
    ]);

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const response = {
      profile: { id: userDoc.id, ...userDoc.data() },
      personalDetails: personalDetails.exists ? personalDetails.data() : null,
      insurance: insurance.exists ? insurance.data() : null,
      preferences: preferences.exists ? preferences.data() : null,
      medicines: medicines.docs.map((d) => ({ id: d.id, ...d.data() })),
      medicalReports: reports.docs.map((d) => ({ id: d.id, ...d.data() })),
      emergencyContacts: emergency.docs.map((d) => ({ id: d.id, ...d.data() })),
      doctors: doctors.docs.map((d) => ({ id: d.id, ...d.data() })),
      pharmacies: pharmacies.docs.map((d) => ({ id: d.id, ...d.data() })),
      personalContacts: contacts.docs.map((d) => ({ id: d.id, ...d.data() })),
    };

    console.log("✅ User details fetched successfully");
    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
*/

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  console.log("=".repeat(80));
  console.log("ADMIN USER DETAILS API - REQUEST START");
  console.log("=".repeat(80));
  console.log("Request for userId:", userId);

  const admin = await requireAdmin(request);
  if (!admin) {
    console.error("ADMIN USER DETAILS API - Unauthorized access attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("\n📡 Fetching user details from Firestore...");

    const [
      userDoc,
      personalDetails,
      insurance, // Changed: now fetching as collection query
      preferences,
      medicines,
      reports,
      emergency,
      doctors,
      pharmacies,
      contacts,
    ] = await Promise.all([
      db.collection("users").doc(userId).get(),
      db.collection("personalDetails").doc(userId).get(),
      db.collection("insurance").where("userId", "==", userId).get(), // FIXED: Query instead of doc
      db.collection("userPreferences").doc(userId).get(),
      db.collection("medicines").where("userId", "==", userId).get(),
      db.collection("medicalReports").where("userId", "==", userId).get(),
      db.collection("emergencyContacts").where("userId", "==", userId).get(),
      db.collection("doctors").where("userId", "==", userId).get(),
      db.collection("pharmacies").where("userId", "==", userId).get(),
      db.collection("personalContacts").where("userId", "==", userId).get(),
    ]);

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const response = {
      profile: { id: userDoc.id, ...userDoc.data() },
      personalDetails: personalDetails.exists ? personalDetails.data() : null,
      insurance: insurance.docs.map((d) => ({ id: d.id, ...d.data() })),
      preferences: preferences.exists ? preferences.data() : null,
      medicines: medicines.docs.map((d) => ({ id: d.id, ...d.data() })),
      medicalReports: reports.docs.map((d) => ({ id: d.id, ...d.data() })),
      emergencyContacts: emergency.docs.map((d) => ({ id: d.id, ...d.data() })),
      doctors: doctors.docs.map((d) => ({ id: d.id, ...d.data() })),
      pharmacies: pharmacies.docs.map((d) => ({ id: d.id, ...d.data() })),
      personalContacts: contacts.docs.map((d) => ({ id: d.id, ...d.data() })),
      subscription: userDoc.data()?.subscription || null,
    };

    console.log("✅ User details fetched successfully");
    console.log("📋 Insurance records found:", insurance.docs.length); // Debug log
    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params; // ✅ Await params

  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    await db.collection("users").doc(userId).update(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params; // ✅ Await params

  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete user from Firestore
    await db.collection("users").doc(userId).delete();

    // Try to delete from Firebase Auth (may fail if user doesn't exist there)
    try {
      await auth.deleteUser(userId);
    } catch (authError) {
      console.log(
        "Note: User not found in Firebase Auth or already deleted",
        authError
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
