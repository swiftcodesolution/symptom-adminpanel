/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  Search,
  Filter,
  Plus,
  Users,
  Calendar,
  Mail,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";
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
    color: "bg-green-500",
  },
  suspended: {
    label: "Suspended",
    variant: "destructive" as const,
    color: "bg-red-500",
  },
  pending: {
    label: "Pending",
    variant: "outline" as const,
    color: "bg-yellow-500",
  },
  cancelled: {
    label: "Cancelled",
    variant: "secondary" as const,
    color: "bg-gray-500",
  },
};

interface Company {
  companyId: string;
  name: string;
  industry: string;
  email: string;
  phone?: string;
  address?: string;
  status: "active" | "suspended" | "pending" | "cancelled";
  plan: string;
  userCapacity: number;
  contractEndDate?: string | null;
  currentUsers: number;
  planName?: string;
  maxUsers: number;
}

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
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlan[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "suspended" | "pending" | "cancelled"
  >("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");

  const authFetch = useAuthFetch();

  // Fetch companies
  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);

      const res = await authFetch("/panel/api/admin/companies");
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to fetch companies");
      }
      const data = await res.json();

      const enriched: Company[] = data.map((c: any) => ({
        companyId: c.companyId,
        name: c.name || "",
        industry: c.industry || "",
        email: c.email || "",
        phone: c.phone,
        address: c.address,
        status: c.status || "pending",
        plan: c.plan || "none",
        userCapacity: c.userCapacity || 0,
        contractEndDate: c.contractEndDate,
        currentUsers: 0,
        planName:
          c.plan === "none"
            ? "No Plan"
            : c.plan.charAt(0).toUpperCase() + c.plan.slice(1),
        maxUsers: c.userCapacity || 0,
      }));

      setCompanies(enriched);
    } catch {
      toast.error("Unable to load companies. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  // Fetch subscription plans (B2B only, active only)
  const fetchSubscriptionPlans = useCallback(async () => {
    try {
      setLoadingPlans(true);

      const res = await authFetch("/panel/api/admin/subscription-plans");
      if (!res.ok) {
        throw new Error("Failed to fetch subscription plans");
      }
      const data: SubscriptionPlan[] = await res.json();

      // Filter to only B2B and active plans
      const b2bPlans = data.filter(
        (plan) => plan.type === "b2b" && plan.isActive
      );
      setSubscriptionPlans(b2bPlans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Unable to load subscription plans.");
    } finally {
      setLoadingPlans(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch plans when dialog opens
  useEffect(() => {
    if (isCreateDialogOpen) {
      fetchSubscriptionPlans();
    }
  }, [isCreateDialogOpen, fetchSubscriptionPlans]);

  useEffect(() => {
    const filtered = companies.filter((company) => {
      const matchesSearch =
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || company.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredCompanies(filtered);
  }, [companies, searchQuery, statusFilter]);

  const stats = {
    total: companies.length,
    active: companies.filter((c) => c.status === "active").length,
    pending: companies.filter((c) => c.status === "pending").length,
    suspended: companies.filter((c) => c.status === "suspended").length,
  };

  // Get selected plan details
  const selectedPlan = subscriptionPlans.find((p) => p.id === selectedPlanId);

  const handleCreateCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!selectedPlanId) {
      toast.error("Please select a subscription plan");
      return;
    }

    const payload = {
      name: formData.get("company-name"),
      industry: formData.get("industry"),
      email: formData.get("email"),
      phone: formData.get("phone") || undefined,
      address: formData.get("address") || undefined,
      activeSubscriptionId: selectedPlanId,
      userCapacity: selectedPlan?.maxUsers || 0,
      contractEndDate: formData.get("contract-end") || null,
      billingContact: {
        name: formData.get("billing-name"),
        email: formData.get("billing-email"),
        phone: formData.get("billing-phone"),
      },
      adminCredentials: {
        username: formData.get("admin-username"),
        password: formData.get("admin-password"),
      },
      status: "pending" as const,
    };

    try {
      setCreating(true);
      const res = await authFetch("/panel/api/admin/companies", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create company");
      }

      toast.success("Company created successfully.");
      setIsCreateDialogOpen(false);
      setSelectedPlanId("");

      // Refetch companies
      await fetchCompanies();
    } catch {
      toast.error("Failed to create company. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  // Helper to format plan display
  const formatPlanLabel = (plan: SubscriptionPlan) => {
    const userLimit =
      plan.maxUsers === -1 ? "Unlimited" : `${plan.maxUsers} users`;
    const cycle = plan.billingCycle === "yearly" ? "/yr" : "/mo";
    return `${plan.name} - $${plan.price}${cycle} (${userLimit})`;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Companies</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage B2B company accounts
            </p>
          </div>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) {
                setSelectedPlanId("");
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleCreateCompany}>
                <DialogHeader>
                  <DialogTitle>Create New Company</DialogTitle>
                  <DialogDescription>
                    Add a new B2B company account. You&apos;ll be able to add
                    users after creating the company.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input
                        id="company-name"
                        name="company-name"
                        placeholder="e.g., Acme Corporation"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Select name="industry" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="food">Food & Beverage</SelectItem>
                          <SelectItem value="energy">Energy</SelectItem>
                          <SelectItem value="manufacturing">
                            Manufacturing
                          </SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Company Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="contact@company.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="Full company address"
                    />
                  </div>

                  <Separator />

                  {/* Subscription Plan Section */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Subscription Plan</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="plan">Select Plan</Label>
                        {loadingPlans ? (
                          <div className="flex items-center gap-2 h-10 px-3 border rounded-md">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">
                              Loading plans...
                            </span>
                          </div>
                        ) : subscriptionPlans.length === 0 ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 h-10 px-3 border rounded-md border-dashed">
                              <span className="text-sm text-muted-foreground">
                                No B2B plans available
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              <Link
                                href="/dashboard/subscriptions"
                                className="text-primary hover:underline"
                              >
                                Create a B2B plan first
                              </Link>{" "}
                              in the Subscriptions page.
                            </p>
                          </div>
                        ) : (
                          <Select
                            value={selectedPlanId}
                            onValueChange={setSelectedPlanId}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select subscription plan" />
                            </SelectTrigger>
                            <SelectContent>
                              {subscriptionPlans.map((plan) => (
                                <SelectItem key={plan.id} value={plan.id}>
                                  {formatPlanLabel(plan)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contract-end">Contract End Date</Label>
                        <Input
                          id="contract-end"
                          name="contract-end"
                          type="date"
                        />
                      </div>
                    </div>

                    {/* Selected Plan Details */}
                    {selectedPlan && (
                      <div className="p-4 rounded-lg border bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            {selectedPlan.name}
                          </span>
                          <Badge variant="outline">
                            ${selectedPlan.price}/
                            {selectedPlan.billingCycle === "yearly"
                              ? "yr"
                              : "mo"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {selectedPlan.description || "No description"}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {selectedPlan.maxUsers === -1
                              ? "Unlimited users"
                              : `Up to ${selectedPlan.maxUsers} users`}
                          </span>
                        </div>
                        {selectedPlan.features.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs font-medium mb-1">
                              Features:
                            </p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {selectedPlan.features
                                .slice(0, 3)
                                .map((feature, idx) => (
                                  <li key={idx}>• {feature}</li>
                                ))}
                              {selectedPlan.features.length > 3 && (
                                <li className="text-primary">
                                  +{selectedPlan.features.length - 3} more
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Separator />

                  <h4 className="font-semibold">Billing Contact</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billing-name">Name</Label>
                      <Input
                        id="billing-name"
                        name="billing-name"
                        placeholder="Contact name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billing-email">Email</Label>
                      <Input
                        id="billing-email"
                        name="billing-email"
                        type="email"
                        placeholder="Email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billing-phone">Phone</Label>
                      <Input
                        id="billing-phone"
                        name="billing-phone"
                        type="tel"
                        placeholder="Phone"
                      />
                    </div>
                  </div>

                  <Separator />

                  <h4 className="font-semibold">Admin Credentials</h4>
                  <p className="text-xs text-muted-foreground -mt-2">
                    These credentials will be used by the company admin to
                    access their portal.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-username">Admin Username</Label>
                      <Input
                        id="admin-username"
                        name="admin-username"
                        placeholder="company_admin"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Admin Password</Label>
                      <Input
                        id="admin-password"
                        name="admin-password"
                        type="password"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      creating ||
                      !selectedPlanId ||
                      subscriptionPlans.length === 0
                    }
                  >
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Company"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <Separator />
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div
          variants={item}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="h-16 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))
            : [
                {
                  label: "Total Companies",
                  value: stats.total,
                  color: "bg-blue-500",
                },
                { label: "Active", value: stats.active, color: "bg-green-500" },
                {
                  label: "Pending",
                  value: stats.pending,
                  color: "bg-yellow-500",
                },
                {
                  label: "Suspended",
                  value: stats.suspended,
                  color: "bg-red-500",
                },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${stat.color}`} />
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">
                          {stat.label}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </motion.div>

        <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
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
                {statusFilter === "all"
                  ? "All Status"
                  : statusConfig[statusFilter]?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("suspended")}>
                Suspended
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>

        <motion.div variants={item}>
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-48 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCompanies.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No companies found</p>
                {companies.length === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Company
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompanies.map((company) => {
                const status = statusConfig[company.status];
                const userPercent =
                  company.maxUsers === -1
                    ? 0
                    : (company.currentUsers / company.maxUsers) * 100;

                return (
                  <Card
                    key={company.companyId}
                    className="hover:border-foreground/20 transition-all"
                  >
                    <div className="p-6 pb-3">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{company.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {company.industry}
                            </p>
                          </div>
                        </div>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            {company.planName || company.plan}
                          </Badge>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {company.currentUsers}/
                              {company.maxUsers === -1 ? "∞" : company.maxUsers}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              users
                            </p>
                          </div>
                        </div>

                        {company.maxUsers !== -1 && company.maxUsers > 0 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>User Capacity</span>
                              <span>{Math.round(userPercent)}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  userPercent > 90
                                    ? "bg-red-500"
                                    : userPercent > 70
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                                style={{
                                  width: `${Math.min(userPercent, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {company.email}
                          </p>
                          {company.contractEndDate && (
                            <p className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              Contract ends:{" "}
                              {format(
                                new Date(company.contractEndDate),
                                "MMM d, yyyy"
                              )}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            asChild
                          >
                            <Link
                              href={`/dashboard/companies/${company.companyId}`}
                            >
                              View Details
                            </Link>
                          </Button>
                          <Button size="sm" className="flex-1" asChild>
                            <Link
                              href={`/dashboard/companies/${company.companyId}/users`}
                            >
                              <Users className="h-4 w-4 mr-1" />
                              Users
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
