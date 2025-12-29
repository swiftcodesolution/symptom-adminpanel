// app/dashboard/[userId]/emergency/page.tsx
"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Phone,
  MapPin,
  Shield,
  PhoneCall,
  User,
  Mail,
  Heart,
  Stethoscope,
  ArrowLeft,
  Copy,
  Check,
  Star,
  Droplets,
  FileText,
  Pill,
  Building2,
  CreditCard,
  AlertCircle,
  Printer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { toast } from "sonner";

interface EmergencyPageProps {
  params: Promise<{ userId: string }>;
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
}

interface Doctor {
  id: string;
  doctorName: string;
  phoneNo: string;
  email: string;
  isPrimary: boolean;
  specialization: string;
}

interface Pharmacy {
  id: string;
  pharmacyName: string;
  address: string;
  phoneNo: string;
  email: string;
  services: string;
}

interface PersonalContact {
  id: string;
  Name: string;
  Relation: string;
  ContactNumber: string;
}

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timeToTake: string;
}

interface UserProfile {
  displayName: string;
  phoneNumber: string | null;
  email: string;
  address: string | null;
  answers: Array<{
    question: string;
    answer: string;
    summarizedAnswer: string;
  }>;
}

interface UserData {
  profile: UserProfile;
  emergencyContacts: EmergencyContact[];
  insurance: Insurance[];
  doctors: Doctor[];
  pharmacies: Pharmacy[];
  personalContacts: PersonalContact[];
  medicines: Medicine[];
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Helper to get answer by keyword
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

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Separator />
      <Skeleton className="h-32 rounded-lg" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  );
}

