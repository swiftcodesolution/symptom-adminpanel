// app/dashboard/[userId]/layout.tsx
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ userId: string }>;
}

export default async function UserLayout({ children, params }: LayoutProps) {
  const { userId } = await params;

  return <DashboardLayout userId={userId}>{children}</DashboardLayout>;
}
