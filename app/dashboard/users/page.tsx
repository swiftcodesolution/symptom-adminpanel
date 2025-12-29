/* eslint-disable react-hooks/exhaustive-deps */
// app/dashboard/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Filter,
  Users,
  ChevronRight,
  Clock,
  AlertTriangle,
  Phone,
  Calendar,
  Shield,
  Activity,
  UserCheck,
  UserX,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { getRelativeTime, parseFirestoreDate } from "@/lib/utils";
import Image from "next/image";

interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

interface UserProfile {
  id: string;
  displayName?: string;
  email?: string;
  emailVerified?: boolean;
  phoneNumber?: string | null;
  photoURL?: string | null;
  provider?: string;
  address?: string | null;
  createdAt?: FirestoreTimestamp | string;
  lastLoginAt?: FirestoreTimestamp | string;
  lastUpdated?: string;
  updatedAt?: string;
  answers?: Array<{
    question: string;
    answer: string;
    summarizedAnswer: string;
  }>;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Safe date parsing that handles both Firestore timestamps and strings
function safeParseDate(
  date: FirestoreTimestamp | string | undefined | null
): Date | null {
  if (!date) return null;
  return parseFirestoreDate(date);
}

// Determine user status based on activity
function getUserStatus(user: UserProfile): "active" | "inactive" | "new" {
  const lastLogin = safeParseDate(user.lastLoginAt);

  if (!lastLogin) return "inactive";

  const now = new Date();
  const daysSinceLogin = Math.floor(
    (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLogin <= 7) return "active";
  return "inactive";
}

// Check if user is new (created within last 7 days)
function isNewUser(user: UserProfile): boolean {
  const createdAt = safeParseDate(user.createdAt);

  if (!createdAt) return false;

  const now = new Date();
  const daysSinceCreation = Math.floor(
    (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysSinceCreation <= 7;
}

// Check profile completion
function getProfileCompletion(user: UserProfile): number {
  let filled = 0;
  const total = 5;

  if (user.displayName) filled++;
  if (user.email) filled++;
  if (user.phoneNumber) filled++;
  if (user.address) filled++;
  if (user.answers && user.answers.filter((a) => a.answer).length > 10)
    filled++;

  return Math.round((filled / total) * 100);
}

// Format date safely
function formatDateSafe(
  date: FirestoreTimestamp | string | undefined | null
): string {
  const parsed = safeParseDate(date);
  if (!parsed) return "Unknown";
  return parsed.toLocaleDateString();
}

// Get relative time safely
function getRelativeTimeSafe(
  date: FirestoreTimestamp | string | undefined | null
): string {
  const parsed = safeParseDate(date);
  if (!parsed) return "Unknown";
  return getRelativeTime(parsed.toISOString());
}

const statusConfig = {
  active: {
    label: "Active",
    variant: "default" as const,
    color: "bg-green-500",
  },
  inactive: {
    label: "Inactive",
    variant: "secondary" as const,
    color: "bg-gray-500",
  },
  new: {
    label: "New",
    variant: "outline" as const,
    color: "bg-blue-500",
  },
};

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
      <Separator />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function UsersPage() {
  const authFetch = useAuthFetch();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  async function fetchUsers() {
    try {
      setError(null);

      const response = await authFetch("/panel/api/admin/users");

      if (!response.ok) {
        setError("Failed to fetch users");
        return;
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }

  useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      await fetchUsers();
      setLoading(false);
    }
    initialFetch();
  }, [authFetch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">{error}</h1>
          <p className="text-muted-foreground mt-2">
            Unable to load users data.
          </p>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Get unique providers (filter out undefined)
  const providers = [
    ...new Set(users.map((u) => u.provider).filter(Boolean)),
  ] as string[];

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phoneNumber?.includes(searchQuery);

    const userStatus = getUserStatus(user);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "new" && isNewUser(user)) ||
      (statusFilter !== "new" && userStatus === statusFilter);

    const matchesProvider =
      providerFilter === "all" || user.provider === providerFilter;

    return matchesSearch && matchesStatus && matchesProvider;
  });

  // Calculate stats safely
  const stats = {
    total: users.length,
    active: users.filter((u) => getUserStatus(u) === "active").length,
    inactive: users.filter((u) => getUserStatus(u) === "inactive").length,
    new: users.filter((u) => isNewUser(u)).length,
    verified: users.filter((u) => u.emailVerified).length,
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Users className="h-7 w-7" />
              Users
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage all individual app users
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
        <Separator />
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        {[
          {
            label: "Total Users",
            value: stats.total,
            icon: Users,
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-500/10",
          },
          {
            label: "Active",
            value: stats.active,
            icon: UserCheck,
            color: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-500/10",
          },
          {
            label: "Inactive",
            value: stats.inactive,
            icon: UserX,
            color: "text-gray-600 dark:text-gray-400",
            bgColor: "bg-gray-500/10",
          },
          {
            label: "New (7 days)",
            value: stats.new,
            icon: Activity,
            color: "text-purple-600 dark:text-purple-400",
            bgColor: "bg-purple-500/10",
          },
          {
            label: "Verified",
            value: stats.verified,
            icon: Shield,
            color: "text-emerald-600 dark:text-emerald-400",
            bgColor: "bg-emerald-500/10",
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
      </motion.div>

      {/* Filters */}
      <motion.div
        variants={item}
        className="flex flex-col sm:flex-row gap-4 flex-wrap"
      >
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="shrink-0">
              <Filter className="h-4 w-4 mr-2" />
              {statusFilter === "all"
                ? "All Status"
                : statusFilter === "new"
                ? "New Users"
                : statusConfig[statusFilter as keyof typeof statusConfig]
                    ?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>
              All Status
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setStatusFilter("active")}>
              <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
              Active (Last 7 days)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
              <span className="h-2 w-2 rounded-full bg-gray-500 mr-2" />
              Inactive
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("new")}>
              <span className="h-2 w-2 rounded-full bg-purple-500 mr-2" />
              New Users
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {providers.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0">
                <Shield className="h-4 w-4 mr-2" />
                {providerFilter === "all"
                  ? "All Providers"
                  : providerFilter.charAt(0).toUpperCase() +
                    providerFilter.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setProviderFilter("all")}>
                All Providers
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {providers.map((provider) => (
                <DropdownMenuItem
                  key={provider}
                  onClick={() => setProviderFilter(provider)}
                >
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </motion.div>

      {/* Users Grid */}
      <motion.div variants={container} initial="hidden" animate="show">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground font-medium">
                No users found
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {users.length === 0
                  ? "No users have registered yet."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredUsers.map((user) => {
              const status = getUserStatus(user);
              const isNew = isNewUser(user);
              const completion = getProfileCompletion(user);
              const config = statusConfig[status];

              return (
                <motion.div key={user.id} variants={item}>
                  <Card className="hover:border-foreground/20 transition-all group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                            {user.photoURL ? (
                              <Image
                                src={user.photoURL}
                                alt={user.displayName || "User"}
                                width={48}
                                height={48}
                                className="h-12 w-12 object-cover"
                              />
                            ) : (
                              <span className="text-lg font-bold text-primary">
                                {user.displayName
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase() || "?"}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold truncate">
                              {user.displayName || "Unknown User"}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email || "No email"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={config.variant}>{config.label}</Badge>
                          {isNew && (
                            <Badge
                              variant="outline"
                              className="text-xs border-purple-500 text-purple-600"
                            >
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Contact Info */}
                      <div className="space-y-2 text-sm">
                        {user.phoneNumber && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span className="truncate">{user.phoneNumber}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Shield className="h-3 w-3" />
                          <span className="capitalize">
                            {user.provider || "Unknown"}
                          </span>
                          {user.emailVerified && (
                            <Badge
                              variant="outline"
                              className="text-xs h-5 px-1"
                            >
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Profile Completion */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Profile Completion
                          </span>
                          <span className="font-medium">{completion}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              completion >= 80
                                ? "bg-green-500"
                                : completion >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                      </div>

                      {/* Activity Info */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            Active {getRelativeTimeSafe(user.lastLoginAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Joined {formatDateSafe(user.createdAt)}</span>
                        </div>
                      </div>

                      {/* View Profile Button */}
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        <Link href={`/dashboard/users/${user.id}`}>
                          View Profile
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Results Summary */}
      {filteredUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-muted-foreground"
        >
          Showing {filteredUsers.length} of {users.length} users
        </motion.div>
      )}
    </div>
  );
}
