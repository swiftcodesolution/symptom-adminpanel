import { db } from "@/lib/firebaseAdmin.mjs";
import { requireCompanyAdmin } from "@/lib/authCompany";
import { NextRequest, NextResponse } from "next/server";

// GET - List all users in company
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  console.log("=".repeat(80));
  console.log("COMPANY USERS API - GET REQUEST");
  console.log("=".repeat(80));

  const verified = await requireCompanyAdmin(request, companyId);
  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snap = await db
      .collection("users")
      .where("companyId", "==", companyId)
      .get();

    const users = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Users fetched:", users.length);
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST - Create new user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  console.log("=".repeat(80));
  console.log("COMPANY CREATE USER API - REQUEST");
  console.log("=".repeat(80));

  const verified = await requireCompanyAdmin(request, companyId);
  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Check user capacity
    const [companyDoc, usersSnap] = await Promise.all([
      db.collection("companies").doc(companyId).get(),
      db.collection("users").where("companyId", "==", companyId).get(),
    ]);

    if (!companyDoc.exists) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const company = companyDoc.data()!;
    const currentUserCount = usersSnap.size;
    const userCapacity = company.userCapacity || 0;

    // Check if capacity allows (userCapacity = -1 means unlimited)
    if (userCapacity !== -1 && currentUserCount >= userCapacity) {
      return NextResponse.json(
        {
          error:
            "User capacity limit reached. Please contact your administrator to upgrade.",
        },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.name || !body.email || !body.username || !body.password) {
      return NextResponse.json(
        { error: "Name, email, username, and password are required" },
        { status: 400 }
      );
    }

    // Check for duplicate username within company
    const duplicateSnap = await db
      .collection("users")
      .where("companyId", "==", companyId)
      .where("username", "==", body.username)
      .limit(1)
      .get();

    if (!duplicateSnap.empty) {
      return NextResponse.json(
        { error: "Username already exists in this company" },
        { status: 400 }
      );
    }

    // Create user
    const userData = {
      name: body.name,
      email: body.email,
      username: body.username,
      password: body.password, // In production, hash this!
      phone: body.phone || null,
      employeeId: body.employeeId || null,
      department: body.department || null,
      role: body.role || "employee",
      status: "active", // Users are active by default
      companyId,
      userType: "company",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newUserRef = await db.collection("users").add(userData);

    console.log("User created:", newUserRef.id);
    return NextResponse.json({ id: newUserRef.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
