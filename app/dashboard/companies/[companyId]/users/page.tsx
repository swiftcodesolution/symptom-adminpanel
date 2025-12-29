/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  ChevronRight,
  ArrowLeft,
  Edit,
  Trash2,
  Key,
  Building2,
  Download,
  Clock,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
  DialogTrigger,
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
import { useAuthFetch } from "@/lib/useAuthFetch";
import { parseFirestoreDate } from "@/lib/utils";

interface Company {
  companyId: string;
  name: string;
  maxUsers: number;
  currentUsers: number;
}

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
    bgColor: "bg-purple-500/10",
  },
  manager: {
    label: "Manager",
    variant: "secondary" as const,
    bgColor: "bg-blue-500/10",
  },
  employee: {
    label: "Employee",
    variant: "outline" as const,
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

  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
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

  // Selected user for edit/delete/reset
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  const authFetch = useAuthFetch();

  // Fetch data
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
      const usersData: User[] = usersRes.ok ? await usersRes.json() : [];

      const enrichedCompany: Company = {
        companyId: companyData.companyId,
        name: companyData.name || "Unknown Company",
        maxUsers: companyData.userCapacity || 0,
        currentUsers: companyData.userCount || 0,
      };

      setCompany(enrichedCompany);
      setUsers(usersData);
    } catch {
      toast.error("Unable to load company users.");
    } finally {
      setLoading(false);
    }
  }, [companyId, authFetch]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  useEffect(() => {
    const filtered = users.filter((user) => {
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

    setFilteredUsers(filtered);
  }, [users, searchQuery, roleFilter, statusFilter]);

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    inactive: users.filter((u) => u.status === "inactive").length,
    pending: users.filter((u) => u.status === "pending").length,
    admins: users.filter((u) => u.role === "admin").length,
    managers: users.filter((u) => u.role === "manager").length,
    employees: users.filter((u) => u.role === "employee").length,
  };

  const canAddMoreUsers =
    company &&
    (company.maxUsers === -1 || company.currentUsers < company.maxUsers);

  // Export to CSV
  const handleExportCSV = () => {
    if (!company || users.length === 0) {
      toast.error("No users to export");
      return;
    }

    setExporting(true);

    try {
      // CSV headers
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

      // CSV rows
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

      // Escape CSV values
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

      // Build CSV content
      const csvContent = [
        headers.map(escapeCSV).join(","),
        ...rows.map((row) => row.map(escapeCSV).join(",")),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      // Sanitize company name for filename
      const sanitizedName = company.name
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

      toast.success(`Exported ${users.length} users to ${filename}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export users");
    } finally {
      setExporting(false);
    }
  };

  // Create User Handler
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
      role: formData.get("role"),
      password: formData.get("password"),
      status: "active" as const, // Users are active by default
    };

    try {
      setCreating(true);
      const res = await authFetch(
        `/panel/api/admin/companies/${companyId}/users`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create user");
      }

      toast.success("User created successfully.");
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

  // Edit User Handler
  const handleEditUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedUser) return;

    try {
      setSaving(true);

      const res = await authFetch(
        `/panel/api/admin/companies/${companyId}/users/${selectedUser.id}`,
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

  // Reset Password Handler
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

      const res = await authFetch(
        `/panel/api/admin/companies/${companyId}/users/${selectedUser.id}/reset-password`,
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

  // Delete User Handler
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setDeleting(true);

      const res = await authFetch(
        `/panel/api/admin/companies/${companyId}/users/${selectedUser.id}`,
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

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-6">
          <div className="h-10 bg-muted animate-pulse rounded w-96" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="h-20 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="h-96 bg-muted animate-pulse rounded" />
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
          <Link
            href={`/dashboard/companies/${companyId}`}
            className="hover:text-foreground transition-colors"
          >
            {company.name}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Users</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {company.name} Users
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage employee accounts and access
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
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button disabled={!canAddMoreUsers}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <form onSubmit={handleCreateUser}>
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                      Add a new employee to {company.name}. They will receive
                      login credentials via email.
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
                        <Label htmlFor="employee-id">
                          Employee ID (Optional)
                        </Label>
                        <Input
                          id="employee-id"
                          name="employee-id"
                          placeholder="EMP-001"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="department">
                          Department (Optional)
                        </Label>
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
                            <SelectItem value="admin">Admin</SelectItem>
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
                        User will be prompted to change this on first login.
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
        {/* User Limit Warning */}
        {!canAddMoreUsers && (
          <motion.div variants={item}>
            <Card className="border-orange-500/50 bg-orange-500/5">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-orange-600">
                    User Limit Reached
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This company has reached its maximum user capacity (
                    {company.maxUsers}). Upgrade the plan to add more users.
                  </p>
                </div>
                <Link href={`/dashboard/companies/${companyId}`}>
                  <Button variant="outline" size="sm">
                    Upgrade Plan
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Grid */}
        <motion.div
          variants={item}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
        >
          {[
            { label: "Total", value: stats.total, color: "bg-blue-500" },
            { label: "Active", value: stats.active, color: "bg-green-500" },
            { label: "Inactive", value: stats.inactive, color: "bg-gray-500" },
            { label: "Pending", value: stats.pending, color: "bg-yellow-500" },
            { label: "Admins", value: stats.admins, color: "bg-purple-500" },
            { label: "Managers", value: stats.managers, color: "bg-blue-500" },
            {
              label: "Employees",
              value: stats.employees,
              color: "bg-gray-400",
            },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-3">
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
        <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
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
                Users ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No users found</p>
                  {users.length === 0 && canAddMoreUsers && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setIsCreateDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First User
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
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
                                  className={`h-10 w-10 rounded-full ${role.bgColor} flex items-center justify-center`}
                                >
                                  <span className="text-sm font-semibold">
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
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-xs text-muted-foreground">
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
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={role.variant}>{role.label}</Badge>
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
                                    Edit User
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

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleEditUser}>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update the user&apos;s information.
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
                      <SelectItem value="admin">Admin</SelectItem>
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

      {/* Delete User Confirmation Dialog */}
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
