// app/dashboard/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users,
  Building2,
  CreditCard,
  TrendingUp,
  Activity,
  RefreshCw,
  Heart,
  ArrowRight,
  Clock,
  UserCheck,
  UserPlus,
  Shield,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { parseFirestoreDate, getRelativeTime } from "@/lib/utils";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  ongoingChats: number;
  activeMedicines: number;
  sosEvents: number;
}

interface SubscriptionData {
  plans: Array<{
    id: string;
    name?: string;
    price?: number;
    [key: string]: unknown;
  }>;
  b2cSubscribers: Array<{
    id: string;
    [key: string]: unknown;
  }>;
  b2bCompanies: Array<{
    id: string;
    name?: string;
    status?: string;
    [key: string]: unknown;
  }>;
  revenue: number;
  trialUsers: number;
  churnRate: number;
}

interface UserProfile {
  id: string;
  displayName?: string;
  email?: string;
  photoURL?: string | null;
  provider?: string;
  createdAt?: { _seconds: number; _nanoseconds: number } | string;
  lastLoginAt?: { _seconds: number; _nanoseconds: number } | string;
}

interface Company {
  id: string;
  name?: string;
  email?: string;
  status?: string;
  employeeCount?: number;
  createdAt?: { _seconds: number; _nanoseconds: number } | string;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  const authFetch = useAuthFetch();

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionData | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);

      const [dashboardRes, subscriptionsRes, usersRes, companiesRes] =
        await Promise.all([
          authFetch("/panel/api/admin/dashboard"),
          authFetch("/panel/api/admin/subscriptions"),
          authFetch("/panel/api/admin/users"),
          authFetch("/panel/api/admin/companies"),
        ]);

      if (dashboardRes.ok) {
        const data = await dashboardRes.json();
        setDashboardStats(data);
      }

      if (subscriptionsRes.ok) {
        const data = await subscriptionsRes.json();
        setSubscriptionData(data);
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(Array.isArray(data) ? data : []);
      }

      if (companiesRes.ok) {
        const data = await companiesRes.json();
        setCompanies(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    }
  }, [authFetch]);

  useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      await fetchData();
      setLoading(false);
    }
    initialFetch();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  // Calculate derived stats
  const totalUsers = dashboardStats?.totalUsers || users.length;
  const totalCompanies =
    subscriptionData?.b2bCompanies?.length || companies.length;
  const activeCompanies = companies.filter((c) => c.status === "active").length;
  // const ongoingChats = dashboardStats?.ongoingChats || 0;
  // const activeMedicines = dashboardStats?.activeMedicines || 0;
  // const sosEvents = dashboardStats?.sosEvents || 0;

  // Get recent users (last 5, sorted by creation date)
  const recentUsers = [...users]
    .sort((a, b) => {
      const dateA = parseFirestoreDate(a.createdAt);
      const dateB = parseFirestoreDate(b.createdAt);
      if (!dateA || !dateB) return 0;
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

  // Get new users this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const newUsersThisWeek = users.filter((u) => {
    const createdAt = parseFirestoreDate(u.createdAt);
    return createdAt && createdAt > oneWeekAgo;
  }).length;

  // Get active users (logged in within 7 days)
  const activeUsers = users.filter((u) => {
    const lastLogin = parseFirestoreDate(u.lastLoginAt);
    return lastLogin && lastLogin > oneWeekAgo;
  }).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Heart className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Health Companion</h1>
                <p className="text-sm text-muted-foreground">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="hidden sm:flex">
                <Activity className="w-3 h-3 mr-1.5 text-green-500 animate-pulse" />
                Live
              </Badge>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Main Stats Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Total Users */}
          <motion.div variants={item}>
            <Card className="relative overflow-hidden group hover:border-blue-500/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-4xl font-bold mt-2">{totalUsers}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className="text-xs border-green-500/50 text-green-600"
                      >
                        <UserPlus className="w-3 h-3 mr-1" />+{newUsersThisWeek}{" "}
                        this week
                      </Badge>
                    </div>
                  </div>
                  <Users className="w-12 h-12 text-blue-600/20 group-hover:text-blue-600/40 transition-colors" />
                </div>
                <Button asChild variant="default" className="w-full mt-6">
                  <Link
                    href="/dashboard/users"
                    className="flex items-center justify-center gap-2"
                  >
                    Manage Users
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Users */}
          <motion.div variants={item}>
            <Card className="relative overflow-hidden group hover:border-green-500/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Active Users
                    </p>
                    <p className="text-4xl font-bold mt-2">{activeUsers}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className="text-xs border-green-500/50 text-green-600"
                      >
                        <Activity className="w-3 h-3 mr-1" />
                        Last 7 days
                      </Badge>
                    </div>
                  </div>
                  <UserCheck className="w-12 h-12 text-green-600/20 group-hover:text-green-600/40 transition-colors" />
                </div>
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Activity Rate</span>
                    <span className="font-medium">
                      {totalUsers > 0
                        ? Math.round((activeUsers / totalUsers) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{
                        width: `${
                          totalUsers > 0
                            ? Math.round((activeUsers / totalUsers) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Companies */}
          <motion.div variants={item}>
            <Card className="relative overflow-hidden group hover:border-purple-500/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Companies</p>
                    <p className="text-4xl font-bold mt-2">{totalCompanies}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className="text-xs border-green-500/50 text-green-600"
                      >
                        {activeCompanies} active
                      </Badge>
                    </div>
                  </div>
                  <Building2 className="w-12 h-12 text-purple-600/20 group-hover:text-purple-600/40 transition-colors" />
                </div>
                <Button asChild variant="default" className="w-full mt-6">
                  <Link
                    href="/dashboard/companies"
                    className="flex items-center justify-center gap-2"
                  >
                    Manage Companies
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Subscriptions */}
          <motion.div variants={item}>
            <Card className="relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Subscription Plans
                    </p>
                    <p className="text-4xl font-bold mt-2">
                      {subscriptionData?.plans?.length || 0}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className="text-xs border-blue-500/50 text-blue-600"
                      >
                        {subscriptionData?.b2cSubscribers?.length || 0} B2C
                        subscribers
                      </Badge>
                    </div>
                  </div>
                  <CreditCard className="w-12 h-12 text-emerald-600/20 group-hover:text-emerald-600/40 transition-colors" />
                </div>
                <Button asChild variant="default" className="w-full mt-6">
                  <Link
                    href="/dashboard/subscriptions"
                    className="flex items-center justify-center gap-2"
                  >
                    Manage Subscriptions
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Secondary Stats */}
        {/* <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: "Ongoing Chats",
              value: ongoingChats,
              icon: MessageSquare,
              color: "text-blue-600",
              bgColor: "bg-blue-500/10",
            },
            {
              label: "Active Medicines",
              value: activeMedicines,
              icon: Pill,
              color: "text-purple-600",
              bgColor: "bg-purple-500/10",
            },
            {
              label: "Emergency Contacts",
              value: sosEvents,
              icon: AlertTriangle,
              color: "text-red-600",
              bgColor: "bg-red-500/10",
            },
            {
              label: "Trial Users",
              value: subscriptionData?.trialUsers || 0,
              icon: Clock,
              color: "text-orange-600",
              bgColor: "bg-orange-500/10",
            },
          ].map((stat) => (
            <motion.div key={stat.label} variants={item}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}
                    >
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div> */}

        {/* Bottom Section */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid lg:grid-cols-3 gap-6"
        >
          {/* Recent Users */}
          <motion.div variants={item}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                    Recent Users
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/users">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No users yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentUsers.map((user) => {
                      const createdAt = parseFirestoreDate(user.createdAt);
                      return (
                        <Link
                          key={user.id}
                          href={`/dashboard/users/${user.id}`}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {user.displayName
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase() || "?"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {user.displayName || "Unknown User"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {createdAt
                              ? getRelativeTime(createdAt.toISOString())
                              : "—"}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Companies Overview */}
          <motion.div variants={item}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    Companies
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/companies">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {companies.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No companies yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {companies.slice(0, 5).map((company) => (
                      <Link
                        key={company.id}
                        href={`/dashboard/companies/${company.id}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {company.name || "Unknown Company"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {company.employeeCount || 0} employees
                          </p>
                        </div>
                        <Badge
                          variant={
                            company.status === "active"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {company.status || "unknown"}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={item}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Total Users
                    </span>
                    <span className="font-semibold">{totalUsers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Active Users (7d)
                    </span>
                    <span className="font-semibold text-green-600">
                      {activeUsers}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      New Users (7d)
                    </span>
                    <span className="font-semibold text-blue-600">
                      +{newUsersThisWeek}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Total Companies
                    </span>
                    <span className="font-semibold">{totalCompanies}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Active Companies
                    </span>
                    <span className="font-semibold text-green-600">
                      {activeCompanies}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Subscription Plans
                    </span>
                    <span className="font-semibold">
                      {subscriptionData?.plans?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Trial Users
                    </span>
                    <span className="font-semibold text-orange-600">
                      {subscriptionData?.trialUsers || 0}
                    </span>
                  </div>
                </div>

                {/* Activity Rate */}
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      User Activity Rate
                    </span>
                    <span className="font-semibold">
                      {totalUsers > 0
                        ? Math.round((activeUsers / totalUsers) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                      style={{
                        width: `${
                          totalUsers > 0
                            ? Math.round((activeUsers / totalUsers) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
