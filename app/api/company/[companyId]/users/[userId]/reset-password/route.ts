import { db } from "@/lib/firebaseAdmin.mjs";
import { requireCompanyAdmin } from "@/lib/authCompany";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; userId: string }> }
) {
  const { companyId, userId } = await params;

  console.log("=".repeat(80));
  console.log("COMPANY RESET USER PASSWORD API");
  console.log("=".repeat(80));

  const verified = await requireCompanyAdmin(request, companyId);
  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (doc.data()?.companyId !== companyId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await userRef.update({
      password, // In production, hash this!
      passwordResetRequired: true,
      updatedAt: new Date(),
    });

    console.log("Password reset for user:", userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
