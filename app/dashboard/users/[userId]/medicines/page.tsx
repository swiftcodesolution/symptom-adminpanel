// app/dashboard/[userId]/medicines/page.tsx
"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Pill,
  Search,
  Clock,
  Bell,
  BellOff,
  Calendar,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthFetch } from "@/lib/useAuthFetch";

interface MedicinesPageProps {
  params: Promise<{ userId: string }>;
}

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timeToTake: string;
  refillDate: string;
  date: string;
  daysOfWeek: number[];
  createdAt: string;
  updatedAt: string;
  lastScheduled?: string;
  notificationId?: string;
}

interface UserData {
  profile: {
    displayName: string;
  };
  medicines: Medicine[];
  preferences: {
    medicationNotifications: boolean;
  } | null;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Helper to convert day number to name
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDayNames(days: number[]): string {
  if (days.length === 7) return "Every day";
  if (days.length === 0) return "No days selected";
  return days.map((d) => dayNames[d % 7]).join(", ");
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Separator />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

export default function MedicinesPage({ params }: MedicinesPageProps) {
  const { userId } = use(params);
  const authFetch = useAuthFetch();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        setError(null);

        const response = await authFetch(`/panel/api/admin/users/${userId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("User not found");
          } else {
            setError("Failed to fetch user data");
          }
          return;
        }

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [userId, authFetch]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !userData) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">{error || "User not found"}</h1>
          <p className="text-muted-foreground mt-2">
            Unable to load medicines data.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const { profile, medicines, preferences } = userData;

  const filteredMedicines = medicines.filter(
    (med) =>
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.dosage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const hasNotifications = preferences?.medicationNotifications ?? false;
  const medicinesWithNotifications = medicines.filter(
    (m) => m.notificationId && m.notificationId.length > 0
  );

  const stats = {
    total: medicines.length,
    withReminders: medicinesWithNotifications.length,
    withoutReminders: medicines.length - medicinesWithNotifications.length,
  };

  // Check for upcoming refills (within 7 days)
  const today = new Date();
  const upcomingRefills = medicines.filter((med) => {
    if (!med.refillDate) return false;
    const [day, month, year] = med.refillDate.split("/").map(Number);
    const refillDate = new Date(year, month - 1, day);
    const diffDays = Math.ceil(
      (refillDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays >= 0 && diffDays <= 7;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link
            href="/dashboard"
            className="hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <span>/</span>
          <Link
            href={`/dashboard/${userId}`}
            className="hover:text-foreground transition-colors"
          >
            {profile.displayName}
          </Link>
          <span>/</span>
          <span className="text-foreground">Medicines</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Medicine Cabinet</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Medications and reminders for {profile.displayName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasNotifications ? (
              <Badge variant="default" className="h-8">
                <Bell className="mr-2 h-3 w-3" />
                Notifications Enabled
              </Badge>
            ) : (
              <Badge variant="secondary" className="h-8">
                <BellOff className="mr-2 h-3 w-3" />
                Notifications Disabled
              </Badge>
            )}
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
        {/* Stats */}
        <motion.div
          variants={item}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            {
              label: "Total Medicines",
              value: stats.total,
              icon: Pill,
              color: "text-purple-600 dark:text-purple-400",
              bgColor: "bg-purple-500/10",
            },
            {
              label: "With Reminders",
              value: stats.withReminders,
              icon: Bell,
              color: "text-green-600 dark:text-green-400",
              bgColor: "bg-green-500/10",
            },
            {
              label: "Upcoming Refills",
              value: upcomingRefills.length,
              icon: RefreshCw,
              color: "text-orange-600 dark:text-orange-400",
              bgColor: "bg-orange-500/10",
            },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}
                  >
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
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

        {/* Upcoming Refills Alert */}
        {upcomingRefills.length > 0 && (
          <motion.div variants={item}>
            <Card className="border-orange-500/50 bg-orange-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <RefreshCw className="h-4 w-4" />
                  Upcoming Refills (Next 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {upcomingRefills.map((med) => (
                    <Badge
                      key={med.id}
                      variant="outline"
                      className="border-orange-500/50"
                    >
                      {med.name} - {med.refillDate}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Search */}
        <motion.div variants={item}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search medicines by name or dosage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Medicines Table */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Medications ({filteredMedicines.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredMedicines.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No medicines found</p>
                  <p className="text-sm mt-1">
                    {medicines.length === 0
                      ? "This user hasn't added any medications yet."
                      : "Try adjusting your search query."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Frequency
                        </TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Times
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Days
                        </TableHead>
                        <TableHead className="hidden xl:table-cell">
                          Refill Date
                        </TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMedicines.map((medicine) => {
                        const hasReminder =
                          medicine.notificationId &&
                          medicine.notificationId.length > 0;

                        return (
                          <TableRow key={medicine.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                                  <Pill className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium truncate">
                                    {medicine.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Added{" "}
                                    {new Date(
                                      medicine.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {medicine.dosage}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <span className="text-sm">
                                {medicine.frequency}x daily
                              </span>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <div className="flex flex-wrap gap-1 max-w-50">
                                {medicine.timeToTake
                                  .split(", ")
                                  .map((time, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      <Clock className="h-3 w-3 mr-1" />
                                      {time}
                                    </Badge>
                                  ))}
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <span className="text-sm text-muted-foreground">
                                {getDayNames(medicine.daysOfWeek)}
                              </span>
                            </TableCell>
                            <TableCell className="hidden xl:table-cell">
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span>{medicine.refillDate}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {hasReminder ? (
                                <Badge className="bg-green-500 hover:bg-green-600">
                                  <Bell className="h-3 w-3 mr-1" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <BellOff className="h-3 w-3 mr-1" />
                                  No Reminder
                                </Badge>
                              )}
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

        {/* Medicine Cards (Mobile-friendly alternative view) */}
        <motion.div variants={item} className="md:hidden space-y-3">
          {filteredMedicines.map((medicine) => {
            const hasReminder =
              medicine.notificationId && medicine.notificationId.length > 0;

            return (
              <Card key={medicine.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                        <Pill className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium">{medicine.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {medicine.dosage}
                        </p>
                      </div>
                    </div>
                    {hasReminder ? (
                      <Badge className="bg-green-500">
                        <Bell className="h-3 w-3" />
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <BellOff className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Frequency:</span>
                      <span>{medicine.frequency}x daily</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Times:</span>
                      <span className="text-right">{medicine.timeToTake}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Days:</span>
                      <span>{getDayNames(medicine.daysOfWeek)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Refill:</span>
                      <span>{medicine.refillDate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}
