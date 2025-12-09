// app/dashboard/[userId]/medical-wallet/page.tsx
"use client";

import { use } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  mockEmergencyContacts,
  mockInsurance,
  mockDoctors,
  mockPharmacies,
} from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

interface MedicalWalletPageProps {
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

export default function MedicalWalletPage({ params }: MedicalWalletPageProps) {
  const { userId } = use(params);

  // Filter data for this user
  const userContacts = mockEmergencyContacts.filter((c) => c.userId === userId);
  const userInsurance = mockInsurance.filter((i) => i.userId === userId);
  const userDoctors = mockDoctors.filter((d) => d.userId === userId);
  const userPharmacies = mockPharmacies.filter((p) => p.userId === userId);

  const stats = {
    contacts: userContacts.length,
    insurance: userInsurance.length,
    doctors: userDoctors.length,
    pharmacies: userPharmacies.length,
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
          <h1 className="text-2xl md:text-3xl font-bold">Medical Wallet</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Emergency contacts, insurance, doctors & pharmacies
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
              label: "Emergency Contacts",
              value: stats.contacts,
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
          <Tabs defaultValue="contacts">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="contacts">
                Contacts ({userContacts.length})
              </TabsTrigger>
              <TabsTrigger value="insurance">
                Insurance ({userInsurance.length})
              </TabsTrigger>
              <TabsTrigger value="doctors">
                Doctors ({userDoctors.length})
              </TabsTrigger>
              <TabsTrigger value="pharmacies">
                Pharmacies ({userPharmacies.length})
              </TabsTrigger>
            </TabsList>

            {/* Emergency Contacts */}
            <TabsContent value="contacts" className="mt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Emergency Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userContacts.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">
                      No emergency contacts
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {userContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="flex items-center justify-between p-4 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                {contact.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
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
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {contact.relationship}
                            </Badge>
                            {contact.isPrimary && (
                              <Badge className="bg-red-500">
                                <Star className="h-3 w-3 mr-1" />
                                Primary
                              </Badge>
                            )}
                          </div>
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
                  {userInsurance.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">
                      No insurance plans
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {userInsurance.map((ins) => (
                        <div
                          key={ins.id}
                          className="p-4 rounded-lg border space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="font-medium">{ins.provider}</p>
                                <p className="text-xs text-muted-foreground">
                                  Policy: {ins.policyNumber}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              Expires: {formatDate(ins.expiryDate)}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Group #</p>
                              <p className="font-mono">{ins.groupNumber}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Member ID</p>
                              <p className="font-mono">{ins.memberId}</p>
                            </div>
                          </div>
                        </div>
                      ))}
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
                  {userDoctors.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">
                      No doctors
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {userDoctors.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-4 rounded-lg border space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                <Stethoscope className="h-5 w-5 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <Badge variant="outline">{doc.specialty}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <p className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {doc.phone}
                            </p>
                            {doc.email && (
                              <p className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {doc.email}
                              </p>
                            )}
                            <p className="flex items-center gap-1 md:col-span-2">
                              <MapPin className="h-3 w-3" />
                              {doc.address}
                            </p>
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
                  {userPharmacies.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">
                      No pharmacies
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {userPharmacies.map((pharm) => (
                        <div
                          key={pharm.id}
                          className="flex items-center justify-between p-4 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="font-medium">{pharm.name}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {pharm.address}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {pharm.phone}
                              </p>
                            </div>
                          </div>
                          {pharm.isPreferred && (
                            <Badge className="bg-purple-500">
                              <Star className="h-3 w-3 mr-1" />
                              Preferred
                            </Badge>
                          )}
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
