"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  ArrowLeft,
  Edit,
  Shield,
  Clock,
  ChevronRight,
  AlertCircle,
  Check,
  Key,
  Copy,
  ExternalLink,
  MoreHorizontal,
  UserPlus,
  RefreshCw,
  Loader2,
  Trash2,
  Ban,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { parseFirestoreDate } from "@/lib/utils";

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
  contractStartDate?: string | null;
  contractEndDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  billingContact: {
    name: string;
    email: string;
    phone?: string;
  };
  adminCredentials: {
    username: string;
    password?: string;
  };
  userCount: number;
  currentUsers: number;
  maxUsers: number;
  planName?: string;
}

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  department?: string;
  role: "admin" | "manager" | "employee";
  status: "active" | "inactive" | "pending";
  lastLogin?: string | null;
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

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const statusConfig = {
  active: { label: "Active", variant: "default" as const },
  suspended: { label: "Suspended", variant: "destructive" as const },
  pending: { label: "Pending", variant: "outline" as const },
  cancelled: { label: "Cancelled", variant: "secondary" as const },
};

const userRoleConfig = {
  admin: { label: "Admin", variant: "default" as const },
  manager: { label: "Manager", variant: "secondary" as const },
  employee: { label: "Employee", variant: "outline" as const },
};

const userStatusConfig = {
  active: { label: "Active", variant: "default" as const },
  inactive: { label: "Inactive", variant: "secondary" as const },
  pending: { label: "Pending", variant: "outline" as const },
};

