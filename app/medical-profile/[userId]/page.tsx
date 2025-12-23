/* eslint-disable @typescript-eslint/no-explicit-any */
// app/medical-profile/[userId]/page.tsx
"use client";
import { use, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  Pill,
  Stethoscope,
  Building2,
  Activity,
  Ruler,
  Weight,
  AlertCircle,
  Clock,
  MapPin,
  ChevronDown,
  Download,
  Share2,
  QrCode,
  Loader2,
  User,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import jsPDF from "jspdf";
import { formatDate } from "@/lib/utils";

interface Answer {
  question?: string;
  answer: string;
  summarizedAnswer?: string;
}

interface User {
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  uid: string;
  answers?: Answer[];
  lastUpdated?: string;
}

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timeToTake: string;
  refillDate?: string;
  notes?: string;
}

interface Doctor {
  id: string;
  doctorName: string;
  specialization: string;
  phoneNo: string;
  email?: string;
  isPrimary?: boolean;
}

interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

interface PersonalContact {
  id: string;
  Name: string;
  Relation: string;
  ContactNumber: string;
}

interface Pharmacy {
  id: string;
  pharmacyName: string;
  address: string;
  phoneNo: string;
  email?: string;
  services?: string;
}

interface ApiData {
  user: User;
  personalDetails: any | null;
  insurance: any | null;
  medicines: Medicine[];
  emergencyContacts: EmergencyContact[];
  doctors: Doctor[];
  pharmacies: Pharmacy[];
  medicalReports: any[];
  personalContacts: PersonalContact[];
}

