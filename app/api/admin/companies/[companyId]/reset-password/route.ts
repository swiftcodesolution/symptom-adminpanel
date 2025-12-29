import { db } from "@/lib/firebaseAdmin.mjs";
import { requireAdmin } from "@/lib/authAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  console.log("=".repeat(80));
  console.log("ADMIN RESET COMPANY PASSWORD API - REQUEST START");
  console.log("=".repeat(80));

  const { companyId } = await params;

  console.log("Request for companyId:", companyId);

  const admin = await requireAdmin(request);
  if (!admin) {
    console.error("ADMIN RESET PASSWORD API - Unauthorized access attempt");
    console.log("=".repeat(80));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!companyId) {
    console.error("ADMIN RESET PASSWORD API - Missing companyId in params");
    console.log("=".repeat(80));
    return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { password } = body;

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    console.log("\n📡 Updating company admin password in Firestore...");

    const companyRef = db.collection("companies").doc(companyId);
    const doc = await companyRef.get();

    if (!doc.exists) {
      console.error("Company not found");
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Update the adminCredentials.password field
    await companyRef.update({
      "adminCredentials.password": password,
      updatedAt: new Date(),
    });

    console.log("\n✅ Password reset complete");
    console.log("=".repeat(80) + "\n");

    return NextResponse.json({ success: true });
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
