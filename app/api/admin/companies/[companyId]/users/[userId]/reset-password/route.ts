import { db } from "@/lib/firebaseAdmin.mjs";
import { requireAdmin } from "@/lib/authAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; userId: string }> }
) {
  const { companyId, userId } = await params;

  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { password } = await request.json();

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    if (userData?.companyId !== companyId) {
      return NextResponse.json(
        { error: "User not in this company" },
        { status: 403 }
      );
    }

    // TODO: Hash password before storing!
    // import bcrypt from 'bcrypt';
    // const hashedPassword = await bcrypt.hash(password, 12);

    await userRef.update({
      password: password, // ⚠️ Should be hashed!
      updatedAt: new Date(),
      passwordResetAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
