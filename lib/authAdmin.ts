// lib\authAdmin.ts
import { auth } from "@/lib/firebaseAdmin.mjs";
import { NextRequest, NextResponse } from "next/server";

export async function requireAdmin(request: NextRequest) {
  const token = request.headers.get("authorization")?.split("Bearer ")[1];
  if (!token) return null;
  try {
    const decoded = await auth.verifyIdToken(token);
    return decoded.admin === true ? decoded : null;
  } catch {
    return null;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
