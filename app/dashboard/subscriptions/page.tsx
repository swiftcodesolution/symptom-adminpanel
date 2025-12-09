// app/dashboard/subscriptions/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  CreditCard,
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
  Crown,
  Zap,
  Star,
  RefreshCw,
  Download,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  mockSubscriptionPlans,
  mockB2CSubscriptions,
  mockCompanies,
} from "@/lib/mock-data";
import { formatDate, getSubscriptionStats } from "@/lib/utils";

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

export default function SubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [b2cStatusFilter, setB2cStatusFilter] = useState("all");
  const [b2bStatusFilter, setB2bStatusFilter] = useState("all");

  const stats = getSubscriptionStats();

  // Filter B2C subscriptions
  const filteredB2C = mockB2CSubscriptions.filter((sub) => {
    const matchesSearch =
      sub.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.planName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      b2cStatusFilter === "all" || sub.status === b2cStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter B2B companies
  const filteredB2B = mockCompanies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      b2bStatusFilter === "all" || company.status === b2bStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const b2cPlans = mockSubscriptionPlans.filter((p) => p.type === "b2c");
  const b2bPlans = mockSubscriptionPlans.filter((p) => p.type === "b2b");

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
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync
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
                    +12.5% from last month
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
                  <p className="text-xs text-muted-foreground">Trial Users</p>
                  <p className="text-2xl font-bold">{stats.trialUsers}</p>
                  <p className="text-xs text-orange-600 mt-1">
                    {stats.churnRate}% churn rate
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
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
                    <div className="space-y-3">
                      {mockB2CSubscriptions.slice(0, 5).map((sub) => {
                        const status = statusConfig[sub.status];
                        return (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between p-3 rounded-lg border"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary">
                                  {sub.userName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {sub.userName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {sub.planName} • ${sub.amount}/mo
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
                    <div className="space-y-3">
                      {mockCompanies.slice(0, 5).map((company) => {
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
                                    {company.currentUsers}/
                                    {company.maxUsers === -1
                                      ? "∞"
                                      : company.maxUsers}{" "}
                                    users • {company.planName}
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
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* B2C Tab */}
            <TabsContent value="b2c" className="mt-6 space-y-4">
              {/* Filters */}
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
                    <DropdownMenuItem
                      onClick={() => setB2cStatusFilter("expired")}
                    >
                      Expired
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subscriber</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Amount
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Period
                        </TableHead>
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
                                    {sub.userName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">{sub.userName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {sub.paymentMethod || "No payment method"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{sub.planName}</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              ${sub.amount}/mo
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="text-sm">
                                <p>{formatDate(sub.startDate)}</p>
                                <p className="text-xs text-muted-foreground">
                                  to {formatDate(sub.endDate)}
                                </p>
                              </div>
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* B2B Tab */}
            <TabsContent value="b2b" className="mt-6 space-y-4">
              {/* Filters */}
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
                <Link href="/dashboard/companies/new">
                  <Button>
                    <Building2 className="h-4 w-4 mr-2" />
                    Add Company
                  </Button>
                </Link>
              </div>

              {/* Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Users
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Contract
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredB2B.map((company) => {
                        const status = statusConfig[company.status];
                        const userPercent =
                          company.maxUsers === -1
                            ? 0
                            : (company.currentUsers / company.maxUsers) * 100;
                        return (
                          <TableRow key={company.id}>
                            <TableCell>
                              <Link href={`/dashboard/companies/${company.id}`}>
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
                                {company.planName}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="space-y-1">
                                <p className="text-sm">
                                  {company.currentUsers}/
                                  {company.maxUsers === -1
                                    ? "∞"
                                    : company.maxUsers}
                                </p>
                                {company.maxUsers !== -1 && (
                                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
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
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="text-sm">
                                <p>{formatDate(company.contractStartDate)}</p>
                                <p className="text-xs text-muted-foreground">
                                  to {formatDate(company.contractEndDate)}
                                </p>
                              </div>
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
                                  <DropdownMenuItem>
                                    Edit Company
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Plans Tab */}
            <TabsContent value="plans" className="mt-6 space-y-6">
              {/* B2C Plans */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  B2C Plans
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {b2cPlans.map((plan) => (
                    <Card
                      key={plan.id}
                      className={`relative ${
                        plan.name === "Premium"
                          ? "border-primary shadow-lg"
                          : ""
                      }`}
                    >
                      {plan.name === "Premium" && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-primary">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="text-center mb-4">
                          <h4 className="font-bold text-lg">{plan.name}</h4>
                          <div className="mt-2">
                            <span className="text-3xl font-bold">
                              ${plan.price}
                            </span>
                            <span className="text-muted-foreground">
                              /{plan.billingCycle === "yearly" ? "yr" : "mo"}
                            </span>
                          </div>
                        </div>
                        <ul className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm"
                            >
                              <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* B2B Plans */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-500" />
                  B2B Plans
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {b2bPlans.map((plan) => (
                    <Card
                      key={plan.id}
                      className={`relative ${
                        plan.name === "Business Professional"
                          ? "border-purple-500 shadow-lg"
                          : ""
                      }`}
                    >
                      {plan.name === "Business Professional" && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-purple-500">
                            <Zap className="h-3 w-3 mr-1" />
                            Best Value
                          </Badge>
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="text-center mb-4">
                          <h4 className="font-bold text-lg">{plan.name}</h4>
                          <div className="mt-2">
                            <span className="text-3xl font-bold">
                              ${plan.price}
                            </span>
                            <span className="text-muted-foreground">/mo</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Up to{" "}
                            {plan.maxUsers === -1 ? "Unlimited" : plan.maxUsers}{" "}
                            users
                          </p>
                        </div>
                        <ul className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm"
                            >
                              <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}
