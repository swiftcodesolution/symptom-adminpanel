import { db } from "@/lib/firebaseAdmin.mjs";
import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.COMPANY_JWT_SECRET || "your-super-secret-key-change-in-production"
);

export async function POST(request: NextRequest) {
  console.log("=".repeat(80));
  console.log("COMPANY LOGIN API - REQUEST START");
  console.log("=".repeat(80));

  try {
    const { username, password } = await request.json();
    console.log("Login attempt for username:", username);

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Find company by admin username
    console.log("\n📡 Searching for company with admin username...");
    const companiesSnap = await db
      .collection("companies")
      .where("adminCredentials.username", "==", username)
      .limit(1)
      .get();

    if (companiesSnap.empty) {
      console.log("❌ No company found with this username");
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const companyDoc = companiesSnap.docs[0];
    const companyData = companyDoc.data();
    const companyId = companyDoc.id;

    console.log("Found company:", companyData.name);

    // Verify password
    if (companyData.adminCredentials?.password !== password) {
      console.log("❌ Password mismatch");
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Check company status
    if (companyData.status === "suspended") {
      console.log("❌ Company is suspended");
      return NextResponse.json(
        {
          error:
            "This company account has been suspended. Please contact support.",
        },
        { status: 403 }
      );
    }

    if (companyData.status === "pending") {
      console.log("❌ Company is pending activation");
      return NextResponse.json(
        { error: "This company account is pending activation." },
        { status: 403 }
      );
    }

    if (companyData.status === "cancelled") {
      console.log("❌ Company is cancelled");
      return NextResponse.json(
        { error: "This company account has been cancelled." },
        { status: 403 }
      );
    }

    // Generate JWT token (no expiry - until logout)
    const token = await new SignJWT({
      companyId,
      companyName: companyData.name,
      username,
      role: "companyAdmin",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setSubject(companyId)
      .sign(JWT_SECRET);

    console.log("\n✅ Login successful");
    console.log("=".repeat(80));

    return NextResponse.json({
      success: true,
      token,
      companyId,
      companyName: companyData.name,
    });
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("❌ COMPANY LOGIN API - ERROR OCCURRED");
    console.error("Error:", error instanceof Error ? error.message : error);
    console.log("=".repeat(80));

    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
