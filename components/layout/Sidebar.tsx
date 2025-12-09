// components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  MessageSquare,
  Pill,
  Wallet,
  ClipboardList,
  AlertTriangle,
  Heart,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { mockUsers, User } from "@/lib/mock-data";

const menuItems = [
  { name: "Overview", href: "", icon: LayoutDashboard },
  { name: "Symptom Chats", href: "/chats", icon: MessageSquare },
  { name: "Medicines", href: "/medicines", icon: Pill },
  { name: "Medical Wallet", href: "/medical-wallet", icon: Wallet },
  { name: "Medical History", href: "/medical-history", icon: ClipboardList },
  { name: "Emergency Logs", href: "/emergency", icon: AlertTriangle },
];

function SidebarContent({
  currentUser,
  userId,
  close,
}: {
  currentUser: User | undefined;
  userId: string;
  close: () => void;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => {
    const fullPath = `/dashboard/${userId}${href}`;
    if (href === "") return pathname === `/dashboard/${userId}`;
    return pathname.startsWith(fullPath);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 shrink-0">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-2 bg-primary/10 rounded-xl"
        >
          <Heart className="w-6 h-6 text-primary" />
        </motion.div>
        <div>
          <h1 className="font-bold text-base">Health Companion</h1>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      <Separator />

      {/* Back + user */}
      <div className="p-4 space-y-3 shrink-0">
        <Link
          href="/dashboard"
          onClick={close}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Users
        </Link>

        {currentUser && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {currentUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div>
                <p className="font-medium text-sm truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase mb-3">
          User Data
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={`/dashboard/${userId}${item.href}`}
              onClick={close}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Bottom */}
      <div className="p-3 space-y-2 shrink-0">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => (window.location.href = "/")}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export default function Sidebar({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentUser = mockUsers.find((u) => u.id === userId);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between bg-background/95 backdrop-blur-sm border-b px-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-sm">
            {currentUser?.name || "Health Companion"}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="lg:hidden fixed top-14 left-0 bottom-0 w-72 bg-card border-r z-40"
      >
        <SidebarContent
          currentUser={currentUser}
          userId={userId}
          close={() => setIsOpen(false)}
        />
      </motion.aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 bottom-0 w-64 bg-card border-r z-30">
        <SidebarContent
          currentUser={currentUser}
          userId={userId}
          close={() => {}}
        />
      </aside>
    </>
  );
}
