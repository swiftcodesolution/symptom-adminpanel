// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  MessageSquare,
  Pill,
  AlertTriangle,
  Activity,
  RefreshCw,
  Heart,
  Search,
  LayoutGrid,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockUsers, getDashboardStats } from "@/lib/mock-data";
import { getRelativeTime } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState(getDashboardStats());

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats(getDashboardStats());
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setStats(getDashboardStats());
      setLoading(false);
    }, 600);
  };

  const handleUserClick = (userId: string) => {
    router.push(`/dashboard/${userId}`);
  };

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3 md:gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl"
              >
                <Heart className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </motion.div>
              <div>
                <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground">
                  Health Companion
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                  Admin Panel
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-8 px-3 hidden sm:flex">
                <Activity className="mr-2 h-3 w-3 text-green-500 animate-pulse" />
                <span className="text-xs">System Active</span>
              </Badge>
              <Button
                onClick={handleRefresh}
                disabled={loading}
                variant="outline"
                size="icon"
                className="h-9 w-9 md:h-10 md:w-10"
              >
                <RefreshCw
                  className={`w-4 h-4 md:w-5 md:h-5 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8"
        >
          {[
            {
              title: "Total Users",
              value: stats.totalUsers,
              subValue: `${stats.activeUsers} active`,
              icon: Users,
              color: "text-blue-600 dark:text-blue-400",
              bgColor: "bg-blue-500/10",
            },
            {
              title: "Symptom Chats",
              value: stats.totalChats,
              subValue: `${stats.ongoingChats} ongoing`,
              icon: MessageSquare,
              color: "text-green-600 dark:text-green-400",
              bgColor: "bg-green-500/10",
            },
            {
              title: "Medicines",
              value: stats.totalMedicines,
              subValue: `${stats.activeMedicines} with reminders`,
              icon: Pill,
              color: "text-purple-600 dark:text-purple-400",
              bgColor: "bg-purple-500/10",
            },
            {
              title: "Emergency Events",
              value: stats.recentSOS,
              subValue: "Last 7 days",
              icon: AlertTriangle,
              color: "text-red-600 dark:text-red-400",
              bgColor: "bg-red-500/10",
            },
          ].map((stat) => (
            <Card key={stat.title} className="border-border">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-foreground mt-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stat.subValue}
                    </p>
                  </div>
                  <div
                    className={`h-10 w-10 md:h-12 md:w-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}
                  >
                    <stat.icon
                      className={`h-5 w-5 md:h-6 md:w-6 ${stat.color}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Users Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <LayoutGrid className="h-5 w-5" />
                  App Users
                </CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-16 md:py-24"
                  >
                    <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-primary animate-spin mb-4" />
                    <p className="text-sm md:text-base text-muted-foreground">
                      Loading users...
                    </p>
                  </motion.div>
                ) : filteredUsers.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center py-16 md:py-24"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-muted rounded-full mb-4">
                      <Users className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
                    </div>
                    <p className="text-base md:text-lg font-semibold mb-2">
                      No Users Found
                    </p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {searchQuery
                        ? `No users matching "${searchQuery}"`
                        : "No users registered yet."}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="users"
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4"
                  >
                    {filteredUsers.map((user, index) => (
                      <motion.div
                        key={user.id}
                        variants={item}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Card
                          className="border-border hover:border-foreground/20 transition-all cursor-pointer group h-full"
                          onClick={() => handleUserClick(user.id)}
                        >
                          <CardContent className="p-4 md:p-6">
                            <div className="flex flex-col h-full">
                              {/* Avatar and Status */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-lg md:text-xl font-bold text-primary">
                                    {user.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </span>
                                </div>
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: index * 0.05 }}
                                >
                                  <div
                                    className={`h-2.5 w-2.5 rounded-full ${
                                      user.status === "active"
                                        ? "bg-green-500"
                                        : user.status === "pending"
                                        ? "bg-yellow-500"
                                        : "bg-gray-400"
                                    }`}
                                  />
                                </motion.div>
                              </div>

                              {/* User Info */}
                              <div className="flex-1">
                                <h3 className="font-semibold text-sm md:text-base text-foreground mb-1 line-clamp-1">
                                  {user.name}
                                </h3>
                                <p className="text-xs text-muted-foreground mb-3 truncate">
                                  {user.email}
                                </p>
                              </div>

                              {/* Stats */}
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  {user.chatsCount}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Pill className="h-3 w-3" />
                                  {user.medicinesCount}
                                </span>
                              </div>

                              {/* Footer */}
                              <div className="flex items-center justify-between pt-3 border-t border-border">
                                <Badge
                                  variant={
                                    user.status === "active"
                                      ? "default"
                                      : user.status === "pending"
                                      ? "outline"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {user.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {getRelativeTime(user.lastActive)}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="border-t border-border mt-auto py-6"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs md:text-sm text-center text-muted-foreground">
            Health Companion Admin Panel
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