interface MedicalProfilePageProps {
  params: Promise<{ userId: string }>;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Helper function to extract data from answers array
const getAnswerByQuestion = (
  answers: Answer[] | undefined,
  questionText: string
): string => {
  if (!answers) return "Unknown";
  const answer = answers.find((a) =>
    a.question?.toLowerCase().includes(questionText.toLowerCase())
  );
  return answer?.answer || "Unknown";
};

export default function MedicalProfilePage({
  params,
}: MedicalProfilePageProps) {
  const { userId } = use(params);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "emergency",
    "vitals",
    "medications",
  ]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/medical-profile/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const fetchedData = await response.json();
        console.log("Fetched data:", fetchedData);
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching medical profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handleShare = async () => {
    const userName = data?.user?.displayName || "User";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Medical Profile - ${userName}`,
          text: `View medical profile for ${userName}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log(err, "Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const generatePDF = async () => {
    if (!data?.user) return;

    setIsGeneratingPdf(true);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let yPos = margin;

      // Colors
      const primaryColor: [number, number, number] = [220, 38, 38];
      const secondaryColor: [number, number, number] = [100, 116, 139];
      const textColor: [number, number, number] = [15, 23, 42];
      const lightBg: [number, number, number] = [248, 250, 252];

      const userName = user.displayName || "Unknown User";
      const userDOB = getAnswerByQuestion(user.answers, "date of birth");
      const userHeight = getAnswerByQuestion(user.answers, "height");
      const userWeight = getAnswerByQuestion(user.answers, "weight");
      const allergies = getAllergies(user.answers);
      const conditions = getConditions(user.answers);

      // Helper functions
      const addNewPageIfNeeded = (requiredSpace: number) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      const drawSectionHeader = (
        title: string,
        color: [number, number, number] = secondaryColor
      ) => {
        addNewPageIfNeeded(15);
        pdf.setFillColor(...color);
        pdf.roundedRect(margin, yPos, contentWidth, 10, 2, 2, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text(title, margin + 4, yPos + 7);
        yPos += 14;
        pdf.setTextColor(...textColor);
      };

      const drawText = (
        text: string,
        options: {
          fontSize?: number;
          bold?: boolean;
          color?: [number, number, number];
          indent?: number;
          maxWidth?: number;
        } = {}
      ) => {
        const {
          fontSize = 10,
          bold = false,
          color = textColor,
          indent = 0,
          maxWidth = contentWidth - indent,
        } = options;
        pdf.setFontSize(fontSize);
        pdf.setFont("helvetica", bold ? "bold" : "normal");
        pdf.setTextColor(...color);
        const lines = pdf.splitTextToSize(text, maxWidth);
        addNewPageIfNeeded(lines.length * (fontSize * 0.4) + 2);
        pdf.text(lines, margin + indent, yPos);
        yPos += lines.length * (fontSize * 0.4) + 2;
      };

      // ===== HEADER =====
      pdf.setFillColor(...primaryColor);
      pdf.roundedRect(margin, yPos, contentWidth, 25, 3, 3, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("MEDICAL PROFILE", margin + 5, yPos + 10);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        "Health Companion - Emergency Medical Information",
        margin + 5,
        yPos + 17
      );

      pdf.setFontSize(8);
      pdf.text(
        `Generated: ${new Date().toLocaleDateString()}`,
        pageWidth - margin - 35,
        yPos + 10
      );

      yPos += 30;

      // ===== PATIENT INFORMATION =====
      pdf.setFillColor(...lightBg);
      pdf.roundedRect(margin, yPos, contentWidth, 35, 2, 2, "F");

      pdf.setTextColor(...textColor);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(userName, margin + 5, yPos + 10);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      // Row 1
      pdf.setTextColor(...secondaryColor);
      pdf.text("DOB:", margin + 5, yPos + 18);
      pdf.setTextColor(...textColor);
      pdf.text(userDOB, margin + 18, yPos + 18);

      pdf.setTextColor(...secondaryColor);
      pdf.text("Phone:", margin + 70, yPos + 18);
      pdf.setTextColor(...textColor);
      pdf.text(user.phoneNumber || "N/A", margin + 88, yPos + 18);

      // Row 2
      pdf.setTextColor(...secondaryColor);
      pdf.text("Height:", margin + 5, yPos + 26);
      pdf.setTextColor(...textColor);
      pdf.text(userHeight, margin + 22, yPos + 26);

      pdf.setTextColor(...secondaryColor);
      pdf.text("Weight:", margin + 55, yPos + 26);
      pdf.setTextColor(...textColor);
      pdf.text(`${userWeight} lbs`, margin + 73, yPos + 26);

      pdf.setTextColor(...secondaryColor);
      pdf.text("Email:", margin + 100, yPos + 26);
      pdf.setTextColor(...textColor);
      pdf.text(user.email || "N/A", margin + 116, yPos + 26);

      yPos += 42;

      // ===== EMERGENCY CONTACTS =====
      drawSectionHeader("⚠️ EMERGENCY CONTACTS", primaryColor);
      if (userContacts.length === 0) {
        drawText("No emergency contacts listed", { color: secondaryColor });
      } else {
        userContacts.forEach((contact: EmergencyContact) => {
          addNewPageIfNeeded(18);

          pdf.setFillColor(254, 242, 242);
          pdf.roundedRect(margin, yPos - 2, contentWidth, 14, 2, 2, "F");

          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...textColor);
          pdf.text(contact.name, margin + 3, yPos + 5);

          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(...secondaryColor);
          pdf.text(contact.relation, margin + 3, yPos + 10);

          pdf.setTextColor(...primaryColor);
          pdf.setFont("helvetica", "bold");
          pdf.text(contact.phone, pageWidth - margin - 40, yPos + 7);

          yPos += 16;
        });
      }
      yPos += 3;

      // ===== ALLERGIES & CONDITIONS =====
      drawSectionHeader("🔴 ALLERGIES & MEDICAL CONDITIONS", [234, 88, 12]);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...textColor);
      pdf.text("Known Allergies:", margin, yPos);
      yPos += 6;

      if (allergies.length === 0) {
        drawText("No known allergies", { color: [22, 163, 74], indent: 3 });
      } else {
        allergies.forEach((allergy: string) => {
          addNewPageIfNeeded(8);
          pdf.setFillColor(254, 226, 226);
          pdf.roundedRect(
            margin + 3,
            yPos - 3,
            pdf.getTextWidth(allergy) + 8,
            7,
            1,
            1,
            "F"
          );
          pdf.setTextColor(185, 28, 28);
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");
          pdf.text(`⚠ ${allergy}`, margin + 6, yPos + 1);
          yPos += 9;
        });
      }

      yPos += 3;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...textColor);
      pdf.text("Medical Conditions:", margin, yPos);
      yPos += 6;

