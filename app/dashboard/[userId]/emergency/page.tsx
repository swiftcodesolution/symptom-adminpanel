// app/dashboard/[userId]/emergency/page.tsx
"use client";

import { use, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Filter,
  Phone,
  MapPin,
  Clock,
  Shield,
  PhoneCall,
  CheckCircle,
  XCircle,
  AlertCircle,
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
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockEmergencyLogs } from "@/lib/mock-data";
import { formatDateTime } from "@/lib/utils";

interface EmergencyPageProps {
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

const statusConfig = {
  triggered: {
    label: "Triggered",
    icon: AlertCircle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/10",
    badgeVariant: "destructive" as const,
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-500/10",
    badgeVariant: "default" as const,
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-500/10",
    badgeVariant: "secondary" as const,
  },
};

const typeConfig = {
  "911": {
    label: "911 Call",
    icon: Phone,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/10",
  },
  emergency_contact: {
    label: "Emergency Contact",
    icon: PhoneCall,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-500/10",
  },
};

export default function EmergencyPage({ params }: EmergencyPageProps) {
  const { userId } = use(params);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const userLogs = mockEmergencyLogs.filter((log) => log.userId === userId);

  const filteredLogs = userLogs.filter((log) => {
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    const matchesType = typeFilter === "all" || log.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const stats = {
    total: userLogs.length,
    triggered: userLogs.filter((l) => l.status === "triggered").length,
    resolved: userLogs.filter((l) => l.status === "resolved").length,
    cancelled: userLogs.filter((l) => l.status === "cancelled").length,
    calls911: userLogs.filter((l) => l.type === "911").length,
    contactCalls: userLogs.filter((l) => l.type === "emergency_contact").length,
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Emergency SOS Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Emergency events and SOS history
          </p>
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
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            {
              label: "Total Events",
              value: stats.total,
              icon: AlertTriangle,
              color: "text-blue-600 dark:text-blue-400",
              bgColor: "bg-blue-500/10",
            },
            {
              label: "Active",
              value: stats.triggered,
              icon: AlertCircle,
              color: "text-red-600 dark:text-red-400",
              bgColor: "bg-red-500/10",
            },
            {
              label: "Resolved",
              value: stats.resolved,
              icon: CheckCircle,
              color: "text-green-600 dark:text-green-400",
              bgColor: "bg-green-500/10",
            },
            {
              label: "911 Calls",
              value: stats.calls911,
              icon: Phone,
              color: "text-red-600 dark:text-red-400",
              bgColor: "bg-red-500/10",
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

        {/* Filters */}
        <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0">
                <Filter className="h-4 w-4 mr-2" />
                {statusFilter === "all"
                  ? "All Status"
                  : statusConfig[statusFilter as keyof typeof statusConfig]
                      ?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("triggered")}>
                Triggered
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("resolved")}>
                Resolved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>
                Cancelled
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0">
                <Shield className="h-4 w-4 mr-2" />
                {typeFilter === "all"
                  ? "All Types"
                  : typeConfig[typeFilter as keyof typeof typeConfig]?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setTypeFilter("all")}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("911")}>
                911 Call
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTypeFilter("emergency_contact")}
              >
                Emergency Contact
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>

        {/* Logs Table */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Emergency Events ({filteredLogs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No emergency events</p>
                  <p className="text-xs mt-1">
                    {userLogs.length === 0
                      ? "No SOS events recorded for this user"
                      : "No events match the selected filters"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Location
                        </TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Time
                        </TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => {
                        const typeInfo = typeConfig[log.type];
                        const statusInfo = statusConfig[log.status];
                        const TypeIcon = typeInfo.icon;
                        const StatusIcon = statusInfo.icon;

                        return (
                          <TableRow key={log.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div
                                  className={`h-10 w-10 rounded-lg ${typeInfo.bgColor} flex items-center justify-center`}
                                >
                                  <TypeIcon
                                    className={`h-5 w-5 ${typeInfo.color}`}
                                  />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">
                                    {typeInfo.label}
                                  </p>
                                  <p className="text-xs text-muted-foreground sm:hidden">
                                    {formatDateTime(log.timestamp)}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {log.type === "emergency_contact" &&
                              log.contactName ? (
                                <div className="flex items-center gap-1">
                                  <PhoneCall className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">
                                    {log.contactName}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  911 Services
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {log.location ? (
                                <div className="flex items-center gap-1 text-sm">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="truncate max-w-[200px]">
                                    {log.location}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  —
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatDateTime(log.timestamp)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusInfo.badgeVariant}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusInfo.label}
                              </Badge>
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

        {/* Active Alerts Warning */}
        {stats.triggered > 0 && (
          <motion.div
            variants={item}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-red-500/50 bg-red-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center animate-pulse">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-600 dark:text-red-400">
                      {stats.triggered} Active Emergency Alert
                      {stats.triggered > 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Immediate attention may be required
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
