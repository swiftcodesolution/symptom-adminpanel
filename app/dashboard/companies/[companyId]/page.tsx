// app/dashboard/companies/[companyId]/page.tsx
"use client";

import { use, useState } from "react";
import Link from "next/link";
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
  Settings,
  Trash2,
  RefreshCw,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockSubscriptionPlans } from "@/lib/mock-data";
import {
  formatDate,
  getRelativeTime,
  getCompanyById,
  getCompanyUsers,
} from "@/lib/utils";

interface CompanyDetailPageProps {
  params: Promise<{ companyId: string }>;
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
  active: {
    label: "Active",
    variant: "default" as const,
    color: "text-green-600",
    bgColor: "bg-green-500/10",
  },
  suspended: {
    label: "Suspended",
    variant: "destructive" as const,
    color: "text-red-600",
    bgColor: "bg-red-500/10",
  },
  pending: {
    label: "Pending",
    variant: "outline" as const,
    color: "text-yellow-600",
    bgColor: "bg-yellow-500/10",
  },
  cancelled: {
    label: "Cancelled",
    variant: "secondary" as const,
    color: "text-gray-600",
    bgColor: "bg-gray-500/10",
  },
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

export default function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const { companyId } = use(params);
  const [copiedCredential, setCopiedCredential] = useState<string | null>(null);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  const company = getCompanyById(companyId);
  const companyUsers = getCompanyUsers(companyId);
  const plan = company
    ? mockSubscriptionPlans.find((p) => p.id === company.planId)
    : null;

  if (!company) {
    return (
      <div className="p-8 text-center">
        <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Company Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The company you&apos;re looking for doesn&apos;t exist.
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

  const status = statusConfig[company.status];
  const userPercent =
    company.maxUsers === -1
      ? 0
      : (company.currentUsers / company.maxUsers) * 100;

  const handleCopyCredential = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCredential(type);
    setTimeout(() => setCopiedCredential(null), 2000);
  };

  const recentUsers = companyUsers.slice(0, 5);

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
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {company.industry} • {company.planName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
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
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsResetPasswordOpen(true)}>
                  <Key className="h-4 w-4 mr-2" />
                  Reset Admin Password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {company.status === "active" ? (
                  <DropdownMenuItem className="text-destructive">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Suspend Company
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem className="text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    Activate Company
                  </DropdownMenuItem>
                )}
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
                  <p className="text-2xl font-bold">${plan?.price || 0}</p>
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
                  <p className="text-2xl font-bold">
                    {new Date(company.contractEndDate).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(company.contractEndDate).getFullYear()}
                  </p>
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
                    {companyUsers.filter((u) => u.status === "active").length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {companyUsers.filter((u) => u.status === "pending").length}{" "}
                    pending
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
        {company.maxUsers !== -1 && (
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Company Details */}
          <motion.div variants={item} className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
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
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium">{company.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="text-sm font-medium">{company.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Last Updated
                        </p>
                        <p className="text-sm font-medium">
                          {getRelativeTime(company.updatedAt)}
                        </p>
                      </div>
                    </div>
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
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {company.billingContact.name}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {company.billingContact.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {company.billingContact.phone}
                      </span>
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
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
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
                          <Badge variant={userRoleConfig[user.role].variant}>
                            {userRoleConfig[user.role].label}
                          </Badge>
                          <Badge
                            variant={userStatusConfig[user.status].variant}
                          >
                            {userStatusConfig[user.status].label}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div variants={item} className="space-y-6">
            {/* Admin Portal Access */}
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
                        /company/{companyId}
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
                        {company.adminCredentials.username}
                      </code>
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

            {/* Subscription Info */}
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
                    <span className="font-semibold">{company.planName}</span>
                    <Badge variant="outline">${plan?.price}/mo</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {company.maxUsers === -1
                      ? "Unlimited users"
                      : `Up to ${company.maxUsers} users`}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Contract Start
                    </span>
                    <span>{formatDate(company.contractStartDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contract End</span>
                    <span>{formatDate(company.contractEndDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{formatDate(company.createdAt)}</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full">
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

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Admin Password</DialogTitle>
            <DialogDescription>
              Set a new password for the company admin account. The company will
              need to use this password to log into their portal.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsResetPasswordOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setIsResetPasswordOpen(false)}>
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
