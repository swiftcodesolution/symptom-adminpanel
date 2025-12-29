// app/dashboard/[userId]/medical-history/page.tsx
"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Search,
  Tag,
  Heart,
  Pill,
  Activity,
  FileText,
  Cigarette,
  User,
  ArrowLeft,
  AlertTriangle,
  Syringe,
  Phone,
  Shield,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthFetch } from "@/lib/useAuthFetch";

interface MedicalHistoryPageProps {
  params: Promise<{ userId: string }>;
}

interface Answer {
  question: string;
  answer: string;
  summarizedAnswer: string;
}

interface UserProfile {
  displayName: string;
  answers: Answer[];
}

interface UserData {
  profile: UserProfile;
}

// Category configuration with icons and colors
const categoryConfig: Record<
  string,
  {
    icon: React.ElementType;
    color: string;
    bgColor: string;
    keywords: string[];
  }
> = {
  "Personal Information": {
    icon: User,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
    keywords: [
      "date of birth",
      "gender",
      "ethnicity",
      "height",
      "weight",
      "blood group",
    ],
  },
  "Contact Information": {
    icon: Phone,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-500/10",
    keywords: ["address", "city", "state", "zip code", "phone number"],
  },
  "Medical Conditions": {
    icon: Heart,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/10",
    keywords: [
      "blood pressure",
      "diabetes",
      "heart disease",
      "cancer",
      "fever",
      "weight changes",
    ],
  },
  "Surgical History": {
    icon: Activity,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-500/10",
    keywords: ["surgeries", "hospitalized"],
  },
  Allergies: {
    icon: AlertTriangle,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-500/10",
    keywords: ["allergies"],
  },
  Lifestyle: {
    icon: Cigarette,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-500/10",
    keywords: ["smoke", "tobacco", "alcohol", "recreational drugs"],
  },
  "Family History": {
    icon: Users,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-500/10",
    keywords: ["family history"],
  },
  Medications: {
    icon: Pill,
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-500/10",
    keywords: ["medications", "current medications"],
  },
  Vaccinations: {
    icon: Syringe,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-500/10",
    keywords: [
      "vaccine",
      "tetanus",
      "influenza",
      "flu",
      "covid",
      "hepatitis",
      "mmr",
      "chickenpox",
      "varicella",
      "pneumonia",
      "shingles",
    ],
  },
  Insurance: {
    icon: Shield,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
    keywords: ["insurance", "policy", "subscriber", "group number"],
  },
  "Emergency Contact": {
    icon: Phone,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-500/10",
    keywords: ["emergency contact", "alternate phone"],
  },
  "Additional Information": {
    icon: FileText,
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-500/10",
    keywords: [],
  },
};

