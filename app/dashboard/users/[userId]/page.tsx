// app/dashboard/[userId]/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Pill,
  ClipboardList,
  AlertTriangle,
  ArrowRight,
  Activity,
  MapPin,
  Heart,
  Stethoscope,
  Building2,
  Users,
  FileText,
  Shield,
  ArrowLeft,
  Droplets,
  Cigarette,
  Wine,
  Scale,
  Ruler,
  Bell,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { formatDate, getRelativeTime } from "@/lib/utils";
import Image from "next/image";

interface UserOverviewProps {
  params: Promise<{ userId: string }>;
}

// Type definitions based on API response
interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: string | null;
  photoURL: string | null;
  provider: string;
  address: string | null;
  createdAt: { _seconds: number; _nanoseconds: number };
  lastLoginAt: { _seconds: number; _nanoseconds: number };
  lastUpdated: string;
  updatedAt: string;
  answers: Array<{
    question: string;
    answer: string;
    summarizedAnswer: string;
  }>;
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
  notificationId?: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  createdAt: { _seconds: number; _nanoseconds: number };
}

interface Insurance {
  id: string;
  companyName: string;
  contactPersonName: string;
  contactPersonNo: string;
  policyNo: string;
  issueDate: string;
  expiryDate: string;
  createdAt: { _seconds: number; _nanoseconds: number };
  updatedAt: { _seconds: number; _nanoseconds: number };
}

interface Doctor {
  id: string;
  doctorName: string;
  phoneNo: string;
  email: string;
  isPrimary: boolean;
  specialization: string;
  createdAt: { _seconds: number; _nanoseconds: number };
}

interface Pharmacy {
  id: string;
  pharmacyName: string;
  address: string;
  phoneNo: string;
  email: string;
  services: string;
  createdAt: { _seconds: number; _nanoseconds: number };
}

interface PersonalContact {
  id: string;
  Name: string;
  Relation: string;
  ContactNumber: string;
  createdAt: { _seconds: number; _nanoseconds: number };
}

interface MedicalReport {
  id: string;
  name: string;
  type: string;
  url: string;
  createdAt: string;
}

interface UserPreferences {
  lastUpdated: string;
  medicationNotifications: boolean;
}

