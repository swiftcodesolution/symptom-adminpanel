// app\api\admin\users\[userId]\chats\route.ts
import { db } from "@/lib/firebaseAdmin.mjs";
import { requireAdmin } from "@/lib/authAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  console.log("=".repeat(80));
  console.log("ADMIN USER CHATS API - REQUEST START");
  console.log("=".repeat(80));
  console.log("Request for userId:", userId);

  const admin = await requireAdmin(request);
  if (!admin) {
    console.error("ADMIN USER CHATS API - Unauthorized access attempt");
    console.log("=".repeat(80));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  console.log(
    "Filters - Status:",
    status || "none",
    "| Search:",
    search || "none"
  );

  let query = db.collection("chatHistory").where("userId", "==", userId);

  if (status) query = query.where("status", "==", status);
  if (search)
    query = query
      .where("message", ">=", search)
      .where("message", "<=", search + "\uf8ff");

  try {
    console.log("\n📡 Fetching chats from Firestore...");

    const snap = await query.get();

    console.log("\n✅ Data fetch complete");
    console.log("\n" + "=".repeat(80));
    console.log("📊 CHATS SUMMARY");
    console.log("=".repeat(80));
    console.log("Chats count:", snap.size);
    if (snap.size > 0)
      console.log("Sample chat:", JSON.stringify(snap.docs[0].data(), null, 2));

    const chats = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    console.log("\n" + "=".repeat(80));
    console.log("📤 FINAL RESPONSE OBJECT:");
    console.log("=".repeat(80));
    console.log(JSON.stringify(chats, null, 2));
    console.log("\n" + "=".repeat(80));
    console.log(
      "✅ ADMIN USER CHATS API - Response prepared successfully for userId:",
      userId
    );
    console.log("=".repeat(80) + "\n");

    return NextResponse.json(chats);
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("❌ ADMIN USER CHATS API - ERROR OCCURRED");
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
