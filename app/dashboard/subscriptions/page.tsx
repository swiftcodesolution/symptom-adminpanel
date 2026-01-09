// app\dashboard\subscriptions\page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
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
  Download,
  Plus,
  Edit,
  Trash2,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";
import { useAuthFetch } from "@/lib/useAuthFetch";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const statusConfig = {
  active: {
    label: "Active",
    variant: "default" as const,
    icon: Check,
    color: "text-green-600",
  },
  cancelled: {
    label: "Cancelled",
    variant: "secondary" as const,
    icon: X,
    color: "text-gray-600",
  },
  expired: {
    label: "Expired",
    variant: "destructive" as const,
    icon: AlertCircle,
    color: "text-red-600",
  },
  trial: {
    label: "Trial",
    variant: "outline" as const,
    icon: Clock,
    color: "text-blue-600",
  },
  suspended: {
    label: "Suspended",
    variant: "destructive" as const,
    icon: AlertCircle,
    color: "text-red-600",
  },
  pending: {
    label: "Pending",
    variant: "outline" as const,
    icon: Clock,
    color: "text-yellow-600",
  },
};

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: "monthly" | "yearly";
  type: "b2c" | "b2b";
  features: string[];
  maxUsers: number;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

interface Company {
  id: string;
  name: string;
  industry: string;
  status: "active" | "suspended" | "pending" | "cancelled";
  activeSubscriptionId: string;
  userCapacity: number;
  currentUsers?: number;
}

interface B2CSubscriber {
  id: string;
  name: string;
  email: string;
  activeSubscriptionId: string;
  status: "active" | "trial" | "cancelled" | "expired";
}

const emptyPlan: Omit<SubscriptionPlan, "id" | "createdAt" | "updatedAt"> = {
  name: "",
  description: "",
  price: 0,
  billingCycle: "monthly",
  type: "b2c",
  features: [],
  maxUsers: 1,
  isActive: true,
};

