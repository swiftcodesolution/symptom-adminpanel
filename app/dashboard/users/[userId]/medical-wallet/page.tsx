// app/dashboard/[userId]/medical-wallet/page.tsx
"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Stethoscope,
  Building2,
  Star,
  AlertCircle,
  ArrowLeft,
  AlertTriangle,
  User,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthFetch } from "@/lib/useAuthFetch";

interface MedicalWalletPageProps {
  params: Promise<{ userId: string }>;
}

// Type definitions based on your Firestore structure
interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  createdAt: { _seconds: number; _nanoseconds: number };
  updatedAt: { _seconds: number; _nanoseconds: number };
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
  updatedAt: { _seconds: number; _nanoseconds: number };
}

interface Pharmacy {
  id: string;
  pharmacyName: string;
  address: string;
  phoneNo: string;
  email: string;
  services: string;
  createdAt: { _seconds: number; _nanoseconds: number };
  updatedAt: { _seconds: number; _nanoseconds: number };
}

interface PersonalContact {
  id: string;
  Name: string;
  Relation: string;
  ContactNumber: string;
  createdAt: { _seconds: number; _nanoseconds: number };
  updatedAt: { _seconds: number; _nanoseconds: number };
}

interface UserData {
  profile: {
    displayName: string;
  };
  emergencyContacts: EmergencyContact[];
  insurance: Insurance[];
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

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Separator />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
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

export default function MedicalWalletPage({ params }: MedicalWalletPageProps) {
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
            Unable to load medical wallet data.
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
  } = userData;

  const stats = {
    emergencyContacts: emergencyContacts.length,
    insurance: insurance.length,
    doctors: doctors.length,
    pharmacies: pharmacies.length,
    personalContacts: personalContacts.length,
  };

