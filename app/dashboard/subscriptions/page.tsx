/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/subscriptions/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  Users,
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
  Plus,
  Edit,
  Trash2,
  Package,
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useAuthFetch } from "@/lib/useAuthFetch";
import Image from "next/image";

// ────────────────────────────────────────────────
// Animation variants
// ────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// ────────────────────────────────────────────────
// Status configurations
// ────────────────────────────────────────────────
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

// ────────────────────────────────────────────────
// Interfaces
// ────────────────────────────────────────────────
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

interface B2BPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: "monthly" | "yearly";
  type: "b2b";
  features: string[];
  maxUsers: number;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
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

// ────────────────────────────────────────────────
// Constants & Helpers
// ────────────────────────────────────────────────
const emptyB2BPlan: Omit<B2BPlan, "id" | "createdAt" | "updatedAt"> = {
  name: "",
  description: "",
  price: 0,
  billingCycle: "monthly",
  type: "b2b",
  features: [],
  maxUsers: 10,
  isActive: true,
};

const planIcons: Record<string, typeof Star> = {
  basic: Zap,
  starter: Zap,
  pro: Star,
  professional: Star,
  premium: Crown,
  enterprise: Crown,
};

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────
export default function SubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [b2cStatusFilter, setB2cStatusFilter] = useState("all");
  const [b2bStatusFilter, setB2bStatusFilter] = useState("all");

  // Data states
  const [stripePlans, setStripePlans] = useState<StripePlan[]>([]);
  const [b2bPlans, setB2bPlans] = useState<B2BPlan[]>([]);
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

  // B2B Plan CRUD states
  const [isB2BPlanDialogOpen, setIsB2BPlanDialogOpen] = useState(false);
  const [editingB2BPlan, setEditingB2BPlan] = useState<B2BPlan | null>(null);
  const [b2bPlanForm, setB2bPlanForm] = useState(emptyB2BPlan);
  const [b2bFeaturesInput, setB2bFeaturesInput] = useState("");
  const [savingB2BPlan, setSavingB2BPlan] = useState(false);
  const [deletingB2BPlan, setDeletingB2BPlan] = useState<B2BPlan | null>(null);

  const authFetch = useAuthFetch();

  // ────────────────────────────────────────────────
  // Data fetching
  // ────────────────────────────────────────────────
  const fetchData = useCallback(
    async (showRefreshToast = false) => {
      try {
        if (showRefreshToast) setRefreshing(true);
        else setLoading(true);

        const [plansRes, b2bPlansRes, subsRes, companiesRes, statsRes] =
          await Promise.all([
            fetch("/panel/api/stripe/plans"),
            authFetch("/panel/api/admin/subscription-plans"),
            authFetch("/panel/api/admin/subscriptions/b2c"),
            authFetch("/panel/api/admin/companies"),
            authFetch("/panel/api/admin/subscriptions/stats"),
          ]);

        if (plansRes.ok) {
          const data = await plansRes.json();
          setStripePlans(data.plans || []);
        }

        if (b2bPlansRes.ok) {
          const data = await b2bPlansRes.json();
          setB2bPlans(data.filter((p: B2BPlan) => p.type === "b2b") || []);
        }

        if (subsRes.ok) {
          setB2cSubscribers((await subsRes.json()) || []);
        }

        if (companiesRes.ok) {
          const data = await companiesRes.json();
          setCompanies(
            data.map((c: any) => ({
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

        if (statsRes.ok) {
          setStats(await statsRes.json());
        }

        if (showRefreshToast) toast.success("Data refreshed");
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

  // ────────────────────────────────────────────────
  // Sync functions
  // ────────────────────────────────────────────────
  const syncUserSubscription = async (userId: string) => {
    try {
      setSyncingUser(userId);
      const response = await authFetch("/panel/api/admin/subscriptions/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to sync");

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

      const statsRes = await authFetch("/panel/api/admin/subscriptions/stats");
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (error: any) {
      toast.error(error.message || "Failed to sync subscription");
    } finally {
      setSyncingUser(null);
    }
  };

  const syncAllSubscriptions = async () => {
    try {
      setSyncingAll(true);
      setSyncAllDialogOpen(false);
      toast.info("Syncing all subscriptions... This may take a moment.");

      const response = await authFetch("/panel/api/admin/subscriptions/sync", {
        method: "PUT",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to sync all");

      setSyncResults(data);
      setSyncResultsDialogOpen(true);
      await fetchData();

      toast.success(
        `Sync complete: ${data.synced} synced, ${data.failed} failed`
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to sync all subscriptions");
    } finally {
      setSyncingAll(false);
    }
  };

  // ────────────────────────────────────────────────
  // B2B Plan CRUD handlers
  // ────────────────────────────────────────────────
  const openCreateB2BPlanDialog = () => {
    setEditingB2BPlan(null);
    setB2bPlanForm(emptyB2BPlan);
    setB2bFeaturesInput("");
    setIsB2BPlanDialogOpen(true);
  };

  const openEditB2BPlanDialog = (plan: B2BPlan) => {
    setEditingB2BPlan(plan);
    setB2bPlanForm({ ...plan });
    setB2bFeaturesInput(plan.features.join("\n"));
    setIsB2BPlanDialogOpen(true);
  };

  const handleSaveB2BPlan = async () => {
    if (!b2bPlanForm.name.trim() || b2bPlanForm.price <= 0) {
      toast.error("Plan name and price (greater than 0) are required");
      return;
    }

    try {
      setSavingB2BPlan(true);

      const payload = {
        ...b2bPlanForm,
        features: b2bFeaturesInput
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        price: Number(b2bPlanForm.price),
        maxUsers: Number(b2bPlanForm.maxUsers),
      };

      let res: Response;

      if (editingB2BPlan) {
        res = await authFetch(
          `/panel/api/admin/subscription-plans/${editingB2BPlan.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          }
        );
      } else {
        res = await authFetch("/panel/api/admin/subscription-plans", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save plan");
      }

      const savedPlan = await res.json();

      setB2bPlans((prev) =>
        editingB2BPlan
          ? prev.map((p) => (p.id === editingB2BPlan.id ? savedPlan : p))
          : [...prev, savedPlan]
      );

      toast.success(
        editingB2BPlan
          ? "Plan updated successfully"
          : "Plan created successfully"
      );
      setIsB2BPlanDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving B2B plan:", error);
      toast.error(error.message || "Failed to save plan");
    } finally {
      setSavingB2BPlan(false);
    }
  };

  const handleDeleteB2BPlan = async () => {
    if (!deletingB2BPlan) return;

    try {
      const res = await authFetch(
        `/panel/api/admin/subscription-plans/${deletingB2BPlan.id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Failed to delete plan");

      setB2bPlans((prev) => prev.filter((p) => p.id !== deletingB2BPlan.id));
      toast.success("Plan deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete plan");
    } finally {
      setDeletingB2BPlan(null);
    }
  };

  const toggleB2BPlanActive = async (plan: B2BPlan) => {
    try {
      const newActive = !plan.isActive;
      const res = await authFetch(
        `/panel/api/admin/subscription-plans/${plan.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ isActive: newActive }),
        }
      );

      if (!res.ok) throw new Error("Failed to update plan status");

      setB2bPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, isActive: newActive } : p))
      );

      toast.success(`Plan ${newActive ? "activated" : "deactivated"}`);
    } catch (error) {
      console.log(error);
      toast.error("Failed to update plan status");
    }
  };

  // ────────────────────────────────────────────────
  // Filtering & Formatting helpers
  // ────────────────────────────────────────────────
  const filteredB2C = b2cSubscribers.filter((sub) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (sub.name?.toLowerCase().includes(q) ?? false) ||
      (sub.email?.toLowerCase().includes(q) ?? false);

    const status = sub.subscription?.status || "no_subscription";
    const matchesStatus =
      b2cStatusFilter === "all" || status === b2cStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredB2B = companies.filter((company) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      company.name.toLowerCase().includes(q) ||
      (company.industry?.toLowerCase().includes(q) ?? false);

    const matchesStatus =
      b2bStatusFilter === "all" || company.status === b2bStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatPrice = (amount: number, currency: string = "usd") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);

  const formatB2BPrice = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const formatDate = (timestamp: number) =>
    new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatRelativeDate = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = timestamp - now;
    const days = Math.floor(diff / 86400);
    if (days < -1) return `${Math.abs(days)} days ago`;
    if (days === -1) return "Yesterday";
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days < 30) return `In ${days} days`;
    return formatDate(timestamp);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getPlanIcon = (planName: string) => {
    const lower = planName.toLowerCase();
    for (const [key, Icon] of Object.entries(planIcons)) {
      if (lower.includes(key)) return Icon;
    }
    return Star;
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name)
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    if (email) return email.slice(0, 2).toUpperCase();
    return "?";
  };

  const needsSync = (sub: B2CSubscriber) => {
    if (!sub.subscription?.stripeCustomerId) return false;
    if (!sub.subscription?.subscriptionId) return true;
    const lastUpdate = sub.subscription?.updatedAt || 0;
    return Date.now() - lastUpdate > 3600000; // 1 hour
  };

  const getB2BPlanName = (planId: string) => {
    return b2bPlans.find((p) => p.id === planId)?.name || planId || "No Plan";
  };

  // ────────────────────────────────────────────────
  // Loading state
  // ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  // ────────────────────────────────────────────────
  // Main render
  // ────────────────────────────────────────────────
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
              Manage B2C subscriptions (Stripe) and B2B companies
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
              Stripe Dashboard
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Monthly Revenue
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    $
                    {(stats?.mrr || 0).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Active Subscriptions
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {stats?.activeSubscriptions || 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">B2B Companies</p>
                  <p className="text-2xl font-bold mt-1">
                    {stats?.activeB2BCompanies ||
                      companies.filter((c) => c.status === "active").length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Needs Attention
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {(stats?.pastDueSubscriptions || 0) +
                      (stats?.cancelingSubscriptions || 0)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={item}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
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
            <TabsContent value="overview" className="space-y-8">
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
                      <div className="text-center py-10 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No subscribers yet</p>
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
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <Link
                                href={`/dashboard/users/${sub.id}`}
                                className="flex items-center gap-3 flex-1"
                              >
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                  {sub.photoURL ? (
                                    <Image
                                      src={sub.photoURL}
                                      alt={sub.name || ""}
                                      width={40}
                                      height={40}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-sm font-semibold text-primary">
                                      {getInitials(sub.name, sub.email)}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {sub.name || sub.email || "Unknown"}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {sub.subscription?.planName || "No Plan"}
                                  </p>
                                </div>
                              </Link>
                              <div className="flex items-center gap-2">
                                {sub.subscription?.cancelAtPeriodEnd && (
                                  <Badge variant="outline" className="text-xs">
                                    Canceling
                                  </Badge>
                                )}
                                <Badge variant={status.variant}>
                                  <StatusIcon className="h-3.5 w-3.5 mr-1" />
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

                {/* Recent B2B Companies */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-purple-500" />
                        Recent Companies
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
                      <div className="text-center py-10 text-muted-foreground">
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
                              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                                    <Building2 className="h-5 w-5 text-purple-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {company.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {getB2BPlanName(company.plan)}
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

              {/* Attention alerts */}
              {((stats?.pastDueSubscriptions || 0) > 0 ||
                (stats?.cancelingSubscriptions || 0) > 0) && (
                <div className="grid md:grid-cols-2 gap-5">
                  {stats?.pastDueSubscriptions ? (
                    <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-800/50">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          <div>
                            <p className="font-medium">
                              {stats.pastDueSubscriptions} past due
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Payment issues - review required
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}

                  {stats?.cancelingSubscriptions ? (
                    <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-yellow-800/50">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                          <div>
                            <p className="font-medium">
                              {stats.cancelingSubscriptions} canceling
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Access ends at period close
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                </div>
              )}
            </TabsContent>

            {/* B2C Tab */}
            <TabsContent value="b2c" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative flex-1 w-full">
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
                    <Button variant="outline" className="min-w-35">
                      <Filter className="h-4 w-4 mr-2" />
                      {b2cStatusFilter === "all"
                        ? "All Status"
                        : subscriptionStatusConfig[b2cStatusFilter]?.label ||
                          b2cStatusFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
                    <div className="text-center py-16 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">
                        No matching subscribers found
                      </p>
                      <p className="text-sm mt-2">
                        {searchQuery || b2cStatusFilter !== "all"
                          ? "Try different filters"
                          : "Subscribers appear after Stripe checkout"}
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
                                        src={sub.photoURL}
                                        alt={sub.name || "user"}
                                        width={40}
                                        height={40}
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
                                      {sub.email || "—"}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {sub.subscription?.planName || "—"}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {sub.subscription?.currentPeriodEnd ? (
                                  <div className="flex flex-col text-sm">
                                    <span>
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
                                  "—"
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Badge variant={status.variant}>
                                    <StatusIcon className="h-3.5 w-3.5 mr-1" />
                                    {status.label}
                                  </Badge>
                                  {sub.subscription?.cancelAtPeriodEnd && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs hidden sm:inline-flex"
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
                                          onClick={() => {
                                            const id =
                                              sub.subscription?.subscriptionId;
                                            if (!id) return;

                                            copyToClipboard(
                                              id,
                                              "Subscription ID"
                                            );
                                          }}
                                        >
                                          <Copy className="h-4 w-4 mr-2" />
                                          Copy Sub ID
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          disabled={
                                            !sub.subscription?.subscriptionId
                                          }
                                          onClick={() => {
                                            const id =
                                              sub.subscription!.subscriptionId!;
                                            window.open(
                                              `https://dashboard.stripe.com/subscriptions/${id}`,
                                              "_blank"
                                            );
                                          }}
                                        >
                                          <ExternalLink className="h-4 w-4 mr-2" />
                                          View in Stripe
                                        </DropdownMenuItem>
                                      </>
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
            <TabsContent value="b2b" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative flex-1 w-full">
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
                    <Button variant="outline" className="min-w-35">
                      <Filter className="h-4 w-4 mr-2" />
                      {b2bStatusFilter === "all"
                        ? "All Status"
                        : companyStatusConfig[b2bStatusFilter]?.label ||
                          b2bStatusFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
                <Button asChild>
                  <Link href="/dashboard/companies">
                    <Building2 className="h-4 w-4 mr-2" />
                    Manage Companies
                  </Link>
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  {filteredB2B.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">
                        No matching companies
                      </p>
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
                                  className="block"
                                >
                                  <div className="flex items-center gap-3 hover:underline">
                                    <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center shrink-0">
                                      <Building2 className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-medium truncate">
                                        {company.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground truncate">
                                        {company.industry || "—"}
                                      </p>
                                    </div>
                                  </div>
                                </Link>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {getB2BPlanName(company.plan)}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <span className="text-sm">
                                  {company.currentUsers || 0} /{" "}
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
            <TabsContent value="plans" className="space-y-10">
              {/* B2C Plans (Stripe) */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      B2C Plans (Stripe)
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Managed in Stripe Dashboard
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href="https://dashboard.stripe.com/products"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Manage in Stripe
                    </a>
                  </Button>
                </div>

                {stripePlans.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-60" />
                      <h4 className="text-lg font-medium">
                        No B2C plans found
                      </h4>
                      <p className="mt-2">
                        Create subscription products in Stripe
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stripePlans.map((plan) => {
                      const PlanIcon = getPlanIcon(plan.name);
                      const isPopular = plan.metadata?.popular === "true";
                      const count = b2cSubscribers.filter(
                        (s) =>
                          s.subscription?.priceId === plan.priceId &&
                          s.subscription?.status === "active"
                      ).length;

                      return (
                        <Card
                          key={plan.priceId}
                          className={`relative ${
                            isPopular ? "border-primary shadow-md" : ""
                          }`}
                        >
                          {isPopular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                              <Badge className="bg-primary text-primary-foreground">
                                Popular
                              </Badge>
                            </div>
                          )}
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div
                                className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                                  isPopular
                                    ? "bg-primary text-white"
                                    : "bg-primary/10"
                                }`}
                              >
                                <PlanIcon
                                  className={`h-6 w-6 ${
                                    isPopular ? "" : "text-primary"
                                  }`}
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  window.open(
                                    `https://dashboard.stripe.com/products/${plan.productId}`,
                                    "_blank"
                                  )
                                }
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>

                            <h4 className="font-bold text-xl">{plan.name}</h4>

                            <div className="mt-2 mb-4">
                              <span className="text-3xl font-bold">
                                {formatPrice(plan.price, plan.currency)}
                              </span>
                              <span className="text-muted-foreground">
                                {" "}
                                /{plan.interval}
                              </span>
                            </div>

                            <div className="text-sm text-muted-foreground mb-5 flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {count} active{" "}
                              {count === 1 ? "subscriber" : "subscribers"}
                            </div>

                            {plan.features.length > 0 && (
                              <ul className="space-y-2 text-sm">
                                {plan.features
                                  .slice(0, 4)
                                  .map((feature, idx) => (
                                    <li
                                      key={idx}
                                      className="flex items-start gap-2"
                                    >
                                      <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                      {feature}
                                    </li>
                                  ))}
                                {plan.features.length > 4 && (
                                  <li className="text-xs text-muted-foreground pl-6">
                                    +{plan.features.length - 4} more
                                  </li>
                                )}
                              </ul>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* ────────────────────────────────
                    Restored Stripe Guidance Section
                ──────────────────────────────── */}
                <Card className="mt-10 border-dashed">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      How to Configure Plans in Stripe
                    </CardTitle>
                    <CardDescription>
                      Use product metadata to control how plans appear in this
                      admin dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            1
                          </span>
                          Required Metadata
                        </h4>
                        <ul className="space-y-3 text-sm">
                          <li className="flex items-start gap-3">
                            <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                              type
                            </code>
                            <span className="text-muted-foreground">
                              Must be set to{" "}
                              <code className="bg-muted px-1.5 rounded">
                                b2c
                              </code>
                            </span>
                          </li>
                          <li className="flex items-start gap-3">
                            <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                              features
                            </code>
                            <span className="text-muted-foreground">
                              JSON array of strings:
                              <br />
                              <code className="bg-muted px-1.5 rounded text-xs">
                                [&quot;Unlimited storage&quot;, &quot;Priority
                                support&quot;]
                              </code>
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            2
                          </span>
                          Optional / Recommended Metadata
                        </h4>
                        <ul className="space-y-3 text-sm">
                          <li className="flex items-start gap-3">
                            <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                              popular
                            </code>
                            <span className="text-muted-foreground">
                              Set to <code>true</code> to highlight as most
                              popular plan
                            </span>
                          </li>
                          <li className="flex items-start gap-3">
                            <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                              sortOrder
                            </code>
                            <span className="text-muted-foreground">
                              Numeric value (1 = first, 2 = second, etc.)
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-3">
                        Example Metadata (ready to copy-paste)
                      </h4>
                      <pre className="bg-muted p-4 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {`{
  "type": "b2c",
  "features": "[\\"Unlimited projects\\", \\"Priority support 24/7\\", \\"Custom reports\\", \\"SSO & team invites\\"]",
  "popular": "true",
  "sortOrder": "2"
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator className="my-12" />

              {/* B2B Plans Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-purple-600" />
                      B2B Plans
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create and manage subscription tiers for companies
                    </p>
                  </div>
                  <Button onClick={openCreateB2BPlanDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add B2B Plan
                  </Button>
                </div>

                {b2bPlans.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-60" />
                      <h4 className="text-lg font-medium">No B2B plans yet</h4>
                      <Button
                        className="mt-6"
                        onClick={openCreateB2BPlanDialog}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Plan
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {b2bPlans.map((plan) => {
                      const companyCount = companies.filter(
                        (c) => c.plan === plan.id
                      ).length;

                      return (
                        <Card
                          key={plan.id}
                          className={`relative ${
                            !plan.isActive ? "opacity-65 border-dashed" : ""
                          }`}
                        >
                          {!plan.isActive && (
                            <div className="absolute -top-2 -right-2">
                              <Badge variant="secondary">Inactive</Badge>
                            </div>
                          )}
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-purple-600" />
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => openEditB2BPlanDialog(plan)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => toggleB2BPlanActive(plan)}
                                  >
                                    {plan.isActive ? (
                                      <>
                                        <X className="h-4 w-4 mr-2" />
                                        Deactivate
                                      </>
                                    ) : (
                                      <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Activate
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setDeletingB2BPlan(plan)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <h4 className="font-bold text-xl">{plan.name}</h4>

                            <div className="mt-2 mb-5">
                              <span className="text-3xl font-bold">
                                {formatB2BPrice(plan.price)}
                              </span>
                              <span className="text-muted-foreground">
                                /{plan.billingCycle === "yearly" ? "yr" : "mo"}
                              </span>
                            </div>

                            <div className="space-y-1.5 text-sm text-muted-foreground mb-6">
                              <div>
                                Max users:{" "}
                                <span className="font-medium">
                                  {plan.maxUsers === -1
                                    ? "Unlimited"
                                    : plan.maxUsers}
                                </span>
                              </div>
                              <div>
                                {companyCount} compan
                                {companyCount === 1 ? "y" : "ies"} using this
                                plan
                              </div>
                            </div>

                            {plan.description && (
                              <p className="text-sm mb-5 text-muted-foreground border-l-2 pl-3 border-muted-foreground/40">
                                {plan.description}
                              </p>
                            )}

                            {plan.features.length > 0 && (
                              <ul className="space-y-2 text-sm">
                                {plan.features.slice(0, 4).map((f, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2"
                                  >
                                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    {f}
                                  </li>
                                ))}
                                {plan.features.length > 4 && (
                                  <li className="text-xs text-muted-foreground pl-6">
                                    +{plan.features.length - 4} more features
                                  </li>
                                )}
                              </ul>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>

      {/* Sync All Confirmation */}
      <AlertDialog open={syncAllDialogOpen} onOpenChange={setSyncAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sync All Subscriptions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will refresh subscription data from Stripe for all users with
              a customer ID ({b2cSubscribers.length} records). This may take a
              few moments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={syncAllSubscriptions}
              disabled={syncingAll}
            >
              {syncingAll ? "Syncing..." : "Sync All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sync Results */}
      <Dialog
        open={syncResultsDialogOpen}
        onOpenChange={setSyncResultsDialogOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Sync Complete</DialogTitle>
            <DialogDescription>
              Latest subscription data loaded from Stripe
            </DialogDescription>
          </DialogHeader>

          {syncResults && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                  <CardContent className="p-5 text-center">
                    <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold">{syncResults.synced}</p>
                    <p className="text-sm text-muted-foreground">Synced</p>
                  </CardContent>
                </Card>
                <Card className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
                  <CardContent className="p-5 text-center">
                    <AlertCircle className="h-10 w-10 text-yellow-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold">
                      {syncResults.noSubscription}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      No Subscription
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
                  <CardContent className="p-5 text-center">
                    <XCircle className="h-10 w-10 text-red-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold">{syncResults.failed}</p>
                    <p className="text-sm text-muted-foreground">Failed</p>
                  </CardContent>
                </Card>
              </div>

              {syncResults.details.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Details</h4>
                  <ScrollArea className="h-64 rounded-md border">
                    <div className="p-3 space-y-2">
                      {syncResults.details.map((detail, idx) => {
                        const cfg =
                          subscriptionStatusConfig[detail.status] ||
                          subscriptionStatusConfig.no_subscription;
                        const Icon = cfg.icon;
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-2 px-3 rounded hover:bg-muted/60 text-sm"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {detail.userId.slice(0, 8)}…
                              </code>
                              {detail.planName && (
                                <span className="text-muted-foreground truncate">
                                  {detail.planName}
                                </span>
                              )}
                            </div>
                            <Badge variant={cfg.variant} className="shrink-0">
                              <Icon className="h-3.5 w-3.5 mr-1" />
                              {cfg.label}
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

      {/* B2B Plan Create/Edit Dialog */}
      <Dialog open={isB2BPlanDialogOpen} onOpenChange={setIsB2BPlanDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingB2BPlan ? "Edit B2B Plan" : "Create B2B Plan"}
            </DialogTitle>
            <DialogDescription>
              {editingB2BPlan
                ? "Update details for this business subscription tier."
                : "Define a new subscription plan for company customers."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="plan-name">Plan Name *</Label>
                <Input
                  id="plan-name"
                  value={b2bPlanForm.name}
                  onChange={(e) =>
                    setB2bPlanForm({ ...b2bPlanForm, name: e.target.value })
                  }
                  placeholder="e.g. Enterprise"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (USD) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="1"
                  value={b2bPlanForm.price || ""}
                  onChange={(e) =>
                    setB2bPlanForm({
                      ...b2bPlanForm,
                      price: e.target.value === "" ? 0 : Number(e.target.value),
                    })
                  }
                  placeholder="299"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="billing-cycle">Billing Cycle</Label>
                <Select
                  value={b2bPlanForm.billingCycle}
                  onValueChange={(value: "monthly" | "yearly") =>
                    setB2bPlanForm({ ...b2bPlanForm, billingCycle: value })
                  }
                >
                  <SelectTrigger id="billing-cycle">
                    <SelectValue placeholder="Select cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Maximum Users</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="1"
                    value={
                      b2bPlanForm.maxUsers === -1 ? "" : b2bPlanForm.maxUsers
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      setB2bPlanForm({
                        ...b2bPlanForm,
                        maxUsers: val === "" ? -1 : Number(val),
                      });
                    }}
                    className="max-w-40"
                    placeholder="50"
                  />
                  <div className="flex items-center gap-2">
                    <Switch
                      id="unlimited-users"
                      checked={b2bPlanForm.maxUsers === -1}
                      onCheckedChange={(checked) =>
                        setB2bPlanForm({
                          ...b2bPlanForm,
                          maxUsers: checked ? -1 : 10,
                        })
                      }
                    />
                    <Label
                      htmlFor="unlimited-users"
                      className="cursor-pointer text-sm"
                    >
                      Unlimited
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={b2bPlanForm.description}
                onChange={(e) =>
                  setB2bPlanForm({
                    ...b2bPlanForm,
                    description: e.target.value,
                  })
                }
                placeholder="Best value for growing teams — includes priority support, SSO, custom branding…"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Features (one per line)</Label>
              <Textarea
                value={b2bFeaturesInput}
                onChange={(e) => setB2bFeaturesInput(e.target.value)}
                placeholder="• Unlimited seats&#10;• Priority support 24/7&#10;• Custom branding&#10;• Advanced analytics"
                rows={6}
                className="font-mono text-sm leading-relaxed"
              />
              <p className="text-xs text-muted-foreground">
                Lines will be cleaned automatically — bullet points optional
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is-active"
                checked={b2bPlanForm.isActive}
                onCheckedChange={(checked) =>
                  setB2bPlanForm({ ...b2bPlanForm, isActive: checked })
                }
              />
              <Label htmlFor="is-active" className="cursor-pointer">
                Plan is active and visible to companies
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsB2BPlanDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveB2BPlan} disabled={savingB2BPlan}>
              {savingB2BPlan ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingB2BPlan ? (
                "Update Plan"
              ) : (
                "Create Plan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingB2BPlan}
        onOpenChange={() => setDeletingB2BPlan(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Companies currently subscribed to
              &quot;
              {deletingB2BPlan?.name}&quot; will need to be reassigned to
              another plan manually.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteB2BPlan}
            >
              Delete Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
