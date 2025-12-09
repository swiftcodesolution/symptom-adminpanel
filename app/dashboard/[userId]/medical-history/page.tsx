// app/dashboard/[userId]/medical-history/page.tsx
"use client";

import { use, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Search,
  Calendar,
  Tag,
  Heart,
  Pill,
  Activity,
  FileText,
  Cigarette,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { mockMedicalHistory } from "@/lib/mock-data";
import { formatDateTime } from "@/lib/utils";

interface MedicalHistoryPageProps {
  params: Promise<{ userId: string }>;
}

const categoryConfig: Record<
  string,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  Conditions: {
    icon: Heart,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/10",
  },
  Allergies: {
    icon: Pill,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-500/10",
  },
  "Surgical History": {
    icon: Activity,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  Lifestyle: {
    icon: Cigarette,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  Medications: {
    icon: Pill,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-500/10",
  },
  "Family History": {
    icon: User,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-500/10",
  },
};

const getDefaultConfig = () => ({
  icon: FileText,
  color: "text-gray-600 dark:text-gray-400",
  bgColor: "bg-gray-500/10",
});

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function MedicalHistoryPage({
  params,
}: MedicalHistoryPageProps) {
  const { userId } = use(params);
  const [searchQuery, setSearchQuery] = useState("");

  const userHistory = mockMedicalHistory.filter((h) => h.userId === userId);

  const filteredHistory = userHistory.filter(
    (record) =>
      record.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by category
  const groupedHistory = filteredHistory.reduce((acc, record) => {
    if (!acc[record.category]) {
      acc[record.category] = [];
    }
    acc[record.category].push(record);
    return acc;
  }, {} as Record<string, typeof filteredHistory>);

  const categories = Object.keys(groupedHistory);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Medical History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Onboarding questionnaire responses
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
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userHistory.length}</p>
                  <p className="text-xs text-muted-foreground">Total Records</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{categories.length}</p>
                  <p className="text-xs text-muted-foreground">Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search */}
        <motion.div variants={item}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions or answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* History by Category */}
        {userHistory.length === 0 ? (
          <motion.div variants={item}>
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No medical history records</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : filteredHistory.length === 0 ? (
          <motion.div variants={item}>
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No records matching &quot;{searchQuery}&quot;</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div variants={item} className="space-y-6">
            {categories.map((category) => {
              const config = categoryConfig[category] || getDefaultConfig();
              const Icon = config.icon;
              const records = groupedHistory[category];

              return (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div
                        className={`h-8 w-8 rounded-lg ${config.bgColor} flex items-center justify-center`}
                      >
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      {category}
                      <Badge variant="secondary" className="ml-2">
                        {records.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {records.map((record) => (
                        <div
                          key={record.id}
                          className="p-4 rounded-lg border bg-muted/30"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium text-sm mb-2">
                                {record.question}
                              </p>
                              <p className="text-sm text-foreground bg-background p-3 rounded-lg border">
                                {record.answer}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDateTime(record.answeredAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
