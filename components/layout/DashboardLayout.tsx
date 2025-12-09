// components/layout/DashboardLayout.tsx
"use client";

import Sidebar from "./Sidebar";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar now handles its own state */}
      <Sidebar />
      <main className="lg:pl-64 min-h-screen">
        {/* Mobile header spacer */}
        <div className="lg:hidden h-14" />
        <div className="relative">{children}</div>
      </main>
    </div>
  );
}
