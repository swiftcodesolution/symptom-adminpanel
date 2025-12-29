/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  ArrowLeft,
  Edit,
  Trash2,
  Key,
  UserCheck,
  UserX,
  Building2,
  Download,
  Clock,
  AlertCircle,
  Heart,
  LogOut,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import { format } from "date-fns";
import { useCompanyAuth } from "@/lib/CompanyAuthContext";
import { useCompanyFetch } from "@/lib/useCompanyFetch";
import { parseFirestoreDate } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  employeeId?: string;
  department?: string;
  role: "admin" | "manager" | "employee";
  status: "active" | "inactive" | "pending";
  lastLogin?: any;
  createdAt?: any;
}

interface CompanyInfo {
  name: string;
  userCapacity: number;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const roleConfig = {
  admin: {
    label: "Admin",
    variant: "default" as const,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
  },
  manager: {
    label: "Manager",
    variant: "secondary" as const,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  employee: {
    label: "Employee",
    variant: "outline" as const,
    color: "text-gray-600",
    bgColor: "bg-gray-500/10",
  },
};

const statusConfig = {
  active: { label: "Active", variant: "default" as const },
  inactive: { label: "Inactive", variant: "secondary" as const },
  pending: { label: "Pending", variant: "outline" as const },
};

export default function CompanyUsersPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);
  const searchParams = useSearchParams();
  const { logout, companyName, isLoading: authLoading } = useCompanyAuth();
  const companyFetch = useCompanyFetch();

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "admin" | "manager" | "employee"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "pending"
  >("all");

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  // Selected user & action states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newStatus, setNewStatus] = useState<"active" | "inactive">("active");