export default function SubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [b2cStatusFilter, setB2cStatusFilter] = useState("all");
  const [b2bStatusFilter, setB2bStatusFilter] = useState("all");

  // Data states
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [b2cSubscribers, setB2cSubscribers] = useState<B2CSubscriber[]>([]);
  const [loading, setLoading] = useState(true);

  // Plan dialog states
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planForm, setPlanForm] = useState(emptyPlan);
  const [featuresInput, setFeaturesInput] = useState("");
  const [savingPlan, setSavingPlan] = useState(false);

  // Delete dialog state
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(
    null
  );

  const authFetch = useAuthFetch();

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [plansRes, companiesRes] = await Promise.all([
          authFetch("/panel/api/admin/subscription-plans"),
          authFetch("/panel/api/admin/companies"),
        ]);

        if (plansRes.ok) {
          const plansData = await plansRes.json();
          setPlans(plansData);
        }

        if (companiesRes.ok) {
          const companiesData = await companiesRes.json();
          setCompanies(
            companiesData.map((c: any) => ({
              id: c.companyId,
              name: c.name,
              industry: c.industry,
              status: c.status,
              activeSubscriptionId: c.plan,
              userCapacity: c.userCapacity,
              currentUsers: 0,
            }))
          );
        }

        // TODO: Fetch B2C subscribers when you have that endpoint
        setB2cSubscribers([]);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load subscription data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate stats
  const stats = {
    monthlyRevenue: plans.reduce((acc, plan) => {
      const subscriberCount =
        plan.type === "b2b"
          ? companies.filter((c) => c.activeSubscriptionId === plan.id).length
          : b2cSubscribers.filter((s) => s.activeSubscriptionId === plan.id)
              .length;
      return acc + plan.price * subscriberCount;
    }, 0),
    activeB2CSubscriptions: b2cSubscribers.filter((s) => s.status === "active")
      .length,
    totalB2CSubscriptions: b2cSubscribers.length,
    activeCompanies: companies.filter((c) => c.status === "active").length,
    totalCompanies: companies.length,
    trialUsers: b2cSubscribers.filter((s) => s.status === "trial").length,
    churnRate: 0,
  };

  // Filter functions
  const filteredB2C = b2cSubscribers.filter((sub) => {
    const matchesSearch = sub.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      b2cStatusFilter === "all" || sub.status === b2cStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredB2B = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      b2bStatusFilter === "all" || company.status === b2bStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const b2cPlans = plans.filter((p) => p.type === "b2c");
  const b2bPlans = plans.filter((p) => p.type === "b2b");

  // Plan CRUD handlers
  const openCreatePlanDialog = (type: "b2c" | "b2b") => {
    setEditingPlan(null);
    setPlanForm({ ...emptyPlan, type });
    setFeaturesInput("");
    setIsPlanDialogOpen(true);
  };

  const openEditPlanDialog = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      billingCycle: plan.billingCycle,
      type: plan.type,
      features: plan.features,
      maxUsers: plan.maxUsers,
      isActive: plan.isActive,
    });
    setFeaturesInput(plan.features.join("\n"));
    setIsPlanDialogOpen(true);
  };

  const handleSavePlan = async () => {
    if (!planForm.name || planForm.price === undefined) {
      toast.error("Name and price are required");
      return;
    }

    try {
      setSavingPlan(true);

      const payload = {
        ...planForm,
        features: featuresInput
          .split("\n")
          .map((f) => f.trim())
          .filter((f) => f),
        price: Number(planForm.price),
        maxUsers: Number(planForm.maxUsers),
      };

      if (editingPlan) {
        // Update existing plan
        const res = await authFetch(
          `/panel/api/admin/subscription-plans/${editingPlan.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          }
        );

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to update plan");
        }

        setPlans((prev) =>
          prev.map((p) => (p.id === editingPlan.id ? { ...p, ...payload } : p))
        );
        toast.success("Plan updated successfully");
      } else {
        // Create new plan
        const res = await authFetch("/panel/api/admin/subscription-plans", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to create plan");
        }

        const newPlan = await res.json();
        setPlans((prev) => [...prev, newPlan]);
        toast.success("Plan created successfully");
      }

      setIsPlanDialogOpen(false);
    } catch (error) {
      console.error("Error saving plan:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save plan"
      );
    } finally {
      setSavingPlan(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!deletingPlan) return;

    try {
      const res = await authFetch(
        `/panel/api/admin/subscription-plans/${deletingPlan.id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete plan");
      }

      setPlans((prev) => prev.filter((p) => p.id !== deletingPlan.id));
      toast.success("Plan deleted successfully");
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete plan"
      );
    } finally {
      setDeletingPlan(null);
    }
  };

  const togglePlanActive = async (plan: SubscriptionPlan) => {
    try {
      const res = await authFetch(
        `/panel/api/admin/subscription-plans/${plan.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ isActive: !plan.isActive }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update plan");
      }

      setPlans((prev) =>
        prev.map((p) =>
          p.id === plan.id ? { ...p, isActive: !p.isActive } : p
        )
      );
      toast.success(`Plan ${plan.isActive ? "deactivated" : "activated"}`);
    } catch (error) {
      console.error("Error toggling plan active status:", error);
      toast.error("Failed to update plan status");
    }
  };

  // Get plan name by ID
  const getPlanName = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    return plan?.name || planId || "No Plan";
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
            <h1 className="text-2xl md:text-3xl font-bold">Subscriptions</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage B2C and B2B subscriptions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
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
                    ${stats.monthlyRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    From {plans.length} plans
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
                    B2C Subscribers
                  </p>
                  <p className="text-2xl font-bold">
                    {stats.activeB2CSubscriptions}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.totalB2CSubscriptions} total
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
                  <p className="text-2xl font-bold">{stats.activeCompanies}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.totalCompanies} total
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
                  <p className="text-xs text-muted-foreground">Active Plans</p>
                  <p className="text-2xl font-bold">
                    {plans.filter((p) => p.isActive).length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {plans.length} total plans
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-orange-600" />
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
              <TabsTrigger value="b2c">B2C Subscriptions</TabsTrigger>
              <TabsTrigger value="b2b">B2B Companies</TabsTrigger>
              <TabsTrigger value="plans">Plans</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent B2C */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        Recent B2C Subscribers
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
                        <p>No B2C subscribers yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {b2cSubscribers.slice(0, 5).map((sub) => {
                          const status = statusConfig[sub.status];
                          return (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between p-3 rounded-lg border"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-sm font-semibold text-primary">
                                    {sub.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-sm">
                                    {sub.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {getPlanName(sub.activeSubscriptionId)}
                                  </p>
                                </div>
                              </div>
                              <Badge variant={status.variant}>
                                {status.label}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent B2B */}
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
                          const status = statusConfig[company.status];
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
                                      {getPlanName(
                                        company.activeSubscriptionId
                                      )}
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
            </TabsContent>

            {/* B2C Tab */}
            <TabsContent value="b2c" className="mt-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search subscribers..."
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
                        : statusConfig[
                            b2cStatusFilter as keyof typeof statusConfig
                          ]?.label}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setB2cStatusFilter("all")}>
                      All Status
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setB2cStatusFilter("active")}
                    >
                      Active
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setB2cStatusFilter("trial")}
                    >
                      Trial
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setB2cStatusFilter("cancelled")}
                    >
                      Cancelled
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Card>
                <CardContent className="p-6">
                  {filteredB2C.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No B2C subscribers found</p>
                      <p className="text-sm mt-1">
                        B2C subscriptions will appear here when users subscribe
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subscriber</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredB2C.map((sub) => {
                          const status = statusConfig[sub.status];
                          return (
                            <TableRow key={sub.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-primary">
                                      {sub.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium">{sub.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {sub.email}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {getPlanName(sub.activeSubscriptionId)}
                                </Badge>
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
                                    <DropdownMenuItem>
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      Change Plan
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">
                                      Cancel Subscription
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
                        : statusConfig[
                            b2bStatusFilter as keyof typeof statusConfig
                          ]?.label}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setB2bStatusFilter("all")}>
                      All Status
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setB2bStatusFilter("active")}
                    >
                      Active
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setB2bStatusFilter("pending")}
                    >
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setB2bStatusFilter("suspended")}
                    >
                      Suspended
                    </DropdownMenuItem>
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
                          const status = statusConfig[company.status];
                          return (
                            <TableRow key={company.id}>
                              <TableCell>
                                <Link
                                  href={`/dashboard/companies/${company.id}`}
                                >
                                  <div className="flex items-center gap-3 cursor-pointer">
                                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                      <Building2 className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium hover:underline">
                                        {company.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {company.industry}
                                      </p>
                                    </div>
                                  </div>
                                </Link>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {getPlanName(company.activeSubscriptionId)}
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

            {/* Plans Tab - UPDATED WITH CRUD */}
            <TabsContent value="plans" className="mt-6 space-y-6">
              {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="h-48 bg-muted animate-pulse rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  {/* B2C Plans */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        B2C Plans
                      </h3>
                      <Button
                        size="sm"
                        onClick={() => openCreatePlanDialog("b2c")}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add B2C Plan
                      </Button>
                    </div>

                    {b2cPlans.length === 0 ? (
                      <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                          <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>No B2C plans yet</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => openCreatePlanDialog("b2c")}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create First B2C Plan
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {b2cPlans.map((plan) => (
                          <Card
                            key={plan.id}
                            className={`relative ${
                              !plan.isActive ? "opacity-60" : ""
                            }`}
                          >
                            {!plan.isActive && (
                              <div className="absolute -top-2 -right-2">
                                <Badge variant="secondary">Inactive</Badge>
                              </div>
                            )}
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h4 className="font-bold text-lg">
                                    {plan.name}
                                  </h4>
                                  <div className="mt-1">
                                    <span className="text-2xl font-bold">
                                      ${plan.price}
                                    </span>
                                    <span className="text-muted-foreground">
                                      /
                                      {plan.billingCycle === "yearly"
                                        ? "yr"
                                        : "mo"}
                                    </span>
                                  </div>
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
                                      onClick={() => openEditPlanDialog(plan)}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => togglePlanActive(plan)}
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
                                      className="text-destructive"
                                      onClick={() => setDeletingPlan(plan)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              {plan.description && (
                                <p className="text-sm text-muted-foreground mb-4">
                                  {plan.description}
                                </p>
                              )}

                              <ul className="space-y-2">
                                {plan.features
                                  .slice(0, 4)
                                  .map((feature, idx) => (
                                    <li
                                      key={idx}
                                      className="flex items-start gap-2 text-sm"
                                    >
                                      <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                      {feature}
                                    </li>
                                  ))}
                                {plan.features.length > 4 && (
                                  <li className="text-xs text-muted-foreground">
                                    +{plan.features.length - 4} more features
                                  </li>
                                )}
                              </ul>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* B2B Plans */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-purple-500" />
                        B2B Plans
                      </h3>
                      <Button
                        size="sm"
                        onClick={() => openCreatePlanDialog("b2b")}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add B2B Plan
                      </Button>
                    </div>

                    {b2bPlans.length === 0 ? (
                      <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                          <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>No B2B plans yet</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => openCreatePlanDialog("b2b")}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create First B2B Plan
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {b2bPlans.map((plan) => (
                          <Card
                            key={plan.id}
                            className={`relative ${
                              !plan.isActive ? "opacity-60" : ""
                            }`}
                          >
                            {!plan.isActive && (
                              <div className="absolute -top-2 -right-2">
                                <Badge variant="secondary">Inactive</Badge>
                              </div>
                            )}
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h4 className="font-bold text-lg">
                                    {plan.name}
                                  </h4>
                                  <div className="mt-1">
                                    <span className="text-2xl font-bold">
                                      ${plan.price}
                                    </span>
                                    <span className="text-muted-foreground">
                                      /mo
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Up to{" "}
                                    {plan.maxUsers === -1
                                      ? "Unlimited"
                                      : plan.maxUsers}{" "}
                                    users
                                  </p>
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
                                      onClick={() => openEditPlanDialog(plan)}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => togglePlanActive(plan)}
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
                                      className="text-destructive"
                                      onClick={() => setDeletingPlan(plan)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              {plan.description && (
                                <p className="text-sm text-muted-foreground mb-4">
                                  {plan.description}
                                </p>
                              )}

                              <ul className="space-y-2">
                                {plan.features
                                  .slice(0, 4)
                                  .map((feature, idx) => (
                                    <li
                                      key={idx}
                                      className="flex items-start gap-2 text-sm"
                                    >
                                      <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                      {feature}
                                    </li>
                                  ))}
                                {plan.features.length > 4 && (
                                  <li className="text-xs text-muted-foreground">
                                    +{plan.features.length - 4} more features
                                  </li>
                                )}
                              </ul>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>

      {/* Create/Edit Plan Dialog */}
      <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPlan
                ? "Edit Plan"
                : `Create ${planForm.type.toUpperCase()} Plan`}
            </DialogTitle>
            <DialogDescription>
              {editingPlan
                ? "Update the subscription plan details."
                : "Create a new subscription plan for your users."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan-name">Plan Name</Label>
                <Input
                  id="plan-name"
                  placeholder="e.g., Premium"
                  value={planForm.name}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-price">Price ($)</Label>
                <Input
                  id="plan-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="9.99"
                  value={planForm.price}
                  onChange={(e) =>
                    setPlanForm({
                      ...planForm,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billing-cycle">Billing Cycle</Label>
                <Select
                  value={planForm.billingCycle}
                  onValueChange={(value: "monthly" | "yearly") =>
                    setPlanForm({ ...planForm, billingCycle: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-users">
                  Max Users {planForm.type === "b2c" && "(Usually 1 for B2C)"}
                </Label>
                <Input
                  id="max-users"
                  type="number"
                  min="-1"
                  placeholder="-1 for unlimited"
                  value={planForm.maxUsers}
                  onChange={(e) =>
                    setPlanForm({
                      ...planForm,
                      maxUsers: parseInt(e.target.value) || 1,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Use -1 for unlimited
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-description">Description</Label>
              <Input
                id="plan-description"
                placeholder="Brief description of this plan"
                value={planForm.description}
                onChange={(e) =>
                  setPlanForm({ ...planForm, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-features">Features (one per line)</Label>
              <Textarea
                id="plan-features"
                placeholder="Unlimited symptom tracking&#10;AI health insights&#10;Priority support"
                rows={5}
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">
                  Inactive plans won&apos;t be shown to new subscribers
                </p>
              </div>
              <Switch
                checked={planForm.isActive}
                onCheckedChange={(checked) =>
                  setPlanForm({ ...planForm, isActive: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPlanDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSavePlan} disabled={savingPlan}>
              {savingPlan
                ? "Saving..."
                : editingPlan
                ? "Update Plan"
                : "Create Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingPlan}
        onOpenChange={() => setDeletingPlan(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingPlan?.name}&quot;?
              This action cannot be undone. Plans with active subscribers cannot
              be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlan}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
