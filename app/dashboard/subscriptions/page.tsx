// app/dashboard/subscriptions/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  Search,
  Filter,
  MoreHorizontal,
  Check,
  X,
  Clock,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  CreditCard,
  Crown,
  Zap,
  Star,
  Copy,
  Eye,
  AlertTriangle,
  UserX,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useAuthFetch } from "@/lib/useAuthFetch";
import Image from "next/image";

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Subscription status configuration
const subscriptionStatusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: typeof Check;
    color: string;
    bgColor: string;
  }
> = {
  active: {
    label: "Active",
    variant: "default",
    icon: Check,
    color: "text-green-600",
    bgColor: "bg-green-500/10",
  },
  canceled: {
    label: "Canceled",
    variant: "secondary",
    icon: X,
    color: "text-gray-600",
    bgColor: "bg-gray-500/10",
  },
  past_due: {
    label: "Past Due",
    variant: "destructive",
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-500/10",
  },
  trialing: {
    label: "Trial",
    variant: "outline",
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  incomplete: {
    label: "Incomplete",
    variant: "outline",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-500/10",
  },
  incomplete_expired: {
    label: "Expired",
    variant: "destructive",
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-500/10",
  },
  unpaid: {
    label: "Unpaid",
    variant: "destructive",
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-500/10",
  },
  paused: {
    label: "Paused",
    variant: "secondary",
    icon: Clock,
    color: "text-gray-600",
    bgColor: "bg-gray-500/10",
  },
  no_subscription: {
    label: "No Plan",
    variant: "outline",
    icon: UserX,
    color: "text-gray-400",
    bgColor: "bg-gray-500/10",
  },
};

// Company status configuration
const companyStatusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  active: { label: "Active", variant: "default" },
  suspended: { label: "Suspended", variant: "destructive" },
  pending: { label: "Pending", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "secondary" },
};

// Interfaces
interface StripePlan {
  priceId: string;
  productId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  intervalCount: number;
  features: string[];
  metadata: Record<string, string>;
  sortOrder: number;
}

interface B2CSubscriber {
  id: string;
  name: string | null;
  email: string | null;
  photoURL?: string | null;
  createdAt?: number | null;
  subscription: {
    stripeCustomerId?: string;
    subscriptionId?: string;
    priceId?: string;
    productId?: string;
    planName?: string;
    status?: string;
    currentPeriodStart?: number;
    currentPeriodEnd?: number;
    cancelAtPeriodEnd?: boolean;
    canceledAt?: number;
    createdAt?: number;
    updatedAt?: number;
  } | null;
}

interface Company {
  id: string;
  name: string;
  industry: string;
  status: "active" | "suspended" | "pending" | "cancelled";
  plan: string;
  userCapacity: number;
  currentUsers?: number;
}

interface SubscriptionStats {
  mrr: number;
  activeSubscriptions: number;
  trialingSubscriptions: number;
  pastDueSubscriptions: number;
  cancelingSubscriptions: number;
  totalB2CCustomers: number;
  totalB2BCompanies: number;
  activeB2BCompanies: number;
  error?: string;
}

interface SyncResult {
  success: boolean;
  total: number;
  synced: number;
  failed: number;
  noSubscription: number;
  details: Array<{
    userId: string;
    status: string;
    planName?: string;
    error?: string;
  }>;
}

// Plan icon mapping
const planIcons: Record<string, typeof Star> = {
  basic: Zap,
  starter: Zap,
  pro: Star,
  professional: Star,
  premium: Crown,
  enterprise: Crown,
};

