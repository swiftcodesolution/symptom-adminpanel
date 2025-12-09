// app/dashboard/page.tsx
"use client";

import { motion } from "framer-motion";
import {
  Users,
  Building2,
  DollarSign,
  CreditCard,
  TrendingUp,
  Activity,
  RefreshCw,
  Heart,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  mockUsers,
  mockCompanies,
  mockB2CSubscriptions,
  mockSubscriptionPlans,
} from "@/lib/mock-data";
import { getSubscriptionStats } from "@/lib/utils";
import { useState } from "react";

const stats = getSubscriptionStats();

export default function DashboardPage() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Heart className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Health Companion</h1>
                <p className="text-sm text-muted-foreground">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="hidden sm:flex">
                <Activity className="w-3 h-3 mr-1.5 text-green-500 animate-pulse" />
                Live
              </Badge>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Stats Grid */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Total Users */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-4xl font-bold mt-2">{mockUsers.length}</p>
                  <p className="text-xs text-green-600 mt-2">
                    +12% from last month
                  </p>
                </div>
                <Users className="w-12 h-12 text-blue-600/20" />
              </div>
              <Button asChild variant="default" className="w-full mt-6">
                <Link
                  href="/dashboard/users"
                  className="flex items-center justify-center gap-2"
                >
                  Manage Users
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Active Subscriptions */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Subscriptions
                  </p>
                  <p className="text-4xl font-bold mt-2">
                    {stats.activeB2CSubscriptions}
                  </p>
                  <p className="text-xs text-green-600 mt-2">+8% growth</p>
                </div>
                <CreditCard className="w-12 h-12 text-green-600/20" />
              </div>
              <Button asChild variant="default" className="w-full mt-6">
                <Link
                  href="/dashboard/subscriptions"
                  className="flex items-center justify-center gap-2"
                >
                  Manage Subscriptions
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Companies */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Companies</p>
                  <p className="text-4xl font-bold mt-2">
                    {mockCompanies.length}
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    2 new this month
                  </p>
                </div>
                <Building2 className="w-12 h-12 text-purple-600/20" />
              </div>
              <Button asChild variant="default" className="w-full mt-6">
                <Link
                  href="/dashboard/companies"
                  className="flex items-center justify-center gap-2"
                >
                  Manage Companies
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Monthly Revenue */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Monthly Revenue
                  </p>
                  <p className="text-4xl font-bold mt-2">
                    ${stats.monthlyRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    +23% vs last month
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-emerald-600/20" />
              </div>
              <Button asChild variant="default" className="w-full mt-6">
                <Link
                  href="/dashboard/subscriptions"
                  className="flex items-center justify-center gap-2"
                >
                  View Revenue
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bottom Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Revenue Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">B2C Revenue</span>
                <span className="font-semibold">
                  $
                  {mockB2CSubscriptions
                    .filter((s) => s.status === "active")
                    .reduce((a, s) => a + s.amount, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">B2B Revenue</span>
                <span className="font-semibold">
                  $
                  {mockCompanies
                    .filter((c) => c.status === "active")
                    .reduce((sum, c) => {
                      const plan = mockSubscriptionPlans.find(
                        (p) => p.id === c.planId
                      );
                      return sum + (plan?.price || 0);
                    }, 0)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total MRR</span>
                <span className="text-green-600">${stats.monthlyRevenue}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Trial Users</span>
                <span className="font-medium text-orange-600">
                  {stats.trialUsers}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Churn Rate</span>
                <span className="font-medium text-red-600">
                  {stats.churnRate}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ARPU</span>
                <span className="font-medium">
                  $
                  {(
                    stats.monthlyRevenue / stats.activeB2CSubscriptions || 0
                  ).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Jennifer M. signed up</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>McDonald&apos;s renewed plan</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span>TechStart upgraded</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <span>Trial started – David B.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
