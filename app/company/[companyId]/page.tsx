// app/company/[companyId]/page.tsx
"use client";

import { use, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  UserPlus,
  Activity,
  LogOut,
  ChevronRight,
  Clock,
  Heart,
  Settings,
  BarChart3,
  Shield,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  getRelativeTime,
  getCompanyById,
  getCompanyUsers,
} from "@/lib/utils";

interface CompanyDashboardProps {
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

const roleConfig = {
  admin: { label: "Admin", variant: "default" as const },
  manager: { label: "Manager", variant: "secondary" as const },
  employee: { label: "Employee", variant: "outline" as const },
};

const statusConfig = {
  active: { label: "Active", variant: "default" as const },
  inactive: { label: "Inactive", variant: "secondary" as const },
  pending: { label: "Pending", variant: "outline" as const },
};

export default function CompanyDashboard({ params }: CompanyDashboardProps) {
  const { companyId } = use(params);

  const company = getCompanyById(companyId);
  const companyUsers = getCompanyUsers(companyId);

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h1 className="text-2xl font-bold mb-2">Company Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The company portal you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/company/login">
              <Button>Back to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userPercent =
    company.maxUsers === -1
      ? 0
      : (company.currentUsers / company.maxUsers) * 100;

  const stats = {
    total: companyUsers.length,
    active: companyUsers.filter((u) => u.status === "active").length,
    inactive: companyUsers.filter((u) => u.status === "inactive").length,
    pending: companyUsers.filter((u) => u.status === "pending").length,
  };

  const recentUsers = [...companyUsers]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-xl">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="font-bold text-lg">{company.name}</h1>
                <p className="text-xs text-muted-foreground">Company Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Link href="/company/login">
                <Button variant="ghost" size="icon">
                  <LogOut className="h-5 w-5" />
                </Button>
              </Link>
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
          {/* Welcome Banner */}
          <motion.div variants={item}>
            <Card className="bg-gradient-to-r from-purple-500/10 to-purple-500/5">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">Welcome Back!</h2>
                    <p className="text-muted-foreground mt-1">
                      Manage your employees&apos; health companion accounts
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="h-8 px-3">
                      <Shield className="mr-2 h-3 w-3" />
                      {company.planName}
                    </Badge>
                    <Badge
                      variant={
                        company.status === "active" ? "default" : "secondary"
                      }
                      className="h-8 px-3"
                    >
                      <Activity className="mr-2 h-3 w-3" />
                      {company.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

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
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">
                      of {company.maxUsers === -1 ? "∞" : company.maxUsers}
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
                    <p className="text-xs text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold">{stats.active}</p>
                    <p className="text-xs text-green-600">Using the app</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                    <p className="text-xs text-yellow-600">Awaiting setup</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Inactive</p>
                    <p className="text-2xl font-bold">{stats.inactive}</p>
                    <p className="text-xs text-muted-foreground">Deactivated</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-gray-500/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Capacity Bar */}
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
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <motion.div variants={item} className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href={`/company/${companyId}/users`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Users
                    </Button>
                  </Link>
                  <Link href={`/company/${companyId}/users?action=add`}>
                    <Button variant="default" className="w-full justify-start">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add New User
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Reports
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Users */}
            <motion.div variants={item} className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Recent Users
                    </CardTitle>
                    <Link href={`/company/${companyId}/users`}>
                      <Button variant="ghost" size="sm">
                        View All
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No users yet</p>
                      <Link href={`/company/${companyId}/users?action=add`}>
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
                            <Badge variant={roleConfig[user.role].variant}>
                              {roleConfig[user.role].label}
                            </Badge>
                            <Badge variant={statusConfig[user.status].variant}>
                              {statusConfig[user.status].label}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Subscription Info */}
          <motion.div variants={item}>
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{company.planName} Plan</p>
                      <p className="text-sm text-muted-foreground">
                        Contract ends: {formatDate(company.contractEndDate)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Contact your administrator to upgrade or modify your
                    subscription.
                  </p>
                </div>
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
    </div>
  );
}