interface UserData {
  profile: UserProfile;
  personalDetails: Record<string, unknown> | null;
  insurance: Insurance[]; // Changed from Record<string, unknown> | null to Insurance[]
  preferences: UserPreferences | null;
  medicines: Medicine[];
  medicalReports: MedicalReport[];
  emergencyContacts: EmergencyContact[];
  doctors: Doctor[];
  pharmacies: Pharmacy[];
  personalContacts: PersonalContact[];
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Helper function to convert Firestore timestamp to Date
function firestoreTimestampToDate(timestamp: {
  _seconds: number;
  _nanoseconds: number;
}): Date {
  return new Date(timestamp._seconds * 1000);
}

// Helper to get answer by question keyword
function getAnswerByKeyword(
  answers: UserProfile["answers"],
  keyword: string
): string {
  const found = answers.find((a) =>
    a.question.toLowerCase().includes(keyword.toLowerCase())
  );
  return found?.answer || "";
}

// Helper to check if insurance is expired
function isExpired(expiryDate: string): boolean {
  const [day, month, year] = expiryDate.split("/").map(Number);
  const expiry = new Date(year, month - 1, day);
  return expiry < new Date();
}

// Helper to check if expiring soon (within 30 days)
function isExpiringSoon(expiryDate: string): boolean {
  const [day, month, year] = expiryDate.split("/").map(Number);
  const expiry = new Date(year, month - 1, day);
  const today = new Date();
  const diffDays = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diffDays > 0 && diffDays <= 30;
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function UserOverviewPage({ params }: UserOverviewProps) {
  const { userId } = use(params);
  const authFetch = useAuthFetch();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            The user you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have permission to view it.
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

  const {
    profile,
    medicines,
    insurance,
    emergencyContacts,
    doctors,
    pharmacies,
    personalContacts,
    medicalReports,
    preferences,
  } = userData;

  // Extract health info from answers
  const dateOfBirth = getAnswerByKeyword(profile.answers, "date of birth");
  const gender = getAnswerByKeyword(profile.answers, "gender");
  const ethnicity = getAnswerByKeyword(profile.answers, "ethnicity");
  const height = getAnswerByKeyword(profile.answers, "height");
  const weight = getAnswerByKeyword(profile.answers, "weight");
  const bloodGroup = getAnswerByKeyword(profile.answers, "blood group");
  const city = getAnswerByKeyword(profile.answers, "city");
  const state = getAnswerByKeyword(profile.answers, "state");
  const zipCode = getAnswerByKeyword(profile.answers, "zip code");

  // Health conditions
  const hasHighBP =
    getAnswerByKeyword(profile.answers, "high blood pressure").toLowerCase() ===
    "yes";
  const hasDiabetes =
    getAnswerByKeyword(profile.answers, "diabetes").toLowerCase() === "yes";
  const hasHeartDisease =
    getAnswerByKeyword(profile.answers, "heart disease").toLowerCase() ===
    "yes";
  const hasAllergies =
    getAnswerByKeyword(profile.answers, "known allergies").toLowerCase() ===
    "yes";
  const allergiesDetail = getAnswerByKeyword(
    profile.answers,
    "explain your allergies"
  );
  const hasCancer =
    getAnswerByKeyword(profile.answers, "history of cancer").toLowerCase() ===
    "yes";
  const hadSurgeries =
    getAnswerByKeyword(
      profile.answers,
      "surgeries in the past"
    ).toLowerCase() === "yes";
  const surgeriesDetail = getAnswerByKeyword(
    profile.answers,
    "explain your past surgeries"
  );

  // Lifestyle
  const smokes =
    getAnswerByKeyword(profile.answers, "smoke tobacco").toLowerCase() ===
    "yes";
  const drinksAlcohol =
    getAnswerByKeyword(profile.answers, "consume alcohol").toLowerCase() ===
    "yes";
  const usesRecreationalDrugs =
    getAnswerByKeyword(profile.answers, "recreational drugs").toLowerCase() ===
    "yes";

  const quickLinks = [
    {
      title: "Medicines",
      href: `/dashboard/users/${userId}/medicines`,
      icon: Pill,
      count: medicines.length,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/10",
      description: `${medicines.length} active medications`,
    },
    {
      title: "Insurance",
      href: `/dashboard/users/${userId}/medical-wallet`,
      icon: Shield,
      count: insurance.length,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
      description: `${
        insurance.filter((i) => !isExpired(i.expiryDate)).length
      } active plans`,
    },
    {
      title: "Doctors",
      href: `/dashboard/users/${userId}/medical-wallet`,
      icon: Stethoscope,
      count: doctors.length,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-500/10",
      description: `${doctors.filter((d) => d.isPrimary).length} primary`,
    },
    {
      title: "Pharmacies",
      href: `/dashboard/users/${userId}/medical-wallet`,
      icon: Building2,
      count: pharmacies.length,
      color: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-500/10",
      description: "Saved pharmacies",
    },
    {
      title: "Emergency Contacts",
      href: `/dashboard/users/${userId}/medical-wallet`,
      icon: AlertTriangle,
      count: emergencyContacts.length,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-500/10",
      description: "Emergency contacts",
    },
    {
      title: "Personal Contacts",
      href: `/dashboard/users/${userId}/medical-wallet`,
      icon: Users,
      count: personalContacts.length,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-500/10",
      description: "Personal contacts",
    },
    {
      title: "Medical Reports",
      href: `/dashboard/users/${userId}/reports`,
      icon: FileText,
      count: medicalReports.length,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-500/10",
      description: "Uploaded reports",
    },
  ];

  const healthConditions = [
    { label: "High Blood Pressure", value: hasHighBP, icon: Heart },
    { label: "Diabetes", value: hasDiabetes, icon: Droplets },
    { label: "Heart Disease", value: hasHeartDisease, icon: Heart },
    { label: "Cancer History", value: hasCancer, icon: Activity },
    { label: "Past Surgeries", value: hadSurgeries, icon: ClipboardList },
    { label: "Allergies", value: hasAllergies, icon: AlertTriangle },
  ];

  const lifestyleFactors = [
    { label: "Tobacco Use", value: smokes, icon: Cigarette },
    { label: "Alcohol Consumption", value: drinksAlcohol, icon: Wine },
    { label: "Recreational Drugs", value: usesRecreationalDrugs, icon: Pill },
  ];

  // Get active insurance count
  // const activeInsurance = insurance.filter((i) => !isExpired(i.expiryDate));
  const expiringInsurance = insurance.filter((i) =>
    isExpiringSoon(i.expiryDate)
  );

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
          <span className="text-foreground">{profile.displayName}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              {profile.photoURL ? (
                <Image
                  width={64}
                  height={64}
                  src={profile.photoURL}
                  alt={profile.displayName}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-primary">
                  {profile.displayName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {profile.displayName}
                </h1>
                <Badge variant={profile.emailVerified ? "default" : "outline"}>
                  {profile.emailVerified ? "Verified" : "Unverified"}
                </Badge>
                <Badge variant="secondary">{profile.provider}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {gender && `${gender} • `}
                {dateOfBirth && `DOB: ${dateOfBirth}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="h-8 px-3">
              <Activity className="mr-2 h-3 w-3 text-green-500" />
              <span className="text-xs">
                Last login{" "}
                {getRelativeTime(
                  firestoreTimestampToDate(profile.lastLoginAt).toISOString()
                )}
              </span>
            </Badge>
            {preferences?.medicationNotifications && (
              <Badge variant="outline" className="h-8 px-3">
                <Bell className="mr-2 h-3 w-3" />
                <span className="text-xs">Notifications On</span>
              </Badge>
            )}
          </div>
        </div>
        <Separator />
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="health">Health Info</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium truncate">
                          {profile.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium">
                          {profile.phoneNumber || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Location
                        </p>
                        <p className="text-sm font-medium">
                          {city && state ? `${city}, ${state}` : "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Joined</p>
                        <p className="text-sm font-medium">
                          {formatDate(
                            firestoreTimestampToDate(
                              profile.createdAt
                            ).toISOString()
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {profile.address && (
                    <div className="mt-4 p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">
                        Full Address
                      </p>
                      <p className="text-sm font-medium">
                        {profile.address}
                        {city && `, ${city}`}
                        {state && `, ${state}`}
                        {zipCode && ` ${zipCode}`}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Physical Stats */}
            <motion.div variants={item}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Physical Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <Ruler className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                      <p className="text-2xl font-bold">{height || "—"}</p>
                      <p className="text-xs text-muted-foreground">Height</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <Scale className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                      <p className="text-2xl font-bold">
                        {weight ? `${weight} lbs` : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">Weight</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <Droplets className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                      <p className="text-2xl font-bold">{bloodGroup || "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        Blood Group
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <User className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                      <p className="text-2xl font-bold capitalize">
                        {ethnicity || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">Ethnicity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Insurance Alert */}
            {expiringInsurance.length > 0 && (
              <motion.div variants={item}>
                <Card className="border-yellow-500/50 bg-yellow-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                      <Shield className="h-4 w-4" />
                      Insurance Expiring Soon
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {expiringInsurance.map((ins) => (
                        <Badge
                          key={ins.id}
                          variant="outline"
                          className="border-yellow-500/50"
                        >
                          {ins.companyName} - Expires {ins.expiryDate}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Quick Links Grid */}
            <motion.div variants={item}>
              <h2 className="text-lg font-semibold mb-4">Health Data</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickLinks.map((link) => (
                  <Link key={link.title} href={link.href}>
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

            {/* Recent Medicines */}
            {medicines.length > 0 && (
              <motion.div variants={item}>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Pill className="h-5 w-5" />
                        Current Medications
                      </CardTitle>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/users/${userId}/medicines`}>
                          View All
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {medicines.slice(0, 3).map((medicine) => (
                        <div
                          key={medicine.id}
                          className="flex items-center gap-3 p-3 rounded-lg border"
                        >
                          <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Pill className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {medicine.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {medicine.dosage} • {medicine.frequency}x daily •{" "}
                              {medicine.timeToTake}
                            </p>
                          </div>
                          <Badge variant="outline">
                            Refill: {medicine.refillDate}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Insurance Overview */}
            {insurance.length > 0 && (
              <motion.div variants={item}>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Insurance Plans
                      </CardTitle>
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/dashboard/users/${userId}/medical-wallet`}
                        >
                          View All
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insurance.slice(0, 2).map((ins) => {
                        const expired = isExpired(ins.expiryDate);
                        const expiringSoon = isExpiringSoon(ins.expiryDate);

                        return (
                          <div
                            key={ins.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border ${
                              expired
                                ? "bg-red-500/5 border-red-500/30"
                                : expiringSoon
                                ? "bg-yellow-500/5 border-yellow-500/30"
                                : "bg-blue-500/5 border-blue-500/20"
                            }`}
                          >
                            <div
                              className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                expired
                                  ? "bg-red-500/10"
                                  : expiringSoon
                                  ? "bg-yellow-500/10"
                                  : "bg-blue-500/10"
                              }`}
                            >
                              <Shield
                                className={`h-5 w-5 ${
                                  expired
                                    ? "text-red-600 dark:text-red-400"
                                    : expiringSoon
                                    ? "text-yellow-600 dark:text-yellow-400"
                                    : "text-blue-600 dark:text-blue-400"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {ins.companyName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Policy: {ins.policyNo} • Expires:{" "}
                                {ins.expiryDate}
                              </p>
                            </div>
                            {expired ? (
                              <Badge variant="destructive">Expired</Badge>
                            ) : expiringSoon ? (
                              <Badge
                                variant="outline"
                                className="border-yellow-500 text-yellow-600"
                              >
                                Expiring Soon
                              </Badge>
                            ) : (
                              <Badge variant="default">Active</Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </TabsContent>

        {/* Health Info Tab */}
        <TabsContent value="health">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* Health Conditions */}
            <motion.div variants={item}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Health Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {healthConditions.map((condition) => (
                      <div
                        key={condition.label}
                        className={`p-4 rounded-lg border ${
                          condition.value
                            ? "bg-red-500/10 border-red-500/20"
                            : "bg-green-500/10 border-green-500/20"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <condition.icon
                            className={`h-4 w-4 ${
                              condition.value
                                ? "text-red-600 dark:text-red-400"
                                : "text-green-600 dark:text-green-400"
                            }`}
                          />
                          <span className="text-sm font-medium">
                            {condition.label}
                          </span>
                        </div>
                        <Badge
                          variant={condition.value ? "destructive" : "default"}
                          className="text-xs"
                        >
                          {condition.value ? "Yes" : "No"}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* Additional Details */}
                  {(allergiesDetail || surgeriesDetail) && (
                    <div className="mt-4 space-y-3">
                      {allergiesDetail && (
                        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                          <p className="text-xs text-muted-foreground mb-1">
                            Allergies Detail
                          </p>
                          <p className="text-sm font-medium">
                            {allergiesDetail}
                          </p>
                        </div>
                      )}
                      {surgeriesDetail && (
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <p className="text-xs text-muted-foreground mb-1">
                            Past Surgeries
                          </p>
                          <p className="text-sm font-medium">
                            {surgeriesDetail}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Lifestyle Factors */}
            <motion.div variants={item}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Lifestyle Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {lifestyleFactors.map((factor) => (
                      <div
                        key={factor.label}
                        className={`p-4 rounded-lg border text-center ${
                          factor.value
                            ? "bg-orange-500/10 border-orange-500/20"
                            : "bg-green-500/10 border-green-500/20"
                        }`}
                      >
                        <factor.icon
                          className={`h-8 w-8 mx-auto mb-2 ${
                            factor.value
                              ? "text-orange-600 dark:text-orange-400"
                              : "text-green-600 dark:text-green-400"
                          }`}
                        />
                        <p className="text-sm font-medium mb-1">
                          {factor.label}
                        </p>
                        <Badge
                          variant={factor.value ? "outline" : "default"}
                          className="text-xs"
                        >
                          {factor.value ? "Yes" : "No"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* All Medical Q&A */}
            <motion.div variants={item}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Complete Medical History Q&A
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {profile.answers
                      .filter((a) => a.answer && a.answer.trim() !== "")
                      .map((qa, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="text-sm text-left">
                            {qa.question}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2">
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground mb-1">
                                  Answer
                                </p>
                                <p className="text-sm font-medium">
                                  {qa.answer}
                                </p>
                              </div>
                              {qa.summarizedAnswer && (
                                <div className="p-3 rounded-lg bg-primary/5">
                                  <p className="text-xs text-muted-foreground mb-1">
                                    Summary
                                  </p>
                                  <p className="text-sm">
                                    {qa.summarizedAnswer}
                                  </p>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* Doctors */}
            <motion.div variants={item}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Stethoscope className="h-5 w-5" />
                      Doctors ({doctors.length})
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/users/${userId}/medical-wallet`}>
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {doctors.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No doctors added
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {doctors
                        .sort((a, b) =>
                          a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1
                        )
                        .map((doctor) => (
                          <div
                            key={doctor.id}
                            className={`p-4 rounded-lg border space-y-3 ${
                              doctor.isPrimary
                                ? "bg-green-500/5 border-green-500/30"
                                : ""
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                    doctor.isPrimary
                                      ? "bg-green-500/20"
                                      : "bg-blue-500/10"
                                  }`}
                                >
                                  <Stethoscope
                                    className={`h-5 w-5 ${
                                      doctor.isPrimary
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-blue-600 dark:text-blue-400"
                                    }`}
                                  />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {doctor.doctorName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {doctor.specialization}
                                  </p>
                                </div>
                              </div>
                              {doctor.isPrimary && (
                                <Badge className="bg-green-500 hover:bg-green-600">
                                  <Star className="h-3 w-3 mr-1" />
                                  Primary
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <span>{doctor.phoneNo}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span className="truncate">{doctor.email}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Pharmacies */}
            <motion.div variants={item}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Pharmacies ({pharmacies.length})
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/users/${userId}/medical-wallet`}>
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {pharmacies.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No pharmacies added
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pharmacies.map((pharmacy) => (
                        <div
                          key={pharmacy.id}
                          className="p-4 rounded-lg border space-y-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {pharmacy.pharmacyName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {pharmacy.services}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4 shrink-0" />
                              <span className="truncate">
                                {pharmacy.address}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              <span>{pharmacy.phoneNo}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              <span className="truncate">{pharmacy.email}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Emergency Contacts */}
            <motion.div variants={item}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Emergency Contacts ({emergencyContacts.length})
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/users/${userId}/medical-wallet`}>
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {emergencyContacts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No emergency contacts added
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {emergencyContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="p-4 rounded-lg border bg-red-500/5 border-red-500/20 space-y-2"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <p className="font-medium">{contact.name}</p>
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {contact.relation}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{contact.phone}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Personal Contacts */}
            <motion.div variants={item}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Personal Contacts ({personalContacts.length})
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/users/${userId}/medical-wallet`}>
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {personalContacts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No personal contacts added
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {personalContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="p-4 rounded-lg border space-y-2"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                              <p className="font-medium">{contact.Name}</p>
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {contact.Relation}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{contact.ContactNumber}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* Account History */}
            <motion.div variants={item}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Account Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Account Created</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(
                            firestoreTimestampToDate(
                              profile.createdAt
                            ).toISOString()
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Last Login</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(
                            firestoreTimestampToDate(
                              profile.lastLoginAt
                            ).toISOString()
                          )}
                        </p>
                      </div>
                    </div>
                    {profile.lastUpdated && (
                      <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                        <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Profile Updated</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(profile.lastUpdated)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Medical Reports */}
            <motion.div variants={item}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Medical Reports ({medicalReports.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {medicalReports.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No medical reports uploaded
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {medicalReports.map((report) => (
                        <div
                          key={report.id}
                          className="flex items-center gap-3 p-3 rounded-lg border"
                        >
                          <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {report.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {report.type} • {formatDate(report.createdAt)}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={report.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Preferences */}
            {preferences && (
              <motion.div variants={item}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      User Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Bell className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm">
                            Medication Notifications
                          </span>
                        </div>
                        <Badge
                          variant={
                            preferences.medicationNotifications
                              ? "default"
                              : "secondary"
                          }
                        >
                          {preferences.medicationNotifications
                            ? "Enabled"
                            : "Disabled"}
                        </Badge>
                      </div>
                      {preferences.lastUpdated && (
                        <p className="text-xs text-muted-foreground">
                          Last updated: {formatDate(preferences.lastUpdated)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
