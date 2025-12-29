/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/firebaseAdmin.mjs";
import { requireCompanyAdmin } from "@/lib/authCompany";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  console.log("=".repeat(80));
  console.log("COMPANY DASHBOARD API - REQUEST START");
  console.log("=".repeat(80));
  console.log("Request for companyId:", companyId);

  const verified = await requireCompanyAdmin(request, companyId);
  if (!verified) {
    console.error("COMPANY DASHBOARD API - Unauthorized access attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("\n📡 Fetching company dashboard data from Firestore...");

    const [companyDoc, usersSnap] = await Promise.all([
      db.collection("companies").doc(companyId).get(),
      db.collection("users").where("companyId", "==", companyId).get(),
    ]);

    if (!companyDoc.exists) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const company = companyDoc.data()!;
    const users = usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Calculate stats
    const stats = {
      total: users.length,
      active: users.filter((u: any) => u.status === "active").length,
      inactive: users.filter((u: any) => u.status === "inactive").length,
      pending: users.filter((u: any) => u.status === "pending").length,
    };

    const response = {
      company: {
        companyId: companyDoc.id,
        name: company.name || "",
        industry: company.industry || "",
        email: company.email || "",
        phone: company.phone || "",
        address: company.address || "",
        status: company.status || "pending",
        plan: company.activeSubscriptionId || "none",
        userCapacity: company.userCapacity || 0,
        contractStartDate: company.contractStartDate || null,
        contractEndDate: company.contractEndDate || null,
        billingContact: company.billingContact || null,
      },
      stats,
      recentUsers: users
        .sort((a: any, b: any) => {
          const dateA = a.createdAt?._seconds || 0;
          const dateB = b.createdAt?._seconds || 0;
          return dateB - dateA;
        })
        .slice(0, 5),
    };

    console.log("\n✅ Dashboard data fetched successfully");
    console.log("=".repeat(80));

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ COMPANY DASHBOARD API - ERROR:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
