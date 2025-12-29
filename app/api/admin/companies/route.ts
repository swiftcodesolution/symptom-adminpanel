// app/panel/api/admin/companies/route.ts
import { db } from "@/lib/firebaseAdmin.mjs";
import { requireAdmin } from "@/lib/authAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("=".repeat(80));
  console.log("ADMIN COMPANIES LIST API - REQUEST START");
  console.log("=".repeat(80));

  const admin = await requireAdmin(request);
  if (!admin) {
    console.error("ADMIN COMPANIES LIST API - Unauthorized access attempt");
    console.log("=".repeat(80));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("\n📡 Fetching companies from Firestore...");

    const snap = await db.collection("companies").get();

    console.log("\n✅ Data fetch complete");
    console.log("\n" + "=".repeat(80));
    console.log("📊 COMPANIES SUMMARY");
    console.log("=".repeat(80));
    console.log("Companies count:", snap.size);
    if (snap.size > 0)
      console.log(
        "Sample company:",
        JSON.stringify(snap.docs[0].data(), null, 2)
      );

    const companies = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        companyId: doc.id,
        name: data.name || "",
        industry: data.industry || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        status: data.status || "pending",
        plan: data.activeSubscriptionId || "none",
        userCapacity: data.userCapacity || 0,
        contractStartDate: data.contractStartDate,
        contractEndDate: data.contractEndDate,
        // Additional fields useful for list view
        billingContact: data.billingContact || null,
        createdAt: data.createdAt,
      };
    });

    console.log("\n" + "=".repeat(80));
    console.log("📤 FINAL RESPONSE OBJECT:");
    console.log("=".repeat(80));
    console.log(JSON.stringify(companies, null, 2));
    console.log("\n" + "=".repeat(80));
    console.log("✅ ADMIN COMPANIES LIST API - Response prepared successfully");
    console.log("=".repeat(80) + "\n");

    return NextResponse.json(companies);
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("❌ ADMIN COMPANIES LIST API - ERROR OCCURRED");
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

export async function POST(request: NextRequest) {
  console.log("=".repeat(80));
  console.log("ADMIN CREATE COMPANY API - REQUEST START");
  console.log("=".repeat(80));

  const admin = await requireAdmin(request);
  if (!admin) {
    console.error("ADMIN CREATE COMPANY API - Unauthorized access attempt");
    console.log("=".repeat(80));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("Incoming body:", JSON.stringify(body, null, 2));

    if (!body.name) {
      console.error("Validation failed: Company name is required");
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    console.log("\n📡 Creating new company in Firestore...");

    const newCompanyRef = await db.collection("companies").add({
      ...body,
      createdAt: new Date(),
      status: body.status || "pending",
    });

    console.log("\n✅ Company creation complete");
    console.log("New company ID:", newCompanyRef.id);

    console.log("\n" + "=".repeat(80));
    console.log("📤 FINAL RESPONSE OBJECT:");
    console.log("=".repeat(80));
    console.log(JSON.stringify({ companyId: newCompanyRef.id }, null, 2));
    console.log("\n" + "=".repeat(80));
    console.log("✅ ADMIN CREATE COMPANY API - Company created successfully");
    console.log("=".repeat(80) + "\n");

    return NextResponse.json({ companyId: newCompanyRef.id }, { status: 201 });
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("❌ ADMIN CREATE COMPANY API - ERROR OCCURRED");
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