  // Loading states for actions
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    employeeId: "",
    department: "",
    role: "employee" as "admin" | "manager" | "employee",
  });

  // Check for action=add in URL
  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setIsCreateDialogOpen(true);
    }
  }, [searchParams]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardRes, usersRes] = await Promise.all([
        companyFetch(`/panel/api/company/${companyId}`),
        companyFetch(`/panel/api/company/${companyId}/users`),
      ]);

      if (!dashboardRes.ok) {
        throw new Error("Failed to load company data");
      }

      const dashboardData = await dashboardRes.json();
      const usersData: User[] = usersRes.ok ? await usersRes.json() : [];

      setCompanyInfo({
        name: dashboardData.company.name,
        userCapacity: dashboardData.company.userCapacity,
      });
      setUsers(usersData);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [companyId, companyFetch]);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, authLoading]);

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.department?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      );
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    inactive: users.filter((u) => u.status === "inactive").length,
    pending: users.filter((u) => u.status === "pending").length,
  };

  const canAddMoreUsers =
    companyInfo &&
    (companyInfo.userCapacity === -1 ||
      users.length < companyInfo.userCapacity);

  const remainingSlots =
    companyInfo?.userCapacity === -1
      ? "Unlimited"
      : (companyInfo?.userCapacity || 0) - users.length;

  // Export CSV
  const handleExportCSV = () => {
    if (users.length === 0) {
      toast.error("No users to export");
      return;
    }

    setExporting(true);

    try {
      const headers = [
        "Name",
        "Username",
        "Email",
        "Phone",
        "Employee ID",
        "Department",
        "Role",
        "Status",
        "Last Login",
        "Created At",
      ];

      const rows = users.map((user) => {
        const lastLogin = user.lastLogin
          ? parseFirestoreDate(user.lastLogin)
          : null;
        const createdAt = user.createdAt
          ? parseFirestoreDate(user.createdAt)
          : null;

        return [
          user.name || "",
          user.username || "",
          user.email || "",
          user.phone || "",
          user.employeeId || "",
          user.department || "",
          user.role || "",
          user.status || "",
          lastLogin ? format(lastLogin, "yyyy-MM-dd HH:mm:ss") : "Never",
          createdAt ? format(createdAt, "yyyy-MM-dd HH:mm:ss") : "",
        ];
      });

      const escapeCSV = (value: string) => {
        if (
          value.includes(",") ||
          value.includes('"') ||
          value.includes("\n")
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      };

      const csvContent = [
        headers.map(escapeCSV).join(","),
        ...rows.map((row) => row.map(escapeCSV).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      const sanitizedName = (companyInfo?.name || "company")
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .replace(/\s+/g, "_")
        .toLowerCase();
      const timestamp = format(new Date(), "yyyy-MM-dd");
      const filename = `${sanitizedName}_users_${timestamp}.csv`;

      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${users.length} users`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export users");
    } finally {
      setExporting(false);
    }
  };

  // Create User
  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const payload = {
      name: `${formData.get("first-name")} ${formData.get("last-name")}`.trim(),
      username: formData.get("username"),
      email: formData.get("email"),
      phone: formData.get("phone") || undefined,
      employeeId: formData.get("employee-id") || undefined,
      department: formData.get("department") || undefined,
      role: formData.get("role") || "employee",
      password: formData.get("password"),
    };

    try {
      setCreating(true);

      const res = await companyFetch(`/panel/api/company/${companyId}/users`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create user");
      }

      toast.success("User created successfully");
      setIsCreateDialogOpen(false);
      e.currentTarget.reset();
      await fetchData();
    } catch (error) {
      console.error("Create user error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create user"
      );
    } finally {
      setCreating(false);
    }
  };

  // Open Edit Dialog
  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      employeeId: user.employeeId || "",
      department: user.department || "",
      role: user.role || "employee",
    });
    setIsEditDialogOpen(true);
  };

  // Edit User
  const handleEditUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setSaving(true);

      const res = await companyFetch(
        `/panel/api/company/${companyId}/users/${selectedUser.id}`,
        {
          method: "PATCH",
          body: JSON.stringify(editForm),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update user");
      }

      toast.success("User updated successfully");
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      await fetchData();
    } catch (error) {
      console.error("Edit user error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update user"
      );
    } finally {
      setSaving(false);
    }
  };

  // Reset Password
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;

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

      const res = await companyFetch(
        `/panel/api/company/${companyId}/users/${selectedUser.id}/reset-password`,
        {
          method: "POST",
          body: JSON.stringify({ password: newPassword }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to reset password");
      }

      toast.success("Password reset successfully");
      setIsResetPasswordOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to reset password"
      );
    } finally {
      setResetting(false);
    }
  };

  // Change Status (Activate/Deactivate)
  const handleChangeStatus = async () => {
    if (!selectedUser) return;

    try {
      setChangingStatus(true);

      const res = await companyFetch(
        `/panel/api/company/${companyId}/users/${selectedUser.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update status");
      }

      toast.success(
        `User ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully`
      );
      setIsStatusDialogOpen(false);
      setSelectedUser(null);
      await fetchData();
    } catch (error) {
      console.error("Change status error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update status"
      );
    } finally {
      setChangingStatus(false);
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setDeleting(true);

      const res = await companyFetch(
        `/panel/api/company/${companyId}/users/${selectedUser.id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete user");
      }

      toast.success("User deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      await fetchData();
    } catch (error) {
      console.error("Delete user error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete user"
      );
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h1 className="text-2xl font-bold mb-2">Error Loading Users</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={fetchData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Link href={`/company/${companyId}`}>
                <Button variant="ghost">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/company/${companyId}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="p-2 bg-purple-500/10 rounded-xl">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="font-bold text-lg">
                  {companyInfo?.name || companyName}
                </h1>
                <p className="text-xs text-muted-foreground">User Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={fetchData}>
                <RefreshCw className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Page Title */}
          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <h2 className="text-2xl font-bold">Manage Users</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Add, edit, and manage employee accounts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={exporting}
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export CSV
              </Button>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                disabled={!canAddMoreUsers}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </motion.div>

          {/* Capacity Warning */}
          {!canAddMoreUsers && (
            <motion.div variants={item}>
              <Card className="border-orange-500/50 bg-orange-500/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-orange-600">
                      User Limit Reached
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You&apos;ve reached the maximum number of users (
                      {companyInfo?.userCapacity}) for your plan. Contact your
                      administrator to upgrade.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Stats Cards */}
          <motion.div
            variants={item}
            className="grid grid-cols-2 md:grid-cols-5 gap-4"
          >
            {[
              { label: "Total", value: stats.total, color: "bg-blue-500" },
              { label: "Active", value: stats.active, color: "bg-green-500" },
              {
                label: "Pending",
                value: stats.pending,
                color: "bg-yellow-500",
              },
              {
                label: "Inactive",
                value: stats.inactive,
                color: "bg-gray-500",
              },
              {
                label: "Slots Left",
                value: remainingSlots,
                color: "bg-purple-500",
              },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${stat.color}`} />
                    <div>
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Filters */}
          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, username, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  {roleFilter === "all"
                    ? "All Roles"
                    : roleConfig[roleFilter]?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setRoleFilter("all")}>
                  All Roles
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setRoleFilter("admin")}>
                  Admin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRoleFilter("manager")}>
                  Manager
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRoleFilter("employee")}>
                  Employee
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                  Inactive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                  Pending
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>

          {/* Users Table */}
          <motion.div variants={item}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Employees ({filteredUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No users found</p>
                    <p className="text-sm mt-1">
                      {users.length === 0
                        ? "Add your first employee to get started"
                        : "Try adjusting your search or filters"}
                    </p>
                    {users.length === 0 && canAddMoreUsers && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setIsCreateDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Employee
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead className="hidden md:table-cell">
                            Username
                          </TableHead>
                          <TableHead className="hidden lg:table-cell">
                            Department
                          </TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden sm:table-cell">
                            Last Login
                          </TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => {
                          const role =
                            roleConfig[user.role] || roleConfig.employee;
                          const status =
                            statusConfig[user.status] || statusConfig.pending;
                          const lastLogin = user.lastLogin
                            ? parseFirestoreDate(user.lastLogin)
                            : null;

                          return (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`h-10 w-10 rounded-full ${role.bgColor} flex items-center justify-center shrink-0`}
                                  >
                                    <span
                                      className={`text-sm font-semibold ${role.color}`}
                                    >
                                      {user.name
                                        ? user.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()
                                        : "?"}
                                    </span>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium truncate">
                                      {user.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {user.email}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <code className="text-xs bg-muted px-2 py-1 rounded">
                                  @{user.username}
                                </code>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                {user.department || (
                                  <span className="text-muted-foreground">
                                    —
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={role.variant}>
                                  {role.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={status.variant}>
                                  {status.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {lastLogin
                                    ? format(lastLogin, "MMM d, yyyy")
                                    : "Never"}
                                </div>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => openEditDialog(user)}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setIsResetPasswordOpen(true);
                                      }}
                                    >
                                      <Key className="h-4 w-4 mr-2" />
                                      Reset Password
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {user.status === "active" ? (
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedUser(user);
                                          setNewStatus("inactive");
                                          setIsStatusDialogOpen(true);
                                        }}
                                      >
                                        <UserX className="h-4 w-4 mr-2" />
                                        Deactivate
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedUser(user);
                                          setNewStatus("active");
                                          setIsStatusDialogOpen(true);
                                        }}
                                      >
                                        <UserCheck className="h-4 w-4 mr-2" />
                                        Activate
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setIsDeleteDialogOpen(true);
                                      }}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete User
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto py-6">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Heart className="h-4 w-4 text-primary" />
            <span>Powered by Health Companion</span>
          </div>
        </div>
      </footer>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateUser}>
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Create a new account for an employee. They will receive their
                login credentials.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input
                    id="first-name"
                    name="first-name"
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input
                    id="last-name"
                    name="last-name"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john.doe@company.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="john.doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee-id">Employee ID</Label>
                  <Input
                    id="employee-id"
                    name="employee-id"
                    placeholder="EMP-001"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    name="department"
                    placeholder="Engineering"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select name="role" defaultValue="employee">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Initial Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  The user will be asked to change this on first login.
                </p>
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
              <Button type="submit" disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleEditUser}>
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
              <DialogDescription>
                Update the employee&apos;s information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-username">Username</Label>
                  <Input
                    id="edit-username"
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm({ ...editForm, username: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-employee-id">Employee ID</Label>
                  <Input
                    id="edit-employee-id"
                    value={editForm.employeeId}
                    onChange={(e) =>
                      setEditForm({ ...editForm, employeeId: e.target.value })
                    }
                  />
                </div>
              </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-department">Department</Label>
                  <Input
                    id="edit-department"
                    value={editForm.department}
                    onChange={(e) =>
                      setEditForm({ ...editForm, department: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={editForm.role}
                    onValueChange={(value: "admin" | "manager" | "employee") =>
                      setEditForm({ ...editForm, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
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
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Set a new password for <strong>{selectedUser?.name}</strong>.
                They will need to use this password to log in.
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

      {/* Status Change Dialog */}
      <AlertDialog
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {newStatus === "active" ? "Activate User" : "Deactivate User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {newStatus === "active" ? (
                <>
                  Are you sure you want to activate{" "}
                  <strong>{selectedUser?.name}</strong>? They will be able to
                  log into the Health Companion app.
                </>
              ) : (
                <>
                  Are you sure you want to deactivate{" "}
                  <strong>{selectedUser?.name}</strong>? They will no longer be
                  able to log into the Health Companion app.
                </>
              )}
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
                "Deactivate"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{selectedUser?.name}</strong>? This action cannot be
              undone and will remove all their data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
