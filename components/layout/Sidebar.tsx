// components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  User2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { useAuth } from "@/lib/AuthContext";

interface DashboardStats {
  totalUsers: number;
  totalCompanies: number;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

// Main dashboard menu
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

// User-specific menu - paths are relative to /dashboard/users/[userId]
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
    name: "Emergency Info",
    href: "/emergency",
    icon: AlertTriangle,
  },
];

interface SidebarContentProps {
  isUserView: boolean;
  currentUser: UserInfo | null;
  stats: DashboardStats;
  statsLoading: boolean;
  isActive: (href: string) => boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleSignOut: () => Promise<void>;
  userIdFromPath: string | null;
}

const SidebarContent = ({
  isUserView,
  currentUser,
  stats,
  statsLoading,
  isActive,
  setIsOpen,
  handleSignOut,
  userIdFromPath,
}: SidebarContentProps) => (
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
            href="/dashboard/users"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Users
          </Link>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {currentUser.name
                    ? currentUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "?"}
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
            {statsLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            )}
            <p className="text-xs text-muted-foreground">Total Users</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            {statsLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <p className="text-2xl font-bold">{stats.totalCompanies}</p>
            )}
            <p className="text-xs text-muted-foreground">Companies</p>
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
            const fullHref = `/dashboard/users/${userIdFromPath}${item.href}`;

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
                {item.name === "Companies" && !statsLoading && (
                  <Badge
                    variant={active ? "secondary" : "outline"}
                    className="h-5 px-1.5 text-xs"
                  >
                    {stats.totalCompanies}
                  </Badge>
                )}
                {item.name === "Users" && !statsLoading && (
                  <Badge
                    variant={active ? "secondary" : "outline"}
                    className="h-5 px-1.5 text-xs"
                  >
                    {stats.totalUsers}
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
        onClick={handleSignOut}
      >
        <LogOut className="w-4 h-4 mr-3" />
        Sign Out
      </Button>
    </div>
  </div>
);

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const authFetch = useAuthFetch();

  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCompanies: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [userLoading, setUserLoading] = useState(false);

  // Extract user ID from path: /dashboard/users/[userId]/...
  const userIdMatch = pathname.match(/^\/dashboard\/users\/([^\/]+)/);
  const userIdFromPath = userIdMatch ? userIdMatch[1] : null;
  const isUserView = !!userIdFromPath;

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    if (!token) return;

    try {
      setStatsLoading(true);

      // Fetch companies count
      const companiesRes = await authFetch("/panel/api/admin/companies");
      const companiesData = companiesRes.ok ? await companiesRes.json() : [];

      // Fetch users count (individual users)
      const usersRes = await authFetch("/panel/api/admin/users");
      const usersData = usersRes.ok ? await usersRes.json() : [];

      setStats({
        totalUsers: Array.isArray(usersData) ? usersData.length : 0,
        totalCompanies: Array.isArray(companiesData) ? companiesData.length : 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [token, authFetch]);

  // Fetch current user info when in user view
  const fetchUserInfo = useCallback(async () => {
    if (!token || !userIdFromPath) {
      setCurrentUser(null);
      return;
    }

    try {
      setUserLoading(true);

      const res = await authFetch(`/panel/api/admin/users/${userIdFromPath}`);
      if (res.ok) {
        const userData = await res.json();
        // API returns { profile: { displayName, email, ... }, ... }
        const profile = userData.profile || userData;
        setCurrentUser({
          id: profile.id || userIdFromPath,
          name: profile.displayName || profile.name || "Unknown User",
          email: profile.email || "",
        });
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      setCurrentUser(null);
    } finally {
      setUserLoading(false);
    }
  }, [token, userIdFromPath, authFetch]);

  // Fetch stats on mount and when auth changes
  useEffect(() => {
    if (!authLoading && token) {
      fetchStats();
    }
  }, [authLoading, token, fetchStats]);

  // Fetch user info when userIdFromPath changes
  useEffect(() => {
    if (!authLoading && token && userIdFromPath) {
      fetchUserInfo();
    } else {
      setCurrentUser(null);
    }
  }, [authLoading, token, userIdFromPath, fetchUserInfo]);

  const isActive = (href: string) => {
    if (isUserView) {
      // For user view, check against /dashboard/users/[userId]/...
      if (href === "") {
        return pathname === `/dashboard/users/${userIdFromPath}`;
      }

      const fullPath = `/dashboard/users/${userIdFromPath}${href}`;
      return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
    }

    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    // For /dashboard/users, make sure we don't match when viewing a specific user
    if (href === "/dashboard/users") {
      return pathname === "/dashboard/users";
    }

    return pathname.startsWith(href);
  };

  async function handleSignOut() {
    try {
      await signOut(auth);
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Failed to log out. Please try again.");
    }
  }

  // Show loading placeholder for user info
  const displayUser: UserInfo | null = userLoading
    ? { id: userIdFromPath || "", name: "Loading...", email: "" }
    : currentUser;

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-sm truncate">
            {isUserView && displayUser ? displayUser.name : "Health Companion"}
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
        <SidebarContent
          isUserView={isUserView}
          currentUser={displayUser}
          stats={stats}
          statsLoading={statsLoading}
          isActive={isActive}
          setIsOpen={setIsOpen}
          handleSignOut={handleSignOut}
          userIdFromPath={userIdFromPath}
        />
      </motion.aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 bottom-0 w-64 border-r bg-card z-30 overflow-hidden">
        <SidebarContent
          isUserView={isUserView}
          currentUser={displayUser}
          stats={stats}
          statsLoading={statsLoading}
          isActive={isActive}
          setIsOpen={setIsOpen}
          handleSignOut={handleSignOut}
          userIdFromPath={userIdFromPath}
        />
      </aside>
    </>
  );
}
