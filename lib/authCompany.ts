import { jwtVerify } from "jose";
import { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.COMPANY_JWT_SECRET || "your-super-secret-key-change-in-production"
);

export interface CompanyAdminPayload {
  companyId: string;
  companyName: string;
  username: string;
  role: "companyAdmin";
}

export async function requireCompanyAdmin(
  request: NextRequest,
  companyId: string
): Promise<CompanyAdminPayload | null> {
  const token = request.headers.get("authorization")?.split("Bearer ")[1];

  if (!token) {
    console.log("No token provided");
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Verify the token is for the correct company
    if (payload.companyId !== companyId) {
      console.log("Token companyId mismatch");
      return null;
    }

    if (payload.role !== "companyAdmin") {
      console.log("Invalid role");
      return null;
    }

    return payload as unknown as CompanyAdminPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function verifyCompanyToken(
  token: string
): Promise<CompanyAdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as CompanyAdminPayload;
  } catch {
    return null;
  }
}
