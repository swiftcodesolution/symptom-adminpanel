import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const segments = url.pathname.split("/");
    const userId = segments[segments.length - 1];

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const [
      userSnap,
      personalDetailsSnap,
      insuranceSnap,
      preferencesSnap,

      appointmentsSnap,
      chatSnap,
      doctorsSnap,
      emergencySnap,
      reportsSnap,
      medicinesSnap,
      contactsSnap,
      pharmaciesSnap
    ] = await Promise.all([
      db.collection("users").doc(userId).get(),
      db.collection("personalDetails").doc(userId).get(),
      db.collection("insurance").doc(userId).get(),
      db.collection("userPreferences").doc(userId).get(),

      db.collection("appointments").where("userId", "==", userId).get(),
      db.collection("chatHistory").where("userId", "==", userId).get(),
      db.collection("doctors").where("userId", "==", userId).get(),
      db.collection("emergencyContacts").where("userId", "==", userId).get(),
      db.collection("medicalReports").where("userId", "==", userId).get(),
      db.collection("medicines").where("userId", "==", userId).get(),
      db.collection("personalContacts").where("userId", "==", userId).get(),
      db.collection("pharmacies").where("userId", "==", userId).get()
    ]);

    if (!userSnap.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const response = {
      user: userSnap.data(),
      personalDetails: personalDetailsSnap.exists ? personalDetailsSnap.data() : null,
      insurance: insuranceSnap.exists ? insuranceSnap.data() : null,
      userPreferences: preferencesSnap.exists ? preferencesSnap.data() : null,

      appointments: appointmentsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      chatHistory: chatSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      doctors: doctorsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      emergencyContacts: emergencySnap.docs.map(d => ({ id: d.id, ...d.data() })),
      medicalReports: reportsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      medicines: medicinesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      personalContacts: contactsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      pharmacies: pharmaciesSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Medical profile API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch medical profile" },
      { status: 500 }
    );
  }
}
