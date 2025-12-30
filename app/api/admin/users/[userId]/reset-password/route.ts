import { auth, db } from "@/lib/firebaseAdmin.mjs";
import { requireAdmin } from "@/lib/authAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  console.log("=".repeat(80));
  console.log("ADMIN RESET PASSWORD API - REQUEST START");
  console.log("=".repeat(80));
  console.log("Request for userId:", userId);

  const adminUser = await requireAdmin(request);
  if (!adminUser) {
    console.error("ADMIN RESET PASSWORD API - Unauthorized access attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { password } = body;

    // Validate password
    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Get user info from Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.getUser(userId);
    } catch (error) {
      console.error("User lookup error:", error);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userEmail = userRecord.email;
    const userName = userRecord.displayName || "User";

    console.log(`\n📡 Resetting password for: ${userName} (${userEmail})`);

    // Update password in Firebase Auth
    await auth.updateUser(userId, {
      password: password,
    });

    console.log("✅ Password updated in Firebase Auth");

    // Log the password change in Firestore
    try {
      const userDocRef = db.collection("users").doc(userId);
      const userDoc = await userDocRef.get();

      if (userDoc.exists) {
        await userDocRef.update({
          passwordChangedAt: new Date(),
          passwordChangedBy: "admin",
          updatedAt: new Date(),
        });
        console.log("✅ Password change logged in Firestore");
      }
    } catch (firestoreError) {
      console.warn(
        "⚠️ Could not log password change to Firestore:",
        firestoreError
      );
    }

    console.log("\n" + "=".repeat(80));
    console.log("✅ ADMIN RESET PASSWORD API - COMPLETED");
    console.log("=".repeat(80) + "\n");

    return NextResponse.json({
      success: true,
      userName,
      userEmail,
      message:
        "Password reset successfully. Please share the new password with the user.",
    });
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("❌ ADMIN RESET PASSWORD API - ERROR OCCURRED");
    console.error("Error:", error instanceof Error ? error.message : error);
    console.log("=".repeat(80) + "\n");

    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
