// app/dashboard/[userId]/page.tsx
"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  MessageSquare,
  Pill,
  Wallet,
  ClipboardList,
  AlertTriangle,
  ArrowRight,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  mockUsers,
  mockChats,
  mockMedicines,
  mockEmergencyContacts,
  mockMedicalHistory,
  mockEmergencyLogs,
} from "@/lib/mock-data";
import { formatDate, getRelativeTime } from "@/lib/utils";

interface UserOverviewProps {
  params: Promise<{ userId: string }>;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function UserOverviewPage({ params }: UserOverviewProps) {
  const { userId } = use(params);

  const user = mockUsers.find((u) => u.id === userId);

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">User not found</h1>
        <p className="text-muted-foreground mt-2">
          The user you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/dashboard" className="text-primary mt-4 inline-block">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  // Get user-specific data
  const userChats = mockChats.filter((c) => c.userId === userId);
  const userMedicines = mockMedicines.filter((m) => m.userId === userId);
  const userContacts = mockEmergencyContacts.filter((c) => c.userId === userId);
  const userHistory = mockMedicalHistory.filter((h) => h.userId === userId);
  const userEmergencyLogs = mockEmergencyLogs.filter(
    (l) => l.userId === userId
  );

  const quickLinks = [
    {
      title: "Symptom Chats",
      href: `/dashboard/${userId}/chats`,
      icon: MessageSquare,
      count: userChats.length,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-500/10",
      description: `${
        userChats.filter((c) => c.status === "ongoing").length
      } ongoing`,
    },
    {
      title: "Medicines",
      href: `/dashboard/${userId}/medicines`,
      icon: Pill,
      count: userMedicines.length,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/10",
      description: `${
        userMedicines.filter((m) => m.reminderEnabled).length
      } with reminders`,
    },
    {
      title: "Medical Wallet",
      href: `/dashboard/${userId}/medical-wallet`,
      icon: Wallet,
      count: userContacts.length,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
      description: "Contacts & Insurance",
    },
    {
      title: "Medical History",
      href: `/dashboard/${userId}/medical-history`,
      icon: ClipboardList,
      count: userHistory.length,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-500/10",
      description: "Q&A Records",
    },
    {
      title: "Emergency Logs",
      href: `/dashboard/${userId}/emergency`,
      icon: AlertTriangle,
      count: userEmergencyLogs.length,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-500/10",
      description: "SOS Events",
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
                <Badge
                  variant={
                    user.status === "active"
                      ? "default"
                      : user.status === "pending"
                      ? "outline"
                      : "secondary"
                  }
                >
                  {user.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                User Profile & Health Data
              </p>
            </div>
          </div>
          <Badge variant="outline" className="h-8 px-3 w-fit">
            <Activity className="mr-2 h-3 w-3 text-green-500" />
            <span className="text-xs">
              Last active {getRelativeTime(user.lastActive)}
            </span>
          </Badge>
        </div>
        <Separator />
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Contact Info */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{user.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="text-sm font-medium">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Links Grid */}
        <motion.div variants={item}>
          <h2 className="text-lg font-semibold mb-4">Health Data</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Card className="hover:border-foreground/20 transition-all cursor-pointer group h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`h-12 w-12 rounded-xl ${link.bgColor} flex items-center justify-center transition-transform group-hover:scale-110`}
                      >
                        <link.icon className={`h-6 w-6 ${link.color}`} />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-bold">{link.count}</h3>
                      <p className="text-sm font-medium">{link.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {link.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Chats */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/${userId}/chats`}>
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {userChats.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No recent chats
                </p>
              ) : (
                <div className="space-y-3">
                  {userChats.slice(0, 3).map((chat) => (
                    <div
                      key={chat.id}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                    >
                      <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {chat.topic}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {chat.messages.length} messages •{" "}
                          {getRelativeTime(chat.createdAt)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          chat.status === "ongoing" ? "default" : "secondary"
                        }
                      >
                        {chat.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
