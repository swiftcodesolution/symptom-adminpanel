"use client";

import { AdminRoute } from "../auth/AdminRoute";
import Sidebar from "./Sidebar";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="lg:pl-64 min-h-screen">
          <div className="lg:hidden h-14" />
          <div className="relative">{children}</div>
        </main>
      </div>
    </AdminRoute>
  );
}