export default function EmergencyPage({ params }: EmergencyPageProps) {
  const { userId } = use(params);
  const authFetch = useAuthFetch();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

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

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);

      // Success toast
      toast.success(`${label} copied successfully`);

      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);

      // Error toast
      toast.error("Could not copy to clipboard");
    }
  };

  const handlePrint = () => {
    window.print();
  };

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
            Unable to load emergency information.
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
    emergencyContacts,
    insurance,
    doctors,
    pharmacies,
    personalContacts,
    medicines,
  } = userData;

  // Get health conditions from answers
  const dateOfBirth = getAnswerByKeyword(profile.answers, "date of birth");
  const gender = getAnswerByKeyword(profile.answers, "gender");
  const bloodGroup = getAnswerByKeyword(profile.answers, "blood group");
  const height = getAnswerByKeyword(profile.answers, "height");
  const weight = getAnswerByKeyword(profile.answers, "weight");

  const hasAllergies =
    getAnswerByKeyword(profile.answers, "known allergies").toLowerCase() ===
    "yes";
  const allergiesDetail = getAnswerByKeyword(
    profile.answers,
    "explain your allergies"
  );
  const hasHighBP =
    getAnswerByKeyword(profile.answers, "high blood pressure").toLowerCase() ===
    "yes";
  const hasDiabetes =
    getAnswerByKeyword(profile.answers, "diabetes").toLowerCase() === "yes";
  const hasHeartDisease =
    getAnswerByKeyword(profile.answers, "heart disease").toLowerCase() ===
    "yes";
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

  // Get primary doctor and active insurance
  const primaryDoctor = doctors.find((d) => d.isPrimary);
  const activeInsurance = insurance.filter((i) => !isExpired(i.expiryDate));
  const primaryInsurance = activeInsurance[0];

  // Stats
  const criticalConditions = [
    hasHighBP,
    hasDiabetes,
    hasHeartDisease,
    hasCancer,
    hasAllergies,
  ].filter(Boolean).length;

  // All contacts for quick dial (prioritized)
  const allContacts = [
    ...emergencyContacts.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      relation: c.relation,
      type: "emergency" as const,
      priority: 1,
    })),
    ...doctors
      .filter((d) => d.isPrimary)
      .map((d) => ({
        id: d.id,
        name: d.doctorName,
        phone: d.phoneNo,
        relation: d.specialization,
        type: "doctor" as const,
        priority: 2,
      })),
    ...personalContacts.slice(0, 2).map((c) => ({
      id: c.id,
      name: c.Name,
      phone: c.ContactNumber,
      relation: c.Relation,
      type: "personal" as const,
      priority: 3,
    })),
  ].sort((a, b) => a.priority - b.priority);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 print:p-2">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 print:hidden">
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
          <span className="text-foreground">Emergency Info</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <AlertTriangle className="h-7 w-7 text-red-500" />
              Emergency Information
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Critical contacts, medical info & insurance for{" "}
              {profile.displayName}
            </p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="destructive" size="lg" asChild>
              <a href="tel:911">
                <Phone className="mr-2 h-5 w-5" />
                Call 911
              </a>
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
        {/* Patient ID Card - Critical Info at a Glance */}
        <motion.div variants={item}>
          <Card className="border-2 border-red-500/50 bg-linear-to-r from-red-500/5 to-orange-500/5">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Patient Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center border-2 border-red-500/30">
                      <User className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        {profile.displayName}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {gender && <span className="capitalize">{gender}</span>}
                        {dateOfBirth && (
                          <>
                            <span>•</span>
                            <span>DOB: {dateOfBirth}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 rounded bg-background/50">
                      <span className="text-muted-foreground">Phone:</span>
                      <p className="font-medium">
                        {profile.phoneNumber || "N/A"}
                      </p>
                    </div>
                    <div className="p-2 rounded bg-background/50">
                      <span className="text-muted-foreground">
                        Height/Weight:
                      </span>
                      <p className="font-medium">
                        {height || "—"} / {weight ? `${weight} lbs` : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Critical Medical Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Critical Medical Info
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                      <Droplets className="h-5 w-5 mx-auto text-red-600 mb-1" />
                      <p className="text-xs text-muted-foreground">
                        Blood Type
                      </p>
                      <p className="text-lg font-bold text-red-600">
                        {bloodGroup || "Unknown"}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-lg border text-center ${
                        hasAllergies
                          ? "bg-orange-500/10 border-orange-500/20"
                          : "bg-green-500/10 border-green-500/20"
                      }`}
                    >
                      <AlertCircle
                        className={`h-5 w-5 mx-auto mb-1 ${
                          hasAllergies ? "text-orange-600" : "text-green-600"
                        }`}
                      />
                      <p className="text-xs text-muted-foreground">Allergies</p>
                      <p
                        className={`text-sm font-bold ${
                          hasAllergies ? "text-orange-600" : "text-green-600"
                        }`}
                      >
                        {hasAllergies ? "YES" : "None"}
                      </p>
                    </div>
                  </div>
                  {hasAllergies && allergiesDetail && (
                    <div className="p-2 rounded bg-orange-500/10 border border-orange-500/20">
                      <p className="text-xs text-orange-600 font-medium">
                        ⚠️ {allergiesDetail}
                      </p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {hasHeartDisease && (
                      <Badge variant="destructive" className="text-xs">
                        Heart Disease
                      </Badge>
                    )}
                    {hasDiabetes && (
                      <Badge
                        variant="outline"
                        className="text-xs border-yellow-500 text-yellow-600"
                      >
                        Diabetes
                      </Badge>
                    )}
                    {hasHighBP && (
                      <Badge
                        variant="outline"
                        className="text-xs border-orange-500 text-orange-600"
                      >
                        High BP
                      </Badge>
                    )}
                    {hasCancer && (
                      <Badge variant="destructive" className="text-xs">
                        Cancer History
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Insurance Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Insurance Information
                  </h3>
                  {primaryInsurance ? (
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-blue-600">
                          {primaryInsurance.companyName}
                        </p>
                        <Badge variant="default" className="bg-blue-500">
                          Active
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 gap-1 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Policy #:
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-medium">
                              {primaryInsurance.policyNo}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 print:hidden"
                              onClick={() =>
                                copyToClipboard(
                                  primaryInsurance.policyNo,
                                  "Policy number"
                                )
                              }
                            >
                              {copiedText === primaryInsurance.policyNo ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Contact:
                          </span>
                          <span className="font-medium">
                            {primaryInsurance.contactPersonName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="font-medium">
                            {primaryInsurance.contactPersonNo}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Expires:
                          </span>
                          <span
                            className={`font-medium ${
                              isExpiringSoon(primaryInsurance.expiryDate)
                                ? "text-yellow-600"
                                : ""
                            }`}
                          >
                            {primaryInsurance.expiryDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <Shield className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No active insurance
                      </p>
                    </div>
                  )}
                  {activeInsurance.length > 1 && (
                    <p className="text-xs text-muted-foreground">
                      +{activeInsurance.length - 1} more insurance plan(s)
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          variants={item}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 print:grid-cols-5"
        >
          {[
            {
              label: "Emergency Contacts",
              value: emergencyContacts.length,
              icon: AlertTriangle,
              color: "text-red-600 dark:text-red-400",
              bgColor: "bg-red-500/10",
            },
            {
              label: "Insurance Plans",
              value: activeInsurance.length,
              icon: Shield,
              color: "text-blue-600 dark:text-blue-400",
              bgColor: "bg-blue-500/10",
            },
            {
              label: "Doctors",
              value: doctors.length,
              icon: Stethoscope,
              color: "text-green-600 dark:text-green-400",
              bgColor: "bg-green-500/10",
            },
            {
              label: "Medications",
              value: medicines.length,
              icon: Pill,
              color: "text-purple-600 dark:text-purple-400",
              bgColor: "bg-purple-500/10",
            },
            {
              label: "Conditions",
              value: criticalConditions,
              icon: Heart,
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

        {/* Quick Dial Contacts */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <PhoneCall className="h-5 w-5" />
                Quick Dial Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allContacts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Phone className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No contacts available</p>
                  <p className="text-sm mt-1">
                    This user hasn&apos;t added any emergency or personal
                    contacts.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allContacts.map((contact) => (
                    <div
                      key={`${contact.type}-${contact.id}`}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        contact.type === "emergency"
                          ? "bg-red-500/5 border-red-500/30"
                          : contact.type === "doctor"
                          ? "bg-blue-500/5 border-blue-500/30"
                          : "bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            contact.type === "emergency"
                              ? "bg-red-500/10"
                              : contact.type === "doctor"
                              ? "bg-blue-500/10"
                              : "bg-orange-500/10"
                          }`}
                        >
                          {contact.type === "emergency" ? (
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          ) : contact.type === "doctor" ? (
                            <Stethoscope className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <User className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">
                              {contact.name}
                            </p>
                            {contact.type === "emergency" && (
                              <Badge
                                variant="destructive"
                                className="text-xs shrink-0"
                              >
                                SOS
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground capitalize truncate">
                            {contact.relation}
                          </p>
                          <p className="text-sm font-mono mt-1">
                            {contact.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 print:hidden">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            copyToClipboard(
                              contact.phone,
                              `${contact.name}'s number`
                            )
                          }
                        >
                          {copiedText === contact.phone ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <a href={`tel:${contact.phone}`}>
                            <Phone className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Insurance Cards */}
        {insurance.length > 0 && (
          <motion.div variants={item}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Insurance Plans ({insurance.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insurance.map((ins, index) => {
                    const expired = isExpired(ins.expiryDate);
                    const expiringSoon = isExpiringSoon(ins.expiryDate);

                    return (
                      <div
                        key={ins.id}
                        className={`p-4 rounded-lg border ${
                          expired
                            ? "bg-red-500/5 border-red-500/30 opacity-60"
                            : expiringSoon
                            ? "bg-yellow-500/5 border-yellow-500/30"
                            : "bg-blue-500/5 border-blue-500/20"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                                expired
                                  ? "bg-red-500/10"
                                  : expiringSoon
                                  ? "bg-yellow-500/10"
                                  : "bg-blue-500/10"
                              }`}
                            >
                              <CreditCard
                                className={`h-6 w-6 ${
                                  expired
                                    ? "text-red-600"
                                    : expiringSoon
                                    ? "text-yellow-600"
                                    : "text-blue-600"
                                }`}
                              />
                            </div>
                            <div>
                              <p className="font-semibold">{ins.companyName}</p>
                              {index === 0 && !expired && (
                                <Badge
                                  variant="outline"
                                  className="text-xs mt-1"
                                >
                                  Primary
                                </Badge>
                              )}
                            </div>
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
                            <Badge variant="default" className="bg-blue-500">
                              Active
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between p-2 rounded bg-background/50">
                            <span className="text-muted-foreground">
                              Policy Number
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium">
                                {ins.policyNo}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 print:hidden"
                                onClick={() =>
                                  copyToClipboard(ins.policyNo, "Policy number")
                                }
                              >
                                {copiedText === ins.policyNo ? (
                                  <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded bg-background/50">
                              <p className="text-xs text-muted-foreground">
                                Contact Person
                              </p>
                              <p className="font-medium">
                                {ins.contactPersonName}
                              </p>
                            </div>
                            <div className="p-2 rounded bg-background/50">
                              <p className="text-xs text-muted-foreground">
                                Contact Number
                              </p>
                              <p className="font-medium">
                                {ins.contactPersonNo}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded bg-background/50">
                              <p className="text-xs text-muted-foreground">
                                Issue Date
                              </p>
                              <p className="font-medium">{ins.issueDate}</p>
                            </div>
                            <div
                              className={`p-2 rounded ${
                                expired
                                  ? "bg-red-500/10"
                                  : expiringSoon
                                  ? "bg-yellow-500/10"
                                  : "bg-background/50"
                              }`}
                            >
                              <p className="text-xs text-muted-foreground">
                                Expiry Date
                              </p>
                              <p
                                className={`font-medium ${
                                  expired
                                    ? "text-red-600"
                                    : expiringSoon
                                    ? "text-yellow-600"
                                    : ""
                                }`}
                              >
                                {ins.expiryDate}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3 print:hidden"
                          asChild
                        >
                          <a href={`tel:${ins.contactPersonNo}`}>
                            <Phone className="mr-2 h-4 w-4" />
                            Call Insurance
                          </a>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Two Column Layout - Doctors & Medications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Primary Doctor */}
          <motion.div variants={item}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-green-500" />
                  Primary Doctor
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!primaryDoctor ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Stethoscope className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No primary doctor assigned</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg border bg-green-500/5 border-green-500/20">
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <Stethoscope className="h-7 w-7 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-lg">
                            {primaryDoctor.doctorName}
                          </p>
                          <Badge className="bg-green-500">
                            <Star className="h-3 w-3 mr-1" />
                            Primary
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {primaryDoctor.specialization}
                        </p>
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{primaryDoctor.phoneNo}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 print:hidden"
                              onClick={() =>
                                copyToClipboard(
                                  primaryDoctor.phoneNo,
                                  "Doctor's number"
                                )
                              }
                            >
                              {copiedText === primaryDoctor.phoneNo ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">
                              {primaryDoctor.email}
                            </span>
                          </div>
                        </div>
                        <Button className="mt-4 w-full print:hidden" asChild>
                          <a href={`tel:${primaryDoctor.phoneNo}`}>
                            <Phone className="mr-2 h-4 w-4" />
                            Call Doctor
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Other Doctors */}
                {doctors.filter((d) => !d.isPrimary).length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Other Doctors
                    </p>
                    {doctors
                      .filter((d) => !d.isPrimary)
                      .map((doctor) => (
                        <div
                          key={doctor.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div>
                            <p className="font-medium">{doctor.doctorName}</p>
                            <p className="text-xs text-muted-foreground">
                              {doctor.specialization}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono hidden sm:block">
                              {doctor.phoneNo}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 print:hidden"
                              asChild
                            >
                              <a href={`tel:${doctor.phoneNo}`}>
                                <Phone className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Current Medications */}
          <motion.div variants={item}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pill className="h-5 w-5 text-purple-500" />
                  Current Medications ({medicines.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {medicines.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Pill className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No medications recorded</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {medicines.map((medicine) => (
                      <div
                        key={medicine.id}
                        className="p-3 rounded-lg border bg-purple-500/5 border-purple-500/20"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{medicine.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {medicine.dosage}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {medicine.frequency}x daily
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Times: {medicine.timeToTake}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Pharmacies */}
        {pharmacies.length > 0 && (
          <motion.div variants={item}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-teal-500" />
                  Pharmacies ({pharmacies.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pharmacies.map((pharmacy) => (
                    <div
                      key={pharmacy.id}
                      className="p-4 rounded-lg border space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {pharmacy.pharmacyName}
                          </p>
                          {pharmacy.services && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {pharmacy.services}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                          <span className="line-clamp-2">
                            {pharmacy.address}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{pharmacy.phoneNo}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full print:hidden"
                        asChild
                      >
                        <a href={`tel:${pharmacy.phoneNo}`}>
                          <Phone className="mr-2 h-4 w-4" />
                          Call Pharmacy
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Surgical History */}
        {hadSurgeries && surgeriesDetail && (
          <motion.div variants={item}>
            <Card className="border-purple-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  Surgical History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                  <p className="text-sm">{surgeriesDetail}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Address */}
        {profile.address && (
          <motion.div variants={item}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Patient Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-muted/50 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <p className="font-medium">{profile.address}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 print:hidden"
                    onClick={() => copyToClipboard(profile.address!, "Address")}
                  >
                    {copiedText === profile.address ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Print Footer */}
      <div className="hidden print:block mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
        <p>
          Emergency Information for {profile.displayName} • Generated on{" "}
          {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </p>
        <p className="mt-1">
          This document contains confidential medical information.
        </p>
      </div>
    </div>
  );
}