  // Find primary doctor
  // const primaryDoctor = doctors.find((d) => d.isPrimary);

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
          <span className="text-foreground">Medical Wallet</span>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Medical Wallet</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Emergency contacts, insurance, doctors & pharmacies for{" "}
            {profile.displayName}
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
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          {[
            {
              label: "Emergency",
              value: stats.emergencyContacts,
              icon: AlertCircle,
              color: "text-red-600 dark:text-red-400",
              bgColor: "bg-red-500/10",
            },
            {
              label: "Insurance",
              value: stats.insurance,
              icon: Shield,
              color: "text-blue-600 dark:text-blue-400",
              bgColor: "bg-blue-500/10",
            },
            {
              label: "Doctors",
              value: stats.doctors,
              icon: Stethoscope,
              color: "text-green-600 dark:text-green-400",
              bgColor: "bg-green-500/10",
            },
            {
              label: "Pharmacies",
              value: stats.pharmacies,
              icon: Building2,
              color: "text-purple-600 dark:text-purple-400",
              bgColor: "bg-purple-500/10",
            },
            {
              label: "Personal",
              value: stats.personalContacts,
              icon: Users,
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

        {/* Tabs */}
        <motion.div variants={item}>
          <Tabs defaultValue="emergency">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="emergency">
                Emergency ({emergencyContacts.length})
              </TabsTrigger>
              <TabsTrigger value="insurance">
                Insurance ({insurance.length})
              </TabsTrigger>
              <TabsTrigger value="doctors">
                Doctors ({doctors.length})
              </TabsTrigger>
              <TabsTrigger value="pharmacies">
                Pharmacies ({pharmacies.length})
              </TabsTrigger>
              <TabsTrigger value="personal">
                Personal ({personalContacts.length})
              </TabsTrigger>
            </TabsList>

            {/* Emergency Contacts */}
            <TabsContent value="emergency" className="mt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Emergency Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {emergencyContacts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No emergency contacts</p>
                      <p className="text-sm mt-1">
                        This user hasn&apos;t added any emergency contacts yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {emergencyContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="flex items-center justify-between p-4 rounded-lg border bg-red-500/5 border-red-500/20"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                {contact.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{contact.name}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {contact.phone}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-red-500/50 capitalize"
                          >
                            {contact.relation}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Insurance */}
            <TabsContent value="insurance" className="mt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    Insurance Plans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {insurance.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No insurance plans</p>
                      <p className="text-sm mt-1">
                        This user hasn&apos;t added any insurance information
                        yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {insurance.map((ins) => {
                        const expired = isExpired(ins.expiryDate);
                        const expiringSoon = isExpiringSoon(ins.expiryDate);

                        return (
                          <div
                            key={ins.id}
                            className={`p-4 rounded-lg border space-y-4 ${
                              expired
                                ? "bg-red-500/5 border-red-500/30"
                                : expiringSoon
                                ? "bg-yellow-500/5 border-yellow-500/30"
                                : "bg-blue-500/5 border-blue-500/20"
                            }`}
                          >
                            <div className="flex items-start justify-between">
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
                                  <Shield
                                    className={`h-6 w-6 ${
                                      expired
                                        ? "text-red-600 dark:text-red-400"
                                        : expiringSoon
                                        ? "text-yellow-600 dark:text-yellow-400"
                                        : "text-blue-600 dark:text-blue-400"
                                    }`}
                                  />
                                </div>
                                <div>
                                  <p className="font-medium text-lg">
                                    {ins.companyName}
                                  </p>
                                  <p className="text-sm text-muted-foreground font-mono">
                                    Policy: {ins.policyNo}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div className="p-3 rounded-lg bg-background/50">
                                <p className="text-muted-foreground text-xs mb-1">
                                  Issue Date
                                </p>
                                <p className="font-medium flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {ins.issueDate}
                                </p>
                              </div>
                              <div className="p-3 rounded-lg bg-background/50">
                                <p className="text-muted-foreground text-xs mb-1">
                                  Expiry Date
                                </p>
                                <p
                                  className={`font-medium flex items-center gap-1 ${
                                    expired
                                      ? "text-red-600"
                                      : expiringSoon
                                      ? "text-yellow-600"
                                      : ""
                                  }`}
                                >
                                  <Calendar className="h-3 w-3" />
                                  {ins.expiryDate}
                                </p>
                              </div>
                              <div className="p-3 rounded-lg bg-background/50">
                                <p className="text-muted-foreground text-xs mb-1">
                                  Contact Person
                                </p>
                                <p className="font-medium flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {ins.contactPersonName}
                                </p>
                              </div>
                              <div className="p-3 rounded-lg bg-background/50">
                                <p className="text-muted-foreground text-xs mb-1">
                                  Contact Number
                                </p>
                                <p className="font-medium flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {ins.contactPersonNo}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Doctors */}
            <TabsContent value="doctors" className="mt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-green-500" />
                    Doctors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {doctors.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No doctors</p>
                      <p className="text-sm mt-1">
                        This user hasn&apos;t added any doctors yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Primary Doctor First */}
                      {doctors
                        .sort((a, b) =>
                          a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1
                        )
                        .map((doc) => (
                          <div
                            key={doc.id}
                            className={`p-4 rounded-lg border space-y-3 ${
                              doc.isPrimary
                                ? "bg-green-500/5 border-green-500/30"
                                : ""
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`h-12 w-12 rounded-full flex items-center justify-center ${
                                    doc.isPrimary
                                      ? "bg-green-500/20"
                                      : "bg-green-500/10"
                                  }`}
                                >
                                  <Stethoscope
                                    className={`h-6 w-6 ${
                                      doc.isPrimary
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-green-600/70 dark:text-green-400/70"
                                    }`}
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-lg">
                                      {doc.doctorName}
                                    </p>
                                    {doc.isPrimary && (
                                      <Badge className="bg-green-500 hover:bg-green-600">
                                        <Star className="h-3 w-3 mr-1" />
                                        Primary
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {doc.specialization
                                      .split(", ")
                                      .map((spec, idx) => (
                                        <Badge
                                          key={idx}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {spec}
                                        </Badge>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <span>{doc.phoneNo}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span className="truncate">{doc.email}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pharmacies */}
            <TabsContent value="pharmacies" className="mt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-purple-500" />
                    Pharmacies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pharmacies.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No pharmacies</p>
                      <p className="text-sm mt-1">
                        This user hasn&apos;t added any pharmacies yet.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pharmacies.map((pharm) => (
                        <div
                          key={pharm.id}
                          className="p-4 rounded-lg border space-y-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {pharm.pharmacyName}
                              </p>
                              {pharm.services && (
                                <Badge
                                  variant="outline"
                                  className="text-xs mt-1"
                                >
                                  {pharm.services}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                              <span>{pharm.address}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              <span>{pharm.phoneNo}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              <span className="truncate">{pharm.email}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Personal Contacts */}
            <TabsContent value="personal" className="mt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-orange-500" />
                    Personal Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {personalContacts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No personal contacts</p>
                      <p className="text-sm mt-1">
                        This user hasn&apos;t added any personal contacts yet.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {personalContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="p-4 rounded-lg border space-y-2"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                {contact.Name.split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </span>
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
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}
