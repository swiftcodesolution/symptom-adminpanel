// app\api\admin\users\[userId]\reset-password\route.ts
import { auth } from "@/lib/firebaseAdmin.mjs";
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

  const admin = await requireAdmin(request);
  if (!admin) {
    console.error("ADMIN RESET PASSWORD API - Unauthorized access attempt");
    console.log("=".repeat(80));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("\n📡 Generating password reset link...");

    const link = await auth.generatePasswordResetLink(userId);

    console.log("\n✅ Reset link generated");
    console.log("\n" + "=".repeat(80));
    console.log("📊 RESET SUMMARY");
    console.log("=".repeat(80));
    console.log("Reset link:", link);

    console.log("\n" + "=".repeat(80));
    console.log("📤 FINAL RESPONSE OBJECT:");
    console.log("=".repeat(80));
    console.log(JSON.stringify({ resetLink: link }, null, 2));
    console.log("\n" + "=".repeat(80));
    console.log(
      "✅ ADMIN RESET PASSWORD API - Reset initiated successfully for userId:",
      userId
    );
    console.log("=".repeat(80) + "\n");

    return NextResponse.json({ resetLink: link });
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("❌ ADMIN RESET PASSWORD API - ERROR OCCURRED");
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