// Function to categorize a question
function categorizeQuestion(question: string): string {
  const lowerQuestion = question.toLowerCase();

  for (const [category, config] of Object.entries(categoryConfig)) {
    if (config.keywords.some((keyword) => lowerQuestion.includes(keyword))) {
      return category;
    }
  }

  return "Additional Information";
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Separator />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function MedicalHistoryPage({
  params,
}: MedicalHistoryPageProps) {
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
            Unable to load medical history data.
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

  const { profile } = userData;

  // Filter answers that have actual responses
  const answeredQuestions = profile.answers.filter(
    (a) => a.answer && a.answer.trim() !== ""
  );

  // Apply search filter
  const filteredAnswers = answeredQuestions.filter(
    (record) =>
      record.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.summarizedAnswer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by category
  const groupedAnswers = filteredAnswers.reduce((acc, answer) => {
    const category = categorizeQuestion(answer.question);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(answer);
    return acc;
  }, {} as Record<string, Answer[]>);

  // Sort categories by importance
  const categoryOrder = [
    "Personal Information",
    "Contact Information",
    "Medical Conditions",
    "Allergies",
    "Surgical History",
    "Lifestyle",
    "Family History",
    "Medications",
    "Vaccinations",
    "Insurance",
    "Emergency Contact",
    "Additional Information",
  ];

  const sortedCategories = Object.keys(groupedAnswers).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  // Calculate stats
  const totalAnswered = answeredQuestions.length;
  const totalQuestions = profile.answers.length;
  const completionRate = Math.round((totalAnswered / totalQuestions) * 100);
  const categoriesWithData = sortedCategories.length;

  // Count conditions (yes answers to medical questions)
  const medicalConditions = answeredQuestions.filter((a) => {
    const isConditionQuestion =
      a.question.toLowerCase().includes("do you have") ||
      a.question.toLowerCase().includes("have you had") ||
      a.question.toLowerCase().includes("have you ever");
    return isConditionQuestion && a.answer.toLowerCase() === "yes";
  }).length;

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
          <span className="text-foreground">Medical History</span>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Medical History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Onboarding questionnaire responses for {profile.displayName}
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
                  <p className="text-2xl font-bold">{totalAnswered}</p>
                  <p className="text-xs text-muted-foreground">
                    Questions Answered
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completionRate}%</p>
                  <p className="text-xs text-muted-foreground">Completion</p>
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
                  <p className="text-2xl font-bold">{categoriesWithData}</p>
                  <p className="text-xs text-muted-foreground">Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{medicalConditions}</p>
                  <p className="text-xs text-muted-foreground">
                    Conditions Noted
                  </p>
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
              placeholder="Search questions, answers, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* History by Category */}
        {answeredQuestions.length === 0 ? (
          <motion.div variants={item}>
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No medical history records</p>
                <p className="text-sm mt-1">
                  This user hasn&apos;t completed the onboarding questionnaire
                  yet.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : filteredAnswers.length === 0 ? (
          <motion.div variants={item}>
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No matching records</p>
                <p className="text-sm mt-1">
                  No records found matching &quot;{searchQuery}&quot;
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div variants={item} className="space-y-6">
            {sortedCategories.map((category) => {
              const config = categoryConfig[category];
              const Icon = config?.icon || FileText;
              const records = groupedAnswers[category];

              return (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div
                        className={`h-8 w-8 rounded-lg ${
                          config?.bgColor || "bg-gray-500/10"
                        } flex items-center justify-center`}
                      >
                        <Icon
                          className={`h-4 w-4 ${
                            config?.color || "text-gray-600"
                          }`}
                        />
                      </div>
                      {category}
                      <Badge variant="secondary" className="ml-2">
                        {records.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {records.map((record, index) => {
                        // Determine if this is a yes/no answer
                        const isYesNo =
                          record.answer.toLowerCase() === "yes" ||
                          record.answer.toLowerCase() === "no";
                        const isYes = record.answer.toLowerCase() === "yes";

                        return (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border ${
                              isYesNo
                                ? isYes
                                  ? "bg-red-500/5 border-red-500/20"
                                  : "bg-green-500/5 border-green-500/20"
                                : "bg-muted/30"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="font-medium text-sm mb-2">
                                  {record.question}
                                </p>
                                <div className="flex items-start gap-3">
                                  {isYesNo ? (
                                    <Badge
                                      variant={
                                        isYes ? "destructive" : "default"
                                      }
                                      className="mt-0.5"
                                    >
                                      {record.answer}
                                    </Badge>
                                  ) : (
                                    <p className="text-sm text-foreground bg-background p-3 rounded-lg border flex-1">
                                      {record.answer}
                                    </p>
                                  )}
                                </div>
                                {record.summarizedAnswer &&
                                  record.summarizedAnswer !== record.answer &&
                                  record.summarizedAnswer.trim() !== "" && (
                                    <div className="mt-3 p-2 rounded bg-primary/5 border border-primary/10">
                                      <p className="text-xs text-muted-foreground mb-1">
                                        Summary
                                      </p>
                                      <p className="text-sm">
                                        {record.summarizedAnswer}
                                      </p>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>
        )}

        {/* Unanswered Questions Summary */}
        {totalAnswered < totalQuestions && (
          <motion.div variants={item}>
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-5 w-5" />
                  Unanswered Questions
                  <Badge variant="outline" className="ml-2">
                    {totalQuestions - totalAnswered}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.answers
                    .filter((a) => !a.answer || a.answer.trim() === "")
                    .slice(0, 10)
                    .map((a, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {a.question.length > 40
                          ? a.question.substring(0, 40) + "..."
                          : a.question}
                      </Badge>
                    ))}
                  {totalQuestions - totalAnswered > 10 && (
                    <Badge variant="secondary" className="text-xs">
                      +{totalQuestions - totalAnswered - 10} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
