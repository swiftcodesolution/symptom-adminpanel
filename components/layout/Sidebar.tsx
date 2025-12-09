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
  User,
  CreditCard,
  Building2,
  Users,
  User2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { mockUsers, mockCompanies } from "@/lib/mock-data";
import { getSubscriptionStats } from "@/lib/utils";

interface SidebarProps {
  userId?: string;
}

// Main dashboard menu (when NOT viewing a specific user)
const mainMenuItems = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Users",
    href: "/dashboard/users",
    icon: User2,
  },
  {
    name: "Subscriptions",
    href: "/dashboard/subscriptions",
    icon: CreditCard,
  },
  {
    name: "Companies",
    href: "/dashboard/companies",
    icon: Building2,
  },
];

// User-specific menu (when viewing a specific user)
const userMenuItems = [
  {
    name: "Overview",
    href: "",
    icon: User,
  },
  {
    name: "Symptom Chats",
    href: "/chats",
    icon: MessageSquare,
  },
  {
    name: "Medicines",
    href: "/medicines",
    icon: Pill,
  },
  {
    name: "Medical Wallet",
    href: "/medical-wallet",
    icon: Wallet,
  },
  {
    name: "Medical History",
    href: "/medical-history",
    icon: ClipboardList,
  },
  {
    name: "Emergency Logs",
    href: "/emergency",
    icon: AlertTriangle,
  },
];

export default function Sidebar({ userId }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isUserView = !!userId;
  const currentUser = isUserView
    ? mockUsers.find((u) => u.id === userId)
    : null;

  const stats = getSubscriptionStats();

  const isActive = (href: string) => {
    if (isUserView) {
      const fullPath = `/dashboard/${userId}${href}`;
      if (href === "") {
        return pathname === `/dashboard/${userId}`;
      }
      return pathname.startsWith(fullPath);
    }
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 shrink-0">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="p-2 bg-primary/10 rounded-xl"
        >
          <Heart className="w-6 h-6 text-primary" />
        </motion.div>
        <div>
          <h1 className="font-bold text-base text-foreground">
            Health Companion
          </h1>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      <Separator className="shrink-0" />

      {/* Context: User Info or Stats */}
      <div className="p-4 shrink-0">
        {isUserView && currentUser ? (
          <div className="space-y-3">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
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
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">
                {stats.totalB2CSubscriptions}
              </p>
              <p className="text-xs text-muted-foreground">B2C Users</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{stats.activeCompanies}</p>
              <p className="text-xs text-muted-foreground">B2B Companies</p>
            </div>
          </div>
        )}
      </div>

      <Separator className="shrink-0" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto min-h-0">
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {isUserView ? "User Data" : "Menu"}
        </p>

        {isUserView
          ? userMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const fullHref = `/dashboard/${userId}${item.href}`;

              return (
                <Link
                  key={item.href}
                  href={fullHref}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })
          : mainMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  {item.name === "Companies" && (
                    <Badge
                      variant={active ? "secondary" : "outline"}
                      className="h-5 px-1.5 text-xs"
                    >
                      {mockCompanies.length}
                    </Badge>
                  )}
                </Link>
              );
            })}
      </nav>

      <Separator className="shrink-0" />

      {/* Footer */}
      <div className="p-3 space-y-2 shrink-0">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-sm text-muted-foreground hover:text-foreground"
          onClick={() => (window.location.href = "/")}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-sm truncate">
            {isUserView && currentUser ? currentUser.name : "Health Companion"}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
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

      {/* Mobile Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="lg:hidden fixed top-14 left-0 bottom-0 w-72 bg-card border-r z-40 overflow-hidden"
      >
        <SidebarContent />
      </motion.aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 bottom-0 w-64 border-r bg-card z-30 overflow-hidden">
        <SidebarContent />
      </aside>
    </>
  );
}
