// app/dashboard/layout.tsx
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
