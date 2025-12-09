// app/dashboard/[userId]/medicines/page.tsx
"use client";

import { use, useState } from "react";
import { motion } from "framer-motion";
import {
  Pill,
  Search,
  Clock,
  Bell,
  BellOff,
  Calendar,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockMedicines } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

interface MedicinesPageProps {
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

export default function MedicinesPage({ params }: MedicinesPageProps) {
  const { userId } = use(params);
  const [searchQuery, setSearchQuery] = useState("");

  const userMedicines = mockMedicines.filter((med) => med.userId === userId);

  const filteredMedicines = userMedicines.filter(
    (med) =>
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.dosage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: userMedicines.length,
    withReminders: userMedicines.filter((m) => m.reminderEnabled).length,
    withoutReminders: userMedicines.filter((m) => !m.reminderEnabled).length,
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
          <h1 className="text-2xl md:text-3xl font-bold">Medicine Cabinet</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Medications and reminders
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
        <motion.div variants={item} className="grid grid-cols-3 gap-4">
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
              label: "No Reminders",
              value: stats.withoutReminders,
              icon: BellOff,
              color: "text-gray-600 dark:text-gray-400",
              bgColor: "bg-gray-500/10",
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

        {/* Search */}
        <motion.div variants={item}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search medicines..."
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
                  <p>No medicines found</p>
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
                          Start Date
                        </TableHead>
                        <TableHead>Reminder</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMedicines.map((medicine) => (
                        <TableRow key={medicine.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <Pill className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div>
                                <p className="font-medium">{medicine.name}</p>
                                {medicine.notes && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <FileText className="h-3 w-3" />
                                    {medicine.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{medicine.dosage}</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {medicine.frequency}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {medicine.times.map((time) => (
                                <Badge
                                  key={time}
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
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {formatDate(medicine.startDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {medicine.reminderEnabled ? (
                              <Badge className="bg-green-500 hover:bg-green-600">
                                <Bell className="h-3 w-3 mr-1" />
                                On
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <BellOff className="h-3 w-3 mr-1" />
                                Off
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
