// app/panel/api/admin/companies/[companyId]/route.ts
import { db } from "@/lib/firebaseAdmin.mjs";
import { requireAdmin } from "@/lib/authAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  console.log("=".repeat(80));
  console.log("ADMIN COMPANY DETAIL API - REQUEST START");
  console.log("=".repeat(80));

  // ✅ Await params first before accessing properties
  const { companyId } = await params;

  console.log("Request for companyId:", companyId);

  const admin = await requireAdmin(request);
  if (!admin) {
    console.error("ADMIN COMPANY DETAIL API - Unauthorized access attempt");
    console.log("=".repeat(80));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!companyId) {
    console.error("ADMIN COMPANY DETAIL API - Missing companyId in params");
    console.log("=".repeat(80));
    return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
  }

  try {
    console.log("\n📡 Fetching company detail from Firestore...");

    const [companyDoc, usersSnap] = await Promise.all([
      db.collection("companies").doc(companyId).get(),
      db.collection("users").where("companyId", "==", companyId).get(),
    ]);

    console.log("\n✅ Data fetch complete");
    console.log("\n" + "=".repeat(80));
    console.log("📊 COMPANY SUMMARY");
    console.log("=".repeat(80));
    console.log("Company exists:", companyDoc.exists);
    if (companyDoc.exists)
      console.log("Company data:", JSON.stringify(companyDoc.data(), null, 2));
    console.log("Users count:", usersSnap.size);

    if (!companyDoc.exists) {
      console.error(
        "ADMIN COMPANY DETAIL API - Company not found for companyId:",
        companyId
      );
      console.log("=".repeat(80));
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data = companyDoc.data()!;
    const response = {
      ...data,
      companyId: companyDoc.id,
      userCount: usersSnap.size,
    };

    console.log("\n" + "=".repeat(80));
    console.log("📤 FINAL RESPONSE OBJECT:");
    console.log("=".repeat(80));
    console.log(JSON.stringify(response, null, 2));
    console.log("\n" + "=".repeat(80));
    console.log(
      "✅ ADMIN COMPANY DETAIL API - Response prepared successfully for companyId:",
      companyId
    );
    console.log("=".repeat(80) + "\n");

    return NextResponse.json(response);
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("❌ ADMIN COMPANY DETAIL API - ERROR OCCURRED");
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  console.log("=".repeat(80));
  console.log("ADMIN UPDATE COMPANY API - REQUEST START");
  console.log("=".repeat(80));

  // ✅ Await params first
  const { companyId } = await params;

  console.log("Request for companyId:", companyId);

  const admin = await requireAdmin(request);
  if (!admin) {
    console.error("ADMIN UPDATE COMPANY API - Unauthorized access attempt");
    console.log("=".repeat(80));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!companyId) {
    return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    console.log("Incoming update body:", JSON.stringify(body, null, 2));

    const companyRef = db.collection("companies").doc(companyId);
    const doc = await companyRef.get();

    if (!doc.exists) {
      console.error("Company not found for update");
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await companyRef.update({
      ...body,
      updatedAt: new Date(),
    });

    console.log("\n✅ Company updated successfully");
    console.log("\n" + "=".repeat(80));
    console.log("📤 FINAL RESPONSE OBJECT:");
    console.log("=".repeat(80));
    console.log(JSON.stringify({ success: true }, null, 2));
    console.log("=".repeat(80) + "\n");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("❌ ADMIN UPDATE COMPANY API - ERROR OCCURRED");
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  console.log("=".repeat(80));
  console.log("ADMIN DELETE COMPANY API - REQUEST START");
  console.log("=".repeat(80));

  // ✅ Await params first
  const { companyId } = await params;

  console.log("Request for companyId:", companyId);

  const admin = await requireAdmin(request);
  if (!admin) {
    console.error("ADMIN DELETE COMPANY API - Unauthorized access attempt");
    console.log("=".repeat(80));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!companyId) {
    return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
  }

  try {
    const companyRef = db.collection("companies").doc(companyId);
    const doc = await companyRef.get();

    if (!doc.exists) {
      console.error("Company not found for deletion");
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const usersSnap = await db
      .collection("users")
      .where("companyId", "==", companyId)
      .get();

    if (!usersSnap.empty) {
      console.error("Cannot delete company with existing users");
      return NextResponse.json(
        { error: "Cannot delete company with existing users" },
        { status: 400 }
      );
    }

    await companyRef.delete();

    console.log("\n✅ Company deleted successfully");
    console.log("\n" + "=".repeat(80));
    console.log("📤 FINAL RESPONSE OBJECT:");
    console.log("=".repeat(80));
    console.log(JSON.stringify({ success: true }, null, 2));
    console.log("=".repeat(80) + "\n");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("❌ ADMIN DELETE COMPANY API - ERROR OCCURRED");
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