export default function SubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [b2cStatusFilter, setB2cStatusFilter] = useState("all");
  const [b2bStatusFilter, setB2bStatusFilter] = useState("all");

  // Data states
  const [stripePlans, setStripePlans] = useState<StripePlan[]>([]);
  const [b2cSubscribers, setB2cSubscribers] = useState<B2CSubscriber[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Sync states
  const [syncingUser, setSyncingUser] = useState<string | null>(null);
  const [syncAllDialogOpen, setSyncAllDialogOpen] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult | null>(null);
  const [syncResultsDialogOpen, setSyncResultsDialogOpen] = useState(false);

  const authFetch = useAuthFetch();

  // Fetch all data
  const fetchData = useCallback(
    async (showRefreshToast = false) => {
      try {
        if (showRefreshToast) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const [plansRes, subscribersRes, companiesRes, statsRes] =
          await Promise.all([
            fetch("/panel/api/stripe/plans"),
            authFetch("/panel/api/admin/subscriptions/b2c"),
            authFetch("/panel/api/admin/companies"),
            authFetch("/panel/api/admin/subscriptions/stats"),
          ]);

        // Fetch Stripe plans
        if (plansRes.ok) {
          const plansData = await plansRes.json();
          setStripePlans(plansData.plans || []);
        }

        // Fetch B2C subscribers
        if (subscribersRes.ok) {
          const subscribersData = await subscribersRes.json();
          setB2cSubscribers(subscribersData || []);
        }

        // Fetch companies
        if (companiesRes.ok) {
          const companiesData = await companiesRes.json();
          setCompanies(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            companiesData.map((c: any) => ({
              id: c.companyId,
              name: c.name,
              industry: c.industry,
              status: c.status,
              plan: c.plan,
              userCapacity: c.userCapacity,
              currentUsers: c.currentUsers || 0,
            }))
          );
        }

        // Fetch stats
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (showRefreshToast) {
          toast.success("Data refreshed");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load subscription data");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [authFetch]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sync single user subscription
  const syncUserSubscription = async (userId: string) => {
    try {
      setSyncingUser(userId);
      const response = await authFetch("/panel/api/admin/subscriptions/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync subscription");
      }

      // Update local state
      setB2cSubscribers((prev) =>
        prev.map((sub) =>
          sub.id === userId ? { ...sub, subscription: data.subscription } : sub
        )
      );

      toast.success(
        `Synced: ${data.subscription?.planName || "No subscription"} (${
          data.subscription?.status || "no_subscription"
        })`
      );

      // Refresh stats
      const statsRes = await authFetch("/panel/api/admin/subscriptions/stats");
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (error) {
      console.error("Error syncing subscription:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to sync subscription"
      );
    } finally {
      setSyncingUser(null);
    }
  };

  // Sync all subscriptions
  const syncAllSubscriptions = async () => {
    try {
      setSyncingAll(true);
      setSyncAllDialogOpen(false);

      toast.info("Syncing all subscriptions... This may take a moment.");

      const response = await authFetch("/panel/api/admin/subscriptions/sync", {
        method: "PUT",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync subscriptions");
      }

      setSyncResults(data);
      setSyncResultsDialogOpen(true);

      // Refresh all data
      await fetchData();

      toast.success(
        `Sync complete: ${data.synced} synced, ${data.failed} failed`
      );
    } catch (error) {
      console.error("Error syncing all subscriptions:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to sync subscriptions"
      );
    } finally {
      setSyncingAll(false);
    }
  };

  // Filter functions
  const filteredB2C = b2cSubscribers.filter((sub) => {
    const matchesSearch =
      sub.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const status = sub.subscription?.status || "no_subscription";
    const matchesStatus =
      b2cStatusFilter === "all" || status === b2cStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredB2B = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      b2bStatusFilter === "all" || company.status === b2bStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Format helpers
  const formatPrice = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatRelativeDate = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = timestamp - now;
    const days = Math.floor(diff / 86400);

    if (days < 0) {
      return `${Math.abs(days)} days ago`;
    } else if (days === 0) {
      return "Today";
    } else if (days === 1) {
      return "Tomorrow";
    } else if (days < 30) {
      return `In ${days} days`;
    } else {
      return formatDate(timestamp);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getPlanIcon = (planName: string) => {
    const lowerName = planName.toLowerCase();
    for (const [key, Icon] of Object.entries(planIcons)) {
      if (lowerName.includes(key)) return Icon;
    }
    return Star;
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "?";
  };

  // Check if subscription needs sync (has customer ID but no subscription ID or outdated)
  const needsSync = (sub: B2CSubscriber) => {
    if (!sub.subscription?.stripeCustomerId) return false;
    if (!sub.subscription?.subscriptionId) return true;
    // Check if last update was more than 1 hour ago
    const lastUpdate = sub.subscription?.updatedAt || 0;
    return Date.now() - lastUpdate > 3600000;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

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
            <h1 className="text-2xl md:text-3xl font-bold">Subscriptions</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage B2C subscriptions and B2B companies
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSyncAllDialogOpen(true)}
              disabled={syncingAll}
            >
              {syncingAll ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Sync All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(
                  "https://dashboard.stripe.com/subscriptions",
                  "_blank"
                )
              }
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Stripe
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(true)}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
        <Separator />
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Stats Overview */}
        <motion.div
          variants={item}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Monthly Revenue
                  </p>
                  <p className="text-2xl font-bold">
                    $
                    {(stats?.mrr || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    MRR from Stripe
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Active Subscriptions
                  </p>
                  <p className="text-2xl font-bold">
                    {stats?.activeSubscriptions || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.trialingSubscriptions
                      ? `+ ${stats.trialingSubscriptions} trialing`
                      : `${
                          stats?.totalB2CCustomers || b2cSubscribers.length
                        } total customers`}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">B2B Companies</p>
                  <p className="text-2xl font-bold">
                    {stats?.activeB2BCompanies ||
                      companies.filter((c) => c.status === "active").length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.totalB2BCompanies || companies.length} total
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Needs Attention
                  </p>
                  <p className="text-2xl font-bold">
                    {(stats?.pastDueSubscriptions || 0) +
                      (stats?.cancelingSubscriptions || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.pastDueSubscriptions || 0} past due •{" "}
                    {stats?.cancelingSubscriptions || 0} canceling
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stripe Info Banner */}
        <motion.div variants={item}>
          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">
                    B2C Plans managed in Stripe Dashboard
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create and manage plans in Stripe. Use the &quot;Sync
                    All&quot; button to update subscription data from Stripe.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      window.open(
                        "https://dashboard.stripe.com/products",
                        "_blank"
                      )
                    }
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Products
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      window.open(
                        "https://dashboard.stripe.com/webhooks",
                        "_blank"
                      )
                    }
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Webhooks
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={item}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="b2c">
                B2C
                {b2cSubscribers.filter(
                  (s) => s.subscription?.status === "active"
                ).length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                    {
                      b2cSubscribers.filter(
                        (s) => s.subscription?.status === "active"
                      ).length
                    }
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="b2b">B2B</TabsTrigger>
              <TabsTrigger value="plans">Plans</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent B2C Subscribers */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        Recent Subscribers
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("b2c")}
                      >
                        View All
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {b2cSubscribers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No subscribers yet</p>
                        <p className="text-xs mt-1">
                          Subscribers appear when users subscribe via Stripe
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {b2cSubscribers.slice(0, 5).map((sub) => {
                          const statusKey =
                            sub.subscription?.status || "no_subscription";
                          const status =
                            subscriptionStatusConfig[statusKey] ||
                            subscriptionStatusConfig.no_subscription;
                          const StatusIcon = status.icon;

                          return (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between p-3 rounded-lg border hover:border-foreground/20 transition-colors"
                            >
                              <Link
                                href={`/dashboard/users/${sub.id}`}
                                className="flex items-center gap-3 flex-1"
                              >
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                  {sub.photoURL ? (
                                    <Image
                                      width={500}
                                      height={500}
                                      src={sub.photoURL}
                                      alt={sub.name || "User"}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-sm font-semibold text-primary">
                                      {getInitials(sub.name, sub.email)}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">
                                    {sub.name || sub.email || "Unknown User"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {sub.subscription?.planName || "No Plan"}
                                  </p>
                                </div>
                              </Link>
                              <div className="flex items-center gap-2">
                                {sub.subscription?.cancelAtPeriodEnd && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs hidden sm:flex"
                                  >
                                    Canceling
                                  </Badge>
                                )}
                                <Badge variant={status.variant}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {status.label}
                                </Badge>
                                {needsSync(sub) && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => syncUserSubscription(sub.id)}
                                    disabled={syncingUser === sub.id}
                                  >
                                    {syncingUser === sub.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <RotateCcw className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* B2B Companies */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-purple-500" />
                        B2B Companies
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("b2b")}
                      >
                        View All
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {companies.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No companies yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {companies.slice(0, 5).map((company) => {
                          const status =
                            companyStatusConfig[company.status] ||
                            companyStatusConfig.active;
                          return (
                            <Link
                              key={company.id}
                              href={`/dashboard/companies/${company.id}`}
                            >
                              <div className="flex items-center justify-between p-3 rounded-lg border hover:border-foreground/20 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                    <Building2 className="h-5 w-5 text-purple-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">
                                      {company.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {company.plan || "No Plan"}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant={status.variant}>
                                  {status.label}
                                </Badge>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Alerts */}
              {((stats?.pastDueSubscriptions || 0) > 0 ||
                (stats?.cancelingSubscriptions || 0) > 0) && (
                <div className="grid md:grid-cols-2 gap-4">
                  {(stats?.pastDueSubscriptions || 0) > 0 && (
                    <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
                      <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">
                              {stats?.pastDueSubscriptions} past due
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              Payment failed - action required
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                            onClick={() =>
                              window.open(
                                "https://dashboard.stripe.com/subscriptions?status=past_due",
                                "_blank"
                              )
                            }
                          >
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {(stats?.cancelingSubscriptions || 0) > 0 && (
                    <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20">
                      <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">
                              {stats?.cancelingSubscriptions} canceling
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              Will lose access at period end
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            {/* B2C Subscribers Tab */}
            <TabsContent value="b2c" className="mt-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      {b2cStatusFilter === "all"
                        ? "All Status"
                        : subscriptionStatusConfig[b2cStatusFilter]?.label ||
                          b2cStatusFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setB2cStatusFilter("all")}>
                      All Status
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {Object.entries(subscriptionStatusConfig).map(
                      ([key, config]) => (
                        <DropdownMenuItem
                          key={key}
                          onClick={() => setB2cStatusFilter(key)}
                        >
                          <config.icon
                            className={`h-4 w-4 mr-2 ${config.color}`}
                          />
                          {config.label}
                        </DropdownMenuItem>
                      )
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  onClick={() => setSyncAllDialogOpen(true)}
                  disabled={syncingAll}
                >
                  {syncingAll ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4 mr-2" />
                  )}
                  Sync All
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  {filteredB2C.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No subscribers found</p>
                      <p className="text-sm mt-1">
                        {searchQuery || b2cStatusFilter !== "all"
                          ? "Try adjusting your filters"
                          : "Subscribers appear when users subscribe via Stripe"}
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subscriber</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead className="hidden md:table-cell">
                            Period End
                          </TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredB2C.map((sub) => {
                          const statusKey =
                            sub.subscription?.status || "no_subscription";
                          const status =
                            subscriptionStatusConfig[statusKey] ||
                            subscriptionStatusConfig.no_subscription;
                          const StatusIcon = status.icon;
                          const isSyncing = syncingUser === sub.id;

                          return (
                            <TableRow key={sub.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                                    {sub.photoURL ? (
                                      <Image
                                        width={500}
                                        height={500}
                                        src={sub.photoURL}
                                        alt={sub.name || "User"}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-sm font-semibold text-primary">
                                        {getInitials(sub.name, sub.email)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium truncate">
                                      {sub.name || "Unknown"}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {sub.email || "No email"}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {sub.subscription?.planName || "No Plan"}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {sub.subscription?.currentPeriodEnd ? (
                                  <div className="flex flex-col">
                                    <span className="text-sm">
                                      {formatDate(
                                        sub.subscription.currentPeriodEnd
                                      )}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatRelativeDate(
                                        sub.subscription.currentPeriodEnd
                                      )}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">
                                    —
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Badge variant={status.variant}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {status.label}
                                  </Badge>
                                  {sub.subscription?.cancelAtPeriodEnd && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs hidden sm:flex"
                                    >
                                      Canceling
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      disabled={isSyncing}
                                    >
                                      {isSyncing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <MoreHorizontal className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                      <Link href={`/dashboard/users/${sub.id}`}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View User
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        syncUserSubscription(sub.id)
                                      }
                                    >
                                      <RotateCcw className="h-4 w-4 mr-2" />
                                      Sync from Stripe
                                    </DropdownMenuItem>
                                    {sub.subscription?.subscriptionId && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() =>
                                            copyToClipboard(
                                              sub.subscription
                                                ?.subscriptionId || "",
                                              "Subscription ID"
                                            )
                                          }
                                        >
                                          <Copy className="h-4 w-4 mr-2" />
                                          Copy Sub ID
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            window.open(
                                              `https://dashboard.stripe.com/subscriptions/${sub.subscription?.subscriptionId}`,
                                              "_blank"
                                            )
                                          }
                                        >
                                          <ExternalLink className="h-4 w-4 mr-2" />
                                          View in Stripe
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {sub.subscription?.stripeCustomerId &&
                                      !sub.subscription?.subscriptionId && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            window.open(
                                              `https://dashboard.stripe.com/customers/${sub.subscription?.stripeCustomerId}`,
                                              "_blank"
                                            )
                                          }
                                        >
                                          <ExternalLink className="h-4 w-4 mr-2" />
                                          View Customer
                                        </DropdownMenuItem>
                                      )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* B2B Tab */}
            <TabsContent value="b2b" className="mt-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      {b2bStatusFilter === "all"
                        ? "All Status"
                        : companyStatusConfig[b2bStatusFilter]?.label ||
                          b2bStatusFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setB2bStatusFilter("all")}>
                      All Status
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {Object.entries(companyStatusConfig).map(
                      ([key, config]) => (
                        <DropdownMenuItem
                          key={key}
                          onClick={() => setB2bStatusFilter(key)}
                        >
                          {config.label}
                        </DropdownMenuItem>
                      )
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link href="/dashboard/companies">
                  <Button>
                    <Building2 className="h-4 w-4 mr-2" />
                    Manage Companies
                  </Button>
                </Link>
              </div>

              <Card>
                <CardContent className="p-0">
                  {filteredB2B.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No companies found</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead className="hidden md:table-cell">
                            Users
                          </TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredB2B.map((company) => {
                          const status =
                            companyStatusConfig[company.status] ||
                            companyStatusConfig.active;
                          return (
                            <TableRow key={company.id}>
                              <TableCell>
                                <Link
                                  href={`/dashboard/companies/${company.id}`}
                                >
                                  <div className="flex items-center gap-3 cursor-pointer">
                                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                                      <Building2 className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-medium hover:underline truncate">
                                        {company.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground truncate">
                                        {company.industry}
                                      </p>
                                    </div>
                                  </div>
                                </Link>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {company.plan || "No Plan"}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <span className="text-sm">
                                  {company.currentUsers || 0}/
                                  {company.userCapacity === -1
                                    ? "∞"
                                    : company.userCapacity}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge variant={status.variant}>
                                  {status.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                      <Link
                                        href={`/dashboard/companies/${company.id}`}
                                      >
                                        View Details
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                      <Link
                                        href={`/dashboard/companies/${company.id}/users`}
                                      >
                                        Manage Users
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">
                                      Suspend Company
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Plans Tab */}
            <TabsContent value="plans" className="mt-6 space-y-6">
              {/* Stripe Management Banner */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="py-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        Manage Plans in Stripe Dashboard
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create products, set prices, and configure billing in
                        Stripe. Plans sync automatically via webhooks.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Auto-sync enabled
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          {stripePlans.length} plans loaded
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                      <Button
                        onClick={() =>
                          window.open(
                            "https://dashboard.stripe.com/products/create",
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Create Product
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          window.open(
                            "https://dashboard.stripe.com/products",
                            "_blank"
                          )
                        }
                      >
                        View All
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Plans Grid */}
              {stripePlans.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="font-semibold text-lg mb-2">
                      No Plans Found
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                      Create subscription products in Stripe Dashboard with
                      metadata to customize appearance.
                    </p>
                    <Button
                      onClick={() =>
                        window.open(
                          "https://dashboard.stripe.com/products/create",
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Create First Product
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stripePlans.map((plan) => {
                    const PlanIcon = getPlanIcon(plan.name);
                    const isPopular = plan.metadata?.popular === "true";
                    const subscriberCount = b2cSubscribers.filter(
                      (s) =>
                        s.subscription?.priceId === plan.priceId &&
                        s.subscription?.status === "active"
                    ).length;

                    return (
                      <Card
                        key={plan.priceId}
                        className={`relative ${
                          isPopular ? "border-primary shadow-lg" : ""
                        }`}
                      >
                        {isPopular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <Badge className="bg-primary text-primary-foreground">
                              Most Popular
                            </Badge>
                          </div>
                        )}
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div
                              className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                                isPopular
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-primary/10"
                              }`}
                            >
                              <PlanIcon
                                className={`h-6 w-6 ${
                                  isPopular ? "" : "text-primary"
                                }`}
                              />
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    copyToClipboard(plan.priceId, "Price ID")
                                  }
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Price ID
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    copyToClipboard(
                                      plan.productId,
                                      "Product ID"
                                    )
                                  }
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Product ID
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    window.open(
                                      `https://dashboard.stripe.com/products/${plan.productId}`,
                                      "_blank"
                                    )
                                  }
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Edit in Stripe
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="mt-4">
                            <CardTitle className="text-xl">
                              {plan.name}
                            </CardTitle>
                            {plan.description && (
                              <CardDescription className="mt-1">
                                {plan.description}
                              </CardDescription>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-6">
                            <span className="text-3xl font-bold">
                              {formatPrice(plan.price, plan.currency)}
                            </span>
                            <span className="text-muted-foreground">
                              /{plan.interval}
                            </span>
                          </div>

                          {/* Subscriber count */}
                          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>
                              {subscriberCount} active subscriber
                              {subscriberCount !== 1 ? "s" : ""}
                            </span>
                          </div>

                          <Separator className="my-4" />

                          {/* Features */}
                          {plan.features.length > 0 ? (
                            <ul className="space-y-2">
                              {plan.features.slice(0, 5).map((feature, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                              {plan.features.length > 5 && (
                                <li className="text-xs text-muted-foreground pl-6">
                                  +{plan.features.length - 5} more features
                                </li>
                              )}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              No features defined. Add them in Stripe product
                              metadata as a JSON array.
                            </p>
                          )}

                          {/* Price ID */}
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-xs text-muted-foreground font-mono truncate">
                              {plan.priceId}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* How to Configure Plans Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    How to Configure Plans in Stripe
                  </CardTitle>
                  <CardDescription>
                    Set up product metadata to customize how plans appear in
                    your app
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          1
                        </span>
                        Required Metadata
                      </h4>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-2">
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs shrink-0 mt-0.5">
                            type
                          </code>
                          <span className="text-muted-foreground">
                            Set to{" "}
                            <code className="bg-muted px-1 rounded">b2c</code>{" "}
                            for consumer plans
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs shrink-0 mt-0.5">
                            features
                          </code>
                          <span className="text-muted-foreground">
                            JSON array:{" "}
                            <code className="bg-muted px-1 rounded text-xs">
                              [&quot;Feature 1&quot;, &quot;Feature 2&quot;]
                            </code>
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          2
                        </span>
                        Optional Metadata
                      </h4>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-2">
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs shrink-0 mt-0.5">
                            popular
                          </code>
                          <span className="text-muted-foreground">
                            Set to{" "}
                            <code className="bg-muted px-1 rounded">true</code>{" "}
                            to highlight plan
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs shrink-0 mt-0.5">
                            sortOrder
                          </code>
                          <span className="text-muted-foreground">
                            Number for ordering (1, 2, 3...)
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <Separator className="my-6" />
                  <div>
                    <h4 className="font-medium mb-3">Example Product Setup</h4>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                      {`// In Stripe Dashboard → Products → [Product] → Metadata
{
  "type": "b2c",
  "features": "[\\"Unlimited tracking\\", \\"AI insights\\", \\"Priority support\\"]",
  "popular": "true",
  "sortOrder": "2"
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>

      {/* Sync All Confirmation Dialog */}
      <AlertDialog open={syncAllDialogOpen} onOpenChange={setSyncAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sync All Subscriptions</AlertDialogTitle>
            <AlertDialogDescription>
              This will fetch the latest subscription data from Stripe for all
              users with a Stripe customer ID ({b2cSubscribers.length} users).
              This may take a few moments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={syncAllSubscriptions}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Sync All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sync Results Dialog */}
      <Dialog
        open={syncResultsDialogOpen}
        onOpenChange={setSyncResultsDialogOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Sync Complete</DialogTitle>
            <DialogDescription>
              Subscription data has been synced from Stripe
            </DialogDescription>
          </DialogHeader>

          {syncResults && (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{syncResults.synced}</p>
                    <p className="text-xs text-muted-foreground">Synced</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">
                      {syncResults.noSubscription}
                    </p>
                    <p className="text-xs text-muted-foreground">No Sub</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{syncResults.failed}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </CardContent>
                </Card>
              </div>

              {/* Details */}
              {syncResults.details.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Details</h4>
                  <ScrollArea className="h-48 border rounded-lg">
                    <div className="p-2 space-y-1">
                      {syncResults.details.map((detail, idx) => {
                        const statusConfig =
                          subscriptionStatusConfig[detail.status] ||
                          subscriptionStatusConfig.no_subscription;
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <code className="text-xs bg-muted px-1 rounded truncate max-w-30">
                                {detail.userId.slice(0, 8)}...
                              </code>
                              {detail.planName && (
                                <span className="text-xs text-muted-foreground truncate">
                                  {detail.planName}
                                </span>
                              )}
                            </div>
                            <Badge
                              variant={statusConfig.variant}
                              className="text-xs shrink-0"
                            >
                              {statusConfig.label}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setSyncResultsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
