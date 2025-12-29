import { db } from "@/lib/firebaseAdmin.mjs";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const segments = url.pathname.split("/");
    const userId = segments[segments.length - 1];

    console.log("=".repeat(80));
    console.log("MEDICAL PROFILE API - REQUEST START");
    console.log("=".repeat(80));
    console.log("Medical Profile API - Request received for userId:", userId);

    if (!userId) {
      console.error("Medical Profile API - No userId provided");
      console.log("=".repeat(80));
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    console.log("\n📡 Medical Profile API - Fetching data from Firestore...");

    const [
      userSnap,
      personalDetailsSnaps,
      insuranceSnaps,
      preferencesSnap,

      appointmentsSnap,
      chatSnap,
      doctorsSnap,
      emergencySnap,
      reportsSnap,
      medicinesSnap,
      contactsSnap,
      pharmaciesSnap,
    ] = await Promise.all([
      db.collection("users").doc(userId).get(),
      db.collection("personalDetails").where("userId", "==", userId).get(),
      db.collection("insurance").where("userId", "==", userId).get(),
      db.collection("userPreferences").doc(userId).get(),

      db.collection("appointments").where("userId", "==", userId).get(),
      db.collection("chatHistory").where("userId", "==", userId).get(),
      db.collection("doctors").where("userId", "==", userId).get(),
      db.collection("emergencyContacts").where("userId", "==", userId).get(),
      db.collection("medicalReports").where("userId", "==", userId).get(),
      db.collection("medicines").where("userId", "==", userId).get(),
      db.collection("personalContacts").where("userId", "==", userId).get(),
      db.collection("pharmacies").where("userId", "==", userId).get(),
    ]);

    console.log("\n✅ Medical Profile API - Data fetch complete");
    console.log("\n" + "=".repeat(80));
    console.log("📊 DATA SUMMARY");
    console.log("=".repeat(80));

    // User data
    console.log("\n👤 USER DATA:");
    console.log("   - Exists:", userSnap.exists);
    if (userSnap.exists) {
      const userData = userSnap.data();
      console.log("   - Raw data:", JSON.stringify(userData, null, 2));
      console.log("   - Fields:", Object.keys(userData || {}).join(", "));
    }

    if (!userSnap.exists) {
      console.error(
        "\n❌ Medical Profile API - User not found for userId:",
        userId
      );
      console.log("=".repeat(80));
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Personal Details
    console.log("\n📋 PERSONAL DETAILS:");
    console.log("   - Count:", personalDetailsSnaps.size);
    if (personalDetailsSnaps.size > 0) {
      console.log(
        "   - Data:",
        JSON.stringify(personalDetailsSnaps.docs[0].data(), null, 2)
      );
    }

    // Insurance
    console.log("\n🛡️  INSURANCE:");
    console.log("   - Count:", insuranceSnaps.size);
    if (insuranceSnaps.size > 0) {
      insuranceSnaps.docs.forEach((doc, idx) => {
        console.log(
          `   - Insurance ${idx + 1}:`,
          JSON.stringify(doc.data(), null, 2)
        );
      });
    }

    // User Preferences
    console.log("\n⚙️  USER PREFERENCES:");
    console.log("   - Exists:", preferencesSnap.exists);
    if (preferencesSnap.exists) {
      console.log(
        "   - Data:",
        JSON.stringify(preferencesSnap.data(), null, 2)
      );
    }

    // Collections
    console.log("\n📦 COLLECTIONS:");
    console.log("   - Appointments:", appointmentsSnap.size);
    if (appointmentsSnap.size > 0) {
      console.log(
        "     Sample:",
        JSON.stringify(appointmentsSnap.docs[0].data(), null, 2)
      );
    }

    console.log("   - Chat History:", chatSnap.size);
    if (chatSnap.size > 0) {
      console.log(
        "     Sample:",
        JSON.stringify(chatSnap.docs[0].data(), null, 2)
      );
    }

    console.log("   - Doctors:", doctorsSnap.size);
    if (doctorsSnap.size > 0) {
      console.log(
        "     Data:",
        JSON.stringify(
          doctorsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
          null,
          2
        )
      );
    }

    console.log("   - Emergency Contacts:", emergencySnap.size);
    if (emergencySnap.size > 0) {
      console.log(
        "     Data:",
        JSON.stringify(
          emergencySnap.docs.map((d) => ({ id: d.id, ...d.data() })),
          null,
          2
        )
      );
    }

    console.log("   - Medical Reports:", reportsSnap.size);
    if (reportsSnap.size > 0) {
      console.log(
        "     Sample:",
        JSON.stringify(reportsSnap.docs[0].data(), null, 2)
      );
    }

    console.log("   - Medicines:", medicinesSnap.size);
    if (medicinesSnap.size > 0) {
      console.log(
        "     Data:",
        JSON.stringify(
          medicinesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
          null,
          2
        )
      );
    }

    console.log("   - Personal Contacts:", contactsSnap.size);
    if (contactsSnap.size > 0) {
      console.log(
        "     Data:",
        JSON.stringify(
          contactsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
          null,
          2
        )
      );
    }

    console.log("   - Pharmacies:", pharmaciesSnap.size);
    if (pharmaciesSnap.size > 0) {
      console.log(
        "     Data:",
        JSON.stringify(
          pharmaciesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
          null,
          2
        )
      );
    }

    const response = {
      user: userSnap.data(),
      personalDetails:
        personalDetailsSnaps.size > 0
          ? personalDetailsSnaps.docs[0].data()
          : null,
      insurance: insuranceSnaps.docs.map((d) => ({ id: d.id, ...d.data() })),
      userPreferences: preferencesSnap.exists ? preferencesSnap.data() : null,

      appointments: appointmentsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })),
      chatHistory: chatSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      doctors: doctorsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      emergencyContacts: emergencySnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })),
      medicalReports: reportsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      medicines: medicinesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      personalContacts: contactsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })),
      pharmacies: pharmaciesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    };

    console.log("\n" + "=".repeat(80));
    console.log("📤 FINAL RESPONSE OBJECT:");
    console.log("=".repeat(80));
    console.log(JSON.stringify(response, null, 2));

    console.log("\n" + "=".repeat(80));
    console.log(
      "✅ Medical Profile API - Response prepared successfully for userId:",
      userId
    );
    console.log("=".repeat(80) + "\n");

    return NextResponse.json(response);
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("❌ MEDICAL PROFILE API - ERROR OCCURRED");
    console.log("=".repeat(80));
    console.error(
      "Error name:",
      error instanceof Error ? error.name : "Unknown"
    );
    console.error(
      "Error message:",
      error instanceof Error ? error.message : error
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    console.log("=".repeat(80) + "\n");

    return NextResponse.json(
      { error: "Failed to fetch medical profile" },
      { status: 500 }
    );
  }
}