const industries = [
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "retail", label: "Retail" },
  { value: "food", label: "Food & Beverage" },
  { value: "energy", label: "Energy" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
];

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);
  const router = useRouter();

  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlan[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [copiedCredential, setCopiedCredential] = useState<string | null>(null);

  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isChangePlanOpen, setIsChangePlanOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Loading states for actions
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    name: "",
    industry: "",
    email: "",
    phone: "",
    address: "",
    billingContactName: "",
    billingContactEmail: "",
    billingContactPhone: "",
  });
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [newStatus, setNewStatus] = useState<
    "active" | "suspended" | "pending"
  >("active");

  const authFetch = useAuthFetch();

  // Fetch company data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [companyRes, usersRes] = await Promise.all([
        authFetch(`/panel/api/admin/companies/${companyId}`),
        authFetch(`/panel/api/admin/companies/${companyId}/users`),
      ]);

      if (!companyRes.ok) {
        throw new Error("Failed to load company data");
      }

      const companyData = await companyRes.json();
      const usersData = usersRes.ok ? await usersRes.json() : [];

      const enrichedCompany: Company = {
        companyId: companyData.companyId,
        name: companyData.name || "",
        industry: companyData.industry || "",
        email: companyData.email || "",
        phone: companyData.phone,
        address: companyData.address,
        status: companyData.status || "pending",
        plan: companyData.activeSubscriptionId || companyData.plan || "none",
        userCapacity: companyData.userCapacity || 0,
        contractStartDate: companyData.contractStartDate,
        contractEndDate: companyData.contractEndDate,
        createdAt: companyData.createdAt,
        updatedAt: companyData.updatedAt,
        billingContact: companyData.billingContact || { name: "", email: "" },
        adminCredentials: companyData.adminCredentials || { username: "" },
        userCount: companyData.userCount || 0,
        currentUsers: companyData.userCount || 0,
        maxUsers: companyData.userCapacity || 0,
        planName: (() => {
          const plan =
            companyData.activeSubscriptionId || companyData.plan || "none";
          return plan === "none"
            ? "No Plan"
            : plan.charAt(0).toUpperCase() + plan.slice(1);
        })(),
      };

      setCompany(enrichedCompany);
      setUsers(usersData);

      // Initialize edit form
      setEditForm({
        name: enrichedCompany.name,
        industry: enrichedCompany.industry,
        email: enrichedCompany.email,
        phone: enrichedCompany.phone || "",
        address: enrichedCompany.address || "",
        billingContactName: enrichedCompany.billingContact.name,
        billingContactEmail: enrichedCompany.billingContact.email,
        billingContactPhone: enrichedCompany.billingContact.phone || "",
      });
      setSelectedPlanId(enrichedCompany.plan);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Unable to load company details.");
    } finally {
      setLoading(false);
    }
  }, [companyId, authFetch]);

  // Fetch subscription plans
  const fetchPlans = useCallback(async () => {
    try {
      const res = await authFetch("/panel/api/admin/subscription-plans");
      if (res.ok) {
        const data: SubscriptionPlan[] = await res.json();
        const b2bPlans = data.filter((p) => p.type === "b2b" && p.isActive);
        setSubscriptionPlans(b2bPlans);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  }, [authFetch]);

  useEffect(() => {
    if (companyId) {
      fetchData();
      fetchPlans();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const handleCopyCredential = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCredential(type);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedCredential(null), 2000);
  };

  // Edit Company Handler
  const handleEditCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editForm.name || !editForm.email) {
      toast.error("Name and email are required");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: editForm.name,
        industry: editForm.industry,
        email: editForm.email,
        phone: editForm.phone || null,
        address: editForm.address || null,
        billingContact: {
          name: editForm.billingContactName,
          email: editForm.billingContactEmail,
          phone: editForm.billingContactPhone || null,
        },
      };

      const res = await authFetch(`/panel/api/admin/companies/${companyId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update company");
      }

      toast.success("Company updated successfully");
      setIsEditDialogOpen(false);
      await fetchData();
    } catch (error) {
      console.error("Error updating company:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update company"
      );
    } finally {
      setSaving(false);
    }
  };

  // Reset Password Handler
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("new-password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setResetting(true);

      const res = await authFetch(
        `/panel/api/admin/companies/${companyId}/reset-password`,
        {
          method: "POST",
          body: JSON.stringify({ password: newPassword }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to reset password");
      }

      toast.success("Admin password reset successfully");
      setIsResetPasswordOpen(false);
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to reset password"
      );
    } finally {
      setResetting(false);
    }
  };

  // Change Plan Handler
  const handleChangePlan = async () => {
    if (!selectedPlanId) {
      toast.error("Please select a plan");
      return;
    }

    const selectedPlan = subscriptionPlans.find((p) => p.id === selectedPlanId);

    try {
      setChangingPlan(true);

      const res = await authFetch(`/panel/api/admin/companies/${companyId}`, {
        method: "PATCH",
        body: JSON.stringify({
          activeSubscriptionId: selectedPlanId,
          userCapacity: selectedPlan?.maxUsers || 0,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to change plan");
      }

      toast.success("Subscription plan updated successfully");
      setIsChangePlanOpen(false);
      await fetchData();
    } catch (error) {
      console.error("Error changing plan:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to change plan"
      );
    } finally {
      setChangingPlan(false);
    }
  };

  // Change Status Handler
  const handleChangeStatus = async () => {
    try {
      setChangingStatus(true);

      const res = await authFetch(`/panel/api/admin/companies/${companyId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update status");
      }

      toast.success(
        `Company ${
          newStatus === "active" ? "activated" : "suspended"
        } successfully`
      );
      setIsStatusDialogOpen(false);
      await fetchData();
    } catch (error) {
      console.error("Error changing status:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update status"
      );
    } finally {
      setChangingStatus(false);
    }
  };

  // Delete Company Handler
  const handleDeleteCompany = async () => {
    try {
      setDeleting(true);

      const res = await authFetch(`/panel/api/admin/companies/${companyId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete company");
      }

      toast.success("Company deleted successfully");
      router.push("/dashboard/companies");
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete company"
      );
    } finally {
      setDeleting(false);
    }
  };

  // Get plan details
  const getPlanDetails = (planId: string) => {
    return subscriptionPlans.find((p) => p.id === planId);
  };

  const currentPlan = getPlanDetails(company?.plan || "");

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded w-64" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-32 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-8 text-center">
        <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Company Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The company you are looking for does not exist.
        </p>
        <Link href="/dashboard/companies">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Button>
        </Link>
      </div>
    );
  }

  const userPercent =
    company.maxUsers === -1 || company.maxUsers === 0
      ? 0
      : (company.currentUsers / company.maxUsers) * 100;

  const recentUsers = users.slice(0, 5);

  const planPrice = currentPlan?.price || 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/dashboard/companies"
            className="hover:text-foreground transition-colors"
          >
            Companies
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{company.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {company.name}
                </h1>
                <Badge variant={statusConfig[company.status].variant}>
                  {statusConfig[company.status].label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {company.industry} • {currentPlan?.name || company.planName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsChangePlanOpen(true)}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Change Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsResetPasswordOpen(true)}>
                  <Key className="h-4 w-4 mr-2" />
                  Reset Admin Password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {company.status === "active" ? (
                  <DropdownMenuItem
                    onClick={() => {
                      setNewStatus("suspended");
                      setIsStatusDialogOpen(true);
                    }}
                    className="text-orange-600"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Suspend Company
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => {
                      setNewStatus("active");
                      setIsStatusDialogOpen(true);
                    }}
                    className="text-green-600"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Activate Company
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Company
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
        {/* Stats Cards */}
        <motion.div
          variants={item}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{company.currentUsers}</p>
                  <p className="text-xs text-muted-foreground">
                    of{" "}
                    {company.maxUsers === -1 ? "Unlimited" : company.maxUsers}
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
                  <p className="text-xs text-muted-foreground">Monthly Cost</p>
                  <p className="text-2xl font-bold">${planPrice}</p>
                  <p className="text-xs text-muted-foreground">per month</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Contract Ends</p>
                  {company.contractEndDate &&
                  parseFirestoreDate(company.contractEndDate) ? (
                    <>
                      <p className="text-2xl font-bold">
                        {format(
                          parseFirestoreDate(company.contractEndDate)!,
                          "MMM d"
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(
                          parseFirestoreDate(company.contractEndDate)!,
                          "yyyy"
                        )}
                      </p>
                    </>
                  ) : (
                    <p className="text-2xl font-bold">—</p>
                  )}
                </div>
                <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">
                    {users.filter((u) => u.status === "active").length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {users.filter((u) => u.status === "pending").length} pending
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Check className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Capacity Bar */}
        {company.maxUsers !== -1 && company.maxUsers > 0 && (
          <motion.div variants={item}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">User Capacity</span>
                  <span className="text-sm text-muted-foreground">
                    {company.currentUsers} / {company.maxUsers} (
                    {Math.round(userPercent)}%)
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      userPercent > 90
                        ? "bg-red-500"
                        : userPercent > 70
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(userPercent, 100)}%` }}
                  />
                </div>
                {userPercent > 80 && (
                  <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Approaching user limit. Consider upgrading the plan.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <motion.div variants={item} className="lg:col-span-2 space-y-6">
            {/* Company Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium">{company.email}</p>
                      </div>
                    </div>
                    {company.phone && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="text-sm font-medium">{company.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {company.address && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Address
                          </p>
                          <p className="text-sm font-medium">
                            {company.address}
                          </p>
                        </div>
                      </div>
                    )}
                    {company.updatedAt &&
                      parseFirestoreDate(company.updatedAt) && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Last Updated
                            </p>
                            <p className="text-sm font-medium">
                              {format(
                                parseFirestoreDate(company.updatedAt)!,
                                "MMM d, yyyy"
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing Contact */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 rounded-lg border">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {company.billingContact.name
                        ? company.billingContact.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : "?"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {company.billingContact.name || "No billing contact"}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
                      {company.billingContact.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {company.billingContact.email}
                        </span>
                      )}
                      {company.billingContact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {company.billingContact.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Users */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Recent Users
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/companies/${companyId}/users`}>
                      View All
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No users yet</p>
                    <Link href={`/dashboard/companies/${companyId}/users`}>
                      <Button variant="outline" size="sm" className="mt-4">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add First User
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {user.name
                                ? user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                : "?"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              @{user.username} •{" "}
                              {user.department || "No department"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              userRoleConfig[user.role]?.variant || "outline"
                            }
                          >
                            {userRoleConfig[user.role]?.label || user.role}
                          </Badge>
                          <Badge
                            variant={
                              userStatusConfig[user.status]?.variant ||
                              "outline"
                            }
                          >
                            {userStatusConfig[user.status]?.label ||
                              user.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column */}
          <motion.div variants={item} className="space-y-6">
            {/* Company Portal Access */}
            <Card className="border-purple-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Key className="h-5 w-5 text-purple-500" />
                  Company Portal Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/50 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Portal URL
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-background px-2 py-1 rounded border flex-1 truncate">
                        {typeof window !== "undefined"
                          ? `${window.location.origin}/company/${companyId}`
                          : `/company/${companyId}`}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          handleCopyCredential(
                            `${window.location.origin}/company/${companyId}`,
                            "url"
                          )
                        }
                      >
                        {copiedCredential === "url" ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Admin Username
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-background px-2 py-1 rounded border flex-1">
                        {company.adminCredentials.username || "Not set"}
                      </code>
                      {company.adminCredentials.username && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            handleCopyCredential(
                              company.adminCredentials.username,
                              "username"
                            )
                          }
                        >
                          {copiedCredential === "username" ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setIsResetPasswordOpen(true)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Admin Password
                </Button>
                <Link
                  href={`/company/${companyId}`}
                  target="_blank"
                  className="block"
                >
                  <Button variant="default" size="sm" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Company Portal
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Subscription */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">
                      {currentPlan?.name || company.planName}
                    </span>
                    <Badge variant="outline">${planPrice}/mo</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {company.maxUsers === -1
                      ? "Unlimited users"
                      : `Up to ${company.maxUsers} users`}
                  </p>
                  {currentPlan?.features && currentPlan.features.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {currentPlan.features
                          .slice(0, 3)
                          .map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-1">
                              <Check className="h-3 w-3 text-green-500" />
                              {feature}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  {company.contractStartDate &&
                    parseFirestoreDate(company.contractStartDate) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Contract Start
                        </span>
                        <span>
                          {format(
                            parseFirestoreDate(company.contractStartDate)!,
                            "MMM d, yyyy"
                          )}
                        </span>
                      </div>
                    )}
                  {company.contractEndDate &&
                    parseFirestoreDate(company.contractEndDate) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Contract End
                        </span>
                        <span>
                          {format(
                            parseFirestoreDate(company.contractEndDate)!,
                            "MMM d, yyyy"
                          )}
                        </span>
                      </div>
                    )}
                  {company.createdAt &&
                    parseFirestoreDate(company.createdAt) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created</span>
                        <span>
                          {format(
                            parseFirestoreDate(company.createdAt)!,
                            "MMM d, yyyy"
                          )}
                        </span>
                      </div>
                    )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setIsChangePlanOpen(true)}
                >
                  Change Plan
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/dashboard/companies/${companyId}/users`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  View Invoices
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Edit Company Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleEditCompany}>
            <DialogHeader>
              <DialogTitle>Edit Company</DialogTitle>
              <DialogDescription>
                Update the company information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Company Name</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-industry">Industry</Label>
                  <Select
                    value={editForm.industry}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, industry: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((ind) => (
                        <SelectItem key={ind.value} value={ind.value}>
                          {ind.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                />
              </div>

              <Separator />

              <h4 className="font-semibold">Billing Contact</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-billing-name">Name</Label>
                  <Input
                    id="edit-billing-name"
                    value={editForm.billingContactName}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        billingContactName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-billing-email">Email</Label>
                  <Input
                    id="edit-billing-email"
                    type="email"
                    value={editForm.billingContactEmail}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        billingContactEmail: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-billing-phone">Phone</Label>
                  <Input
                    id="edit-billing-phone"
                    type="tel"
                    value={editForm.billingContactPhone}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        billingContactPhone: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent>
          <form onSubmit={handleResetPassword}>
            <DialogHeader>
              <DialogTitle>Reset Admin Password</DialogTitle>
              <DialogDescription>
                Set a new password for the company admin account. The company
                will need to use this password to log into their portal.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  name="new-password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsResetPasswordOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={resetting}>
                {resetting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Plan Dialog */}
      <Dialog open={isChangePlanOpen} onOpenChange={setIsChangePlanOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              Select a new subscription plan for this company.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Plan</Label>
              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {currentPlan?.name || company.planName}
                  </span>
                  <Badge variant="outline">${planPrice}/mo</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>New Plan</Label>
              {subscriptionPlans.length === 0 ? (
                <div className="p-3 rounded-lg border border-dashed text-center text-muted-foreground">
                  <p className="text-sm">No B2B plans available</p>
                  <Link href="/dashboard/subscriptions">
                    <Button variant="link" size="sm">
                      Create plans in Subscriptions
                    </Button>
                  </Link>
                </div>
              ) : (
                <Select
                  value={selectedPlanId}
                  onValueChange={setSelectedPlanId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {subscriptionPlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - ${plan.price}/mo (
                        {plan.maxUsers === -1 ? "Unlimited" : plan.maxUsers}{" "}
                        users)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedPlanId && selectedPlanId !== company.plan && (
              <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Plan Change Summary
                </p>
                {(() => {
                  const newPlan = subscriptionPlans.find(
                    (p) => p.id === selectedPlanId
                  );
                  if (!newPlan) return null;
                  return (
                    <ul className="text-sm text-blue-600 dark:text-blue-400 mt-2 space-y-1">
                      <li>
                        • Price: ${planPrice}/mo → ${newPlan.price}/mo
                      </li>
                      <li>
                        • Users:{" "}
                        {company.maxUsers === -1
                          ? "Unlimited"
                          : company.maxUsers}{" "}
                        →{" "}
                        {newPlan.maxUsers === -1
                          ? "Unlimited"
                          : newPlan.maxUsers}
                      </li>
                    </ul>
                  );
                })()}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsChangePlanOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePlan}
              disabled={
                changingPlan ||
                !selectedPlanId ||
                selectedPlanId === company.plan
              }
            >
              {changingPlan ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Plan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <AlertDialog
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {newStatus === "active" ? "Activate Company" : "Suspend Company"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {newStatus === "active"
                ? "This will activate the company account and allow their users to access the platform."
                : "This will suspend the company account. Their users will no longer be able to access the platform until reactivated."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleChangeStatus}
              className={
                newStatus === "active" ? "bg-green-600 hover:bg-green-700" : ""
              }
              disabled={changingStatus}
            >
              {changingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : newStatus === "active" ? (
                "Activate"
              ) : (
                "Suspend"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Company Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{company.name}</strong>?
              This action cannot be undone. Companies with existing users cannot
              be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCompany}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Company"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
