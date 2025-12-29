import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authAdmin";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split("Bearer ")[1];
  if (!token) return NextResponse.json({ admin: false }, { status: 401 });

  const adminUser = await requireAdmin(req);
  if (!adminUser) return NextResponse.json({ admin: false }, { status: 403 });

  return NextResponse.json({ admin: true, uid: adminUser.uid });
}