      if (conditions.length === 0) {
        drawText("No known conditions", { color: [22, 163, 74], indent: 3 });
      } else {
        conditions.forEach((condition: string) => {
          addNewPageIfNeeded(8);
          pdf.setFillColor(241, 245, 249);
          pdf.roundedRect(
            margin + 3,
            yPos - 3,
            pdf.getTextWidth(condition) + 8,
            7,
            1,
            1,
            "F"
          );
          pdf.setTextColor(...textColor);
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          pdf.text(`• ${condition}`, margin + 6, yPos + 1);
          yPos += 9;
        });
      }

      yPos += 5;

      // ===== CURRENT MEDICATIONS =====
      drawSectionHeader("💊 CURRENT MEDICATIONS", [147, 51, 234]);

      if (userMedicines.length === 0) {
        drawText("No current medications", { color: secondaryColor });
      } else {
        userMedicines.forEach((med: Medicine) => {
          addNewPageIfNeeded(22);

          pdf.setFillColor(...lightBg);
          pdf.roundedRect(margin, yPos - 2, contentWidth, 18, 2, 2, "F");

          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...textColor);
          pdf.text(med.name, margin + 3, yPos + 4);

          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(...secondaryColor);
          pdf.text(
            `${med.dosage} - ${med.frequency}x daily`,
            margin + 3,
            yPos + 10
          );

          pdf.text(`Times: ${med.timeToTake}`, margin + 3, yPos + 15);

          yPos += 20;
        });
      }

      yPos += 3;

      // ===== HEALTHCARE PROVIDERS =====
      if (userDoctors.length > 0) {
        drawSectionHeader("👨‍⚕️ HEALTHCARE PROVIDERS", [34, 197, 94]);

        userDoctors.forEach((doc: Doctor) => {
          addNewPageIfNeeded(24);

          pdf.setFillColor(...lightBg);
          pdf.roundedRect(margin, yPos - 2, contentWidth, 20, 2, 2, "F");

          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...textColor);
          pdf.text(doc.doctorName, margin + 3, yPos + 5);

          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(34, 197, 94);
          pdf.text(doc.specialization, margin + 3, yPos + 11);

          pdf.setTextColor(...secondaryColor);
          pdf.setFontSize(8);
          pdf.text(`📞 ${doc.phoneNo}`, margin + 3, yPos + 17);

          if (doc.email) {
            pdf.text(`✉️ ${doc.email}`, margin + 50, yPos + 17);
          }

          yPos += 24;
        });

        yPos += 3;
      }

      // ===== PHARMACIES =====
      if (userPharmacies.length > 0) {
        drawSectionHeader("🏪 PHARMACIES", [168, 85, 247]);

        userPharmacies.forEach((pharm: Pharmacy) => {
          addNewPageIfNeeded(20);

          pdf.setFillColor(...lightBg);
          pdf.roundedRect(margin, yPos - 2, contentWidth, 16, 2, 2, "F");

          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...textColor);
          pdf.text(pharm.pharmacyName, margin + 3, yPos + 5);

          pdf.setFontSize(8);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(...secondaryColor);
          pdf.text(`📍 ${pharm.address}`, margin + 3, yPos + 10);
          pdf.text(`📞 ${pharm.phoneNo}`, margin + 3, yPos + 14);

          yPos += 19;
        });

        yPos += 3;
      }

      // ===== FOOTER =====
      const footerY = pageHeight - 15;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

      pdf.setFontSize(7);
      pdf.setTextColor(...secondaryColor);
      pdf.text(
        "This document is generated by Health Companion for emergency medical purposes.",
        margin,
        footerY
      );
      pdf.text(
        "Please verify all information with the patient when possible.",
        margin,
        footerY + 4
      );
      pdf.text(
        `Profile URL: ${window.location.href}`,
        pageWidth - margin - 60,
        footerY
      );
      pdf.text(
        `Last Updated: ${formatDate(
          user.lastUpdated || new Date().toISOString()
        )}`,
        pageWidth - margin - 60,
        footerY + 4
      );

      const fileName = `Medical_Profile_${userName.replace(/\s+/g, "_")}_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || !data.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-10 w-10 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
              <p className="text-muted-foreground mb-4">
                The medical profile you&apos;re looking for doesn&apos;t exist
                or has been removed.
              </p>
              <p className="text-xs text-muted-foreground">
                If you scanned a QR code, please ensure it&apos;s valid and try
                again.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Extract data with defaults
  const user = data.user;
  const userName = user.displayName || "Unknown User";
  const userInitials =
    userName
      .split(" ")
      .map((n: string) => n[0] || "")
      .join("") || "??";

  // Extract info from answers array
  const userDOB = getAnswerByQuestion(user.answers, "date of birth");
  const userGender = getAnswerByQuestion(user.answers, "gender");
  const userHeight = getAnswerByQuestion(user.answers, "height");
  const userWeight = getAnswerByQuestion(user.answers, "weight");

  // Helper function to get allergies from answers
  const getAllergies = (answers: Answer[] | undefined): string[] => {
    if (!answers) return [];
    const hasAllergies = answers.find(
      (a) =>
        a.question?.toLowerCase().includes("known allergies") &&
        a.answer?.toLowerCase() === "yes"
    );
    if (!hasAllergies) return [];

    const allergyDetails = answers.find((a) =>
      a.question?.toLowerCase().includes("explain your allergies")
    );

    if (allergyDetails?.answer && allergyDetails.answer.trim()) {
      return allergyDetails.answer
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
    }
    return ["Not specified"];
  };

  // Helper function to get conditions from answers
  const getConditions = (answers: Answer[] | undefined): string[] => {
    if (!answers) return [];
    const conditions: string[] = [];

    const conditionQuestions = [
      { key: "high blood pressure", label: "High Blood Pressure" },
      { key: "diabetes", label: "Diabetes" },
      { key: "heart disease", label: "Heart Disease" },
    ];

    conditionQuestions.forEach(({ key, label }) => {
      const hasCondition = answers.find(
        (a) =>
          a.question?.toLowerCase().includes(key) &&
          a.answer?.toLowerCase() === "yes"
      );
      if (hasCondition) {
        conditions.push(label);
      }
    });

    return conditions;
  };

  const allergies = getAllergies(user.answers);
  const conditions = getConditions(user.answers);

  const userMedicines = data.medicines || [];
  const userContacts = data.emergencyContacts || [];
  const userDoctors = data.doctors || [];
  const userPharmacies = data.pharmacies || [];
  const personalContacts = data.personalContacts || [];

  return (
    <div className="min-h-screen bg-linear-to-b from-primary/5 via-background to-background">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Health Companion</h1>
                <p className="text-xs text-muted-foreground">
                  Emergency Medical Profile
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={generatePDF}
                disabled={isGeneratingPdf}
              >
                {isGeneratingPdf ? (
                  <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
                ) : (
                  <Download className="h-4 w-4 sm:mr-2" />
                )}
                <span className="hidden sm:inline">
                  {isGeneratingPdf ? "Generating..." : "Download PDF"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Patient Info Card */}
          <motion.div variants={item}>
            <Card className="overflow-hidden">
              <div className="bg-linear-to-r from-primary/10 to-primary/5 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center border-4 border-background shrink-0">
                    <span className="text-2xl font-bold text-primary">
                      {userInitials}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl md:text-3xl font-bold truncate">
                      {userName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        DOB: {userDOB}
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-blue-500/10 text-blue-600 border-blue-500/30 font-semibold capitalize"
                      >
                        <User className="h-3 w-3 mr-1" />
                        {userGender}
                      </Badge>
                    </div>
                    {user.phoneNumber && (
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {user.phoneNumber}
                        </span>
                        {user.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                        )}
                      </div>
                    )}
                    {user.address && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {user.address}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Ruler className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold">{userHeight}</p>
                    <p className="text-xs text-muted-foreground">Height</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Weight className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold">{userWeight} lbs</p>
                    <p className="text-xs text-muted-foreground">Weight</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Pill className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold">{userMedicines.length}</p>
                    <p className="text-xs text-muted-foreground">Medications</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold">{allergies.length}</p>
                    <p className="text-xs text-muted-foreground">Allergies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* CRITICAL: Emergency Contacts */}
          <motion.div variants={item}>
            <Card className="border-red-500/50 bg-red-500/5">
              <Collapsible
                open={expandedSections.includes("emergency")}
                onOpenChange={() => toggleSection("emergency")}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-red-500/10 transition-colors">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
                          <AlertCircle className="h-5 w-5" />
                        </div>
                        Emergency Contacts
                        <Badge variant="destructive" className="ml-2">
                          CRITICAL
                        </Badge>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-red-600 transition-transform ${
                          expandedSections.includes("emergency")
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {userContacts.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No emergency contacts listed. Please add emergency
                        contacts in the app.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {userContacts.map((contact: EmergencyContact) => (
                          <div
                            key={contact.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border bg-red-500/5 border-red-500/20"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0">
                                <span className="font-semibold">
                                  {contact.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold flex items-center gap-2">
                                  {contact.name}
                                </p>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {contact.relation}
                                </p>
                              </div>
                            </div>
                            <a
                              href={`tel:${contact.phone.replace(/\D/g, "")}`}
                              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                            >
                              <Phone className="h-4 w-4" />
                              <span>{contact.phone}</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </motion.div>

          {/* Allergies & Conditions */}
          <motion.div variants={item}>
            <Card className="border-orange-500/30">
              <Collapsible
                open={expandedSections.includes("vitals")}
                onOpenChange={() => toggleSection("vitals")}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                          <Activity className="h-5 w-5 text-orange-500" />
                        </div>
                        Allergies & Medical Conditions
                        {(allergies.length > 0 || conditions.length > 0) && (
                          <Badge variant="secondary" className="ml-2">
                            {allergies.length + conditions.length}
                          </Badge>
                        )}
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${
                          expandedSections.includes("vitals")
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-4">
                    {/* Allergies */}
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Known Allergies
                      </h4>
                      {allergies.length === 0 ? (
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-600 border-green-500/30"
                        >
                          No Known Allergies
                        </Badge>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {allergies.map((allergy: string, idx: number) => (
                            <Badge
                              key={idx}
                              variant="destructive"
                              className="text-sm py-1.5 px-3"
                            >
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Conditions */}
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        Medical Conditions
                      </h4>
                      {conditions.length === 0 ? (
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-600 border-green-500/30"
                        >
                          No Known Conditions
                        </Badge>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {conditions.map((condition: string, idx: number) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-sm py-1.5 px-3"
                            >
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </motion.div>

          {/* Current Medications */}
          <motion.div variants={item}>
            <Card>
              <Collapsible
                open={expandedSections.includes("medications")}
                onOpenChange={() => toggleSection("medications")}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <Pill className="h-5 w-5 text-purple-500" />
                        </div>
                        Current Medications
                        <Badge variant="secondary" className="ml-2">
                          {userMedicines.length}
                        </Badge>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${
                          expandedSections.includes("medications")
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {userMedicines.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No current medications
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {userMedicines.map((med: Medicine) => (
                          <div
                            key={med.id}
                            className="p-4 rounded-lg border bg-muted/30"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                  <Pill className="h-5 w-5 text-purple-500" />
                                </div>
                                <div>
                                  <p className="font-semibold">{med.name}</p>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <Badge
                                      variant="outline"
                                      className="font-mono"
                                    >
                                      {med.dosage}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                      {med.frequency}x daily
                                    </span>
                                  </div>
                                  {med.refillDate && (
                                    <p className="text-sm text-muted-foreground mt-2 flex items-start gap-1">
                                      <Calendar className="h-3 w-3 mt-0.5 shrink-0" />
                                      Refill: {med.refillDate}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 sm:justify-end">
                                {med.timeToTake
                                  .split(",")
                                  .map((time: string, idx: number) => (
                                    <Badge
                                      key={idx}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      <Clock className="h-3 w-3 mr-1" />
                                      {time.trim()}
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </motion.div>

          {/* Healthcare Providers */}
          <motion.div variants={item}>
            <Card>
              <Collapsible
                open={expandedSections.includes("providers")}
                onOpenChange={() => toggleSection("providers")}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <Stethoscope className="h-5 w-5 text-green-500" />
                        </div>
                        Healthcare Providers
                        <Badge variant="secondary" className="ml-2">
                          {userDoctors.length}
                        </Badge>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${
                          expandedSections.includes("providers")
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {userDoctors.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No healthcare providers listed
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {userDoctors.map((doc: Doctor) => (
                          <div
                            key={doc.id}
                            className="p-4 rounded-lg border bg-muted/30"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                  <Stethoscope className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                  <p className="font-semibold flex items-center gap-2">
                                    {doc.doctorName}
                                    {doc.isPrimary && (
                                      <Badge
                                        variant="default"
                                        className="text-xs"
                                      >
                                        Primary
                                      </Badge>
                                    )}
                                  </p>
                                  <Badge variant="outline" className="mt-1">
                                    {doc.specialization}
                                  </Badge>
                                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                    <p className="flex items-center gap-2">
                                      <Phone className="h-3 w-3 shrink-0" />
                                      {doc.phoneNo}
                                    </p>
                                    {doc.email && (
                                      <p className="flex items-center gap-2">
                                        <Mail className="h-3 w-3 shrink-0" />
                                        {doc.email}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <a
                                href={`tel:${doc.phoneNo.replace(/\D/g, "")}`}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500/20 transition-colors shrink-0"
                              >
                                <Phone className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                  Call
                                </span>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </motion.div>

          {/* Pharmacies */}
          <motion.div variants={item}>
            <Card>
              <Collapsible
                open={expandedSections.includes("pharmacy")}
                onOpenChange={() => toggleSection("pharmacy")}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-purple-500" />
                        </div>
                        Pharmacies
                        <Badge variant="secondary" className="ml-2">
                          {userPharmacies.length}
                        </Badge>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${
                          expandedSections.includes("pharmacy")
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {userPharmacies.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No pharmacy listed
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {userPharmacies.map((pharm: Pharmacy) => (
                          <div
                            key={pharm.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border bg-muted/30"
                          >
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                                <Building2 className="h-5 w-5 text-purple-500" />
                              </div>
                              <div>
                                <p className="font-semibold">
                                  {pharm.pharmacyName}
                                </p>
                                <p className="text-sm text-muted-foreground flex items-start gap-1 mt-1">
                                  <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                                  {pharm.address}
                                </p>
                                {pharm.services && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Services: {pharm.services}
                                  </p>
                                )}
                              </div>
                            </div>
                            <a
                              href={`tel:${pharm.phoneNo.replace(/\D/g, "")}`}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-600 rounded-lg hover:bg-purple-500/20 transition-colors"
                            >
                              <Phone className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                {pharm.phoneNo}
                              </span>
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </motion.div>

          {/* Personal Contacts */}
          {personalContacts.length > 0 && (
            <motion.div variants={item}>
              <Card>
                <Collapsible
                  open={expandedSections.includes("personal")}
                  onOpenChange={() => toggleSection("personal")}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-500" />
                          </div>
                          Personal Contacts
                          <Badge variant="secondary" className="ml-2">
                            {personalContacts.length}
                          </Badge>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${
                            expandedSections.includes("personal")
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {personalContacts.map((contact: PersonalContact) => (
                          <div
                            key={contact.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border bg-muted/30"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                <Users className="h-5 w-5 text-blue-500" />
                              </div>
                              <div>
                                <p className="font-semibold">{contact.Name}</p>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {contact.Relation}
                                </p>
                              </div>
                            </div>
                            <a
                              href={`tel:${contact.ContactNumber.replace(
                                /\D/g,
                                ""
                              )}`}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 rounded-lg hover:bg-blue-500/20 transition-colors"
                            >
                              <Phone className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                {contact.ContactNumber}
                              </span>
                            </a>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </motion.div>
          )}

          {/* Footer */}
          <motion.div variants={item}>
            <Card className="bg-muted/30">
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                      <QrCode className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Health Companion Medical Profile
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last updated:{" "}
                        {formatDate(
                          user.lastUpdated || new Date().toISOString()
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-xs text-muted-foreground max-w-xs">
                      This information is provided for emergency medical
                      assistance. Please verify all details with the patient
                      when possible.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
