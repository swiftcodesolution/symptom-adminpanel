// app/medical-profile/[userId]/page.tsx
"use client";

import { use, useState } from "react";
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
  Shield,
  ClipboardList,
  Activity,
  Droplets,
  Ruler,
  Weight,
  Star,
  AlertCircle,
  FileText,
  Clock,
  MapPin,
  ChevronDown,
  Download,
  Share2,
  QrCode,
  Loader2,
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
import {
  mockUsers,
  mockMedicines,
  mockEmergencyContacts,
  mockInsurance,
  mockDoctors,
  mockPharmacies,
  mockMedicalHistory,
} from "@/lib/mock-data";
import { getPersonalInfoWithDefaults } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

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

  // Get user data
  const user = mockUsers.find((u) => u.id === userId);
  const personalInfo = getPersonalInfoWithDefaults(userId);
  const userMedicines = mockMedicines.filter((m) => m.userId === userId);
  const userContacts = mockEmergencyContacts.filter((c) => c.userId === userId);
  const userInsurance = mockInsurance.filter((i) => i.userId === userId);
  const userDoctors = mockDoctors.filter((d) => d.userId === userId);
  const userPharmacies = mockPharmacies.filter((p) => p.userId === userId);
  const userHistory = mockMedicalHistory.filter((h) => h.userId === userId);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Medical Profile - ${user?.name}`,
          text: `View medical profile for ${user?.name}`,
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
    if (!user) return;

    setIsGeneratingPdf(true);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let yPos = margin;

      // Colors
      const primaryColor: [number, number, number] = [220, 38, 38]; // Red for emergency
      const secondaryColor: [number, number, number] = [100, 116, 139]; // Slate
      const textColor: [number, number, number] = [15, 23, 42]; // Dark
      const lightBg: [number, number, number] = [248, 250, 252]; // Light gray

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
      // Logo area
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
      pdf.text(user.name, margin + 5, yPos + 10);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      // Row 1
      pdf.setTextColor(...secondaryColor);
      pdf.text("DOB:", margin + 5, yPos + 18);
      pdf.setTextColor(...textColor);
      pdf.text(formatDate(personalInfo.dateOfBirth), margin + 18, yPos + 18);

      pdf.setTextColor(...secondaryColor);
      pdf.text("Blood Type:", margin + 55, yPos + 18);
      pdf.setTextColor(...primaryColor);
      pdf.setFont("helvetica", "bold");
      pdf.text(personalInfo.bloodType, margin + 80, yPos + 18);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...secondaryColor);
      pdf.text("Phone:", margin + 100, yPos + 18);
      pdf.setTextColor(...textColor);
      pdf.text(user.phone, margin + 116, yPos + 18);

      // Row 2
      pdf.setTextColor(...secondaryColor);
      pdf.text("Height:", margin + 5, yPos + 26);
      pdf.setTextColor(...textColor);
      pdf.text(personalInfo.height, margin + 22, yPos + 26);

      pdf.setTextColor(...secondaryColor);
      pdf.text("Weight:", margin + 55, yPos + 26);
      pdf.setTextColor(...textColor);
      pdf.text(personalInfo.weight, margin + 73, yPos + 26);

      pdf.setTextColor(...secondaryColor);
      pdf.text("Email:", margin + 100, yPos + 26);
      pdf.setTextColor(...textColor);
      pdf.text(user.email, margin + 116, yPos + 26);

      yPos += 42;

      // ===== EMERGENCY CONTACTS =====
      drawSectionHeader("⚠️ EMERGENCY CONTACTS", primaryColor);

      if (userContacts.length === 0) {
        drawText("No emergency contacts listed", { color: secondaryColor });
      } else {
        userContacts.forEach((contact) => {
          addNewPageIfNeeded(20);
          const isPrimary = contact.isPrimary;

          if (isPrimary) {
            pdf.setFillColor(254, 242, 242);
            pdf.roundedRect(margin, yPos - 2, contentWidth, 16, 2, 2, "F");
          }

          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...textColor);
          pdf.text(
            `${contact.name}${isPrimary ? " ★ PRIMARY" : ""}`,
            margin + 3,
            yPos + 5
          );

          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(...secondaryColor);
          pdf.text(`${contact.relationship}`, margin + 3, yPos + 11);

          pdf.setTextColor(...primaryColor);
          pdf.setFont("helvetica", "bold");
          pdf.text(contact.phone, pageWidth - margin - 40, yPos + 8);

          yPos += 18;
        });
      }

      yPos += 3;

      // ===== ALLERGIES & CONDITIONS =====
      drawSectionHeader("🔴 ALLERGIES & MEDICAL CONDITIONS", [234, 88, 12]);

      // Allergies
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...textColor);
      pdf.text("Known Allergies:", margin, yPos);
      yPos += 6;

      if (personalInfo.allergies.length === 0) {
        drawText("No known allergies", { color: [22, 163, 74], indent: 3 });
      } else {
        personalInfo.allergies.forEach((allergy) => {
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

      // Conditions
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...textColor);
      pdf.text("Medical Conditions:", margin, yPos);
      yPos += 6;

      if (personalInfo.conditions.length === 0) {
        drawText("No known conditions", { color: [22, 163, 74], indent: 3 });
      } else {
        personalInfo.conditions.forEach((condition) => {
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
        userMedicines.forEach((med) => {
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
          pdf.text(`${med.dosage} - ${med.frequency}`, margin + 3, yPos + 10);

          pdf.text(
            `Times: ${med.times.join(", ")}`,
            pageWidth - margin - 40,
            yPos + 4
          );

          if (med.notes) {
            pdf.setFontSize(8);
            pdf.setTextColor(100, 116, 139);
            const noteLines = pdf.splitTextToSize(
              `Note: ${med.notes}`,
              contentWidth - 10
            );
            pdf.text(noteLines[0], margin + 3, yPos + 15);
          }

          yPos += 20;
        });
      }

      yPos += 3;

      // ===== INSURANCE =====
      if (userInsurance.length > 0) {
        drawSectionHeader("🛡️ INSURANCE INFORMATION", [59, 130, 246]);

        userInsurance.forEach((ins) => {
          addNewPageIfNeeded(25);

          pdf.setFillColor(...lightBg);
          pdf.roundedRect(margin, yPos - 2, contentWidth, 22, 2, 2, "F");

          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...textColor);
          pdf.text(ins.provider, margin + 3, yPos + 5);

          pdf.setFontSize(8);
          pdf.setFont("helvetica", "normal");

          pdf.setTextColor(...secondaryColor);
          pdf.text("Policy:", margin + 3, yPos + 12);
          pdf.setTextColor(...textColor);
          pdf.text(ins.policyNumber, margin + 20, yPos + 12);

          pdf.setTextColor(...secondaryColor);
          pdf.text("Group:", margin + 70, yPos + 12);
          pdf.setTextColor(...textColor);
          pdf.text(ins.groupNumber, margin + 85, yPos + 12);

          pdf.setTextColor(...secondaryColor);
          pdf.text("Member ID:", margin + 3, yPos + 18);
          pdf.setTextColor(...textColor);
          pdf.text(ins.memberId, margin + 28, yPos + 18);

          pdf.setTextColor(...secondaryColor);
          pdf.text("Expires:", margin + 70, yPos + 18);
          pdf.setTextColor(...textColor);
          pdf.text(formatDate(ins.expiryDate), margin + 90, yPos + 18);

          yPos += 26;
        });

        yPos += 3;
      }

      // ===== HEALTHCARE PROVIDERS =====
      if (userDoctors.length > 0) {
        drawSectionHeader("👨‍⚕️ HEALTHCARE PROVIDERS", [34, 197, 94]);

        userDoctors.forEach((doc) => {
          addNewPageIfNeeded(28);

          pdf.setFillColor(...lightBg);
          pdf.roundedRect(margin, yPos - 2, contentWidth, 24, 2, 2, "F");

          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...textColor);
          pdf.text(doc.name, margin + 3, yPos + 5);

          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(34, 197, 94);
          pdf.text(doc.specialty, margin + 3, yPos + 11);

          pdf.setTextColor(...secondaryColor);
          pdf.setFontSize(8);
          pdf.text(`📞 ${doc.phone}`, margin + 3, yPos + 17);

          if (doc.email) {
            pdf.text(`✉️ ${doc.email}`, margin + 50, yPos + 17);
          }

          pdf.text(`📍 ${doc.address}`, margin + 3, yPos + 22);

          if (doc.hospital) {
            pdf.text(`🏥 ${doc.hospital}`, margin + 100, yPos + 22);
          }

          yPos += 28;
        });

        yPos += 3;
      }

      // ===== PHARMACY =====
      if (userPharmacies.length > 0) {
        drawSectionHeader("🏪 PHARMACY", [168, 85, 247]);

        userPharmacies.forEach((pharm) => {
          addNewPageIfNeeded(18);

          pdf.setFillColor(...lightBg);
          pdf.roundedRect(margin, yPos - 2, contentWidth, 14, 2, 2, "F");

          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...textColor);
          pdf.text(
            `${pharm.name}${pharm.isPreferred ? " ★ Preferred" : ""}`,
            margin + 3,
            yPos + 5
          );

          pdf.setFontSize(8);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(...secondaryColor);
          pdf.text(
            `📍 ${pharm.address}  |  📞 ${pharm.phone}`,
            margin + 3,
            yPos + 11
          );

          yPos += 17;
        });

        yPos += 3;
      }

      // ===== MEDICAL HISTORY =====
      if (userHistory.length > 0) {
        drawSectionHeader("📋 MEDICAL HISTORY", [249, 115, 22]);

        userHistory.forEach((record) => {
          addNewPageIfNeeded(20);

          pdf.setFontSize(8);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(249, 115, 22);
          pdf.text(`[${record.category}]`, margin, yPos);
          yPos += 5;

          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...textColor);
          const questionLines = pdf.splitTextToSize(
            record.question,
            contentWidth
          );
          pdf.text(questionLines, margin, yPos);
          yPos += questionLines.length * 4 + 2;

          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(...secondaryColor);
          const answerLines = pdf.splitTextToSize(
            `→ ${record.answer}`,
            contentWidth - 5
          );
          pdf.text(answerLines, margin + 3, yPos);
          yPos += answerLines.length * 4 + 5;
        });
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
        `Last Updated: ${formatDate(user.lastActive)}`,
        pageWidth - margin - 60,
        footerY + 4
      );

      // Save the PDF
      const fileName = `Medical_Profile_${user.name.replace(/\s+/g, "_")}_${
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

  // User not found
  if (!user) {
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
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl md:text-3xl font-bold truncate">
                      {user.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        DOB: {formatDate(personalInfo.dateOfBirth)}
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-red-500/10 text-red-600 border-red-500/30 font-semibold"
                      >
                        <Droplets className="h-3 w-3 mr-1" />
                        Blood Type: {personalInfo.bloodType}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {user.phone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Ruler className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold">{personalInfo.height}</p>
                    <p className="text-xs text-muted-foreground">Height</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Weight className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold">{personalInfo.weight}</p>
                    <p className="text-xs text-muted-foreground">Weight</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Pill className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold">{userMedicines.length}</p>
                    <p className="text-xs text-muted-foreground">Medications</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold">
                      {personalInfo.allergies.length}
                    </p>
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
                        No emergency contacts listed
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {userContacts.map((contact) => (
                          <div
                            key={contact.id}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border ${
                              contact.isPrimary
                                ? "bg-red-500/10 border-red-500/30"
                                : "bg-background"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${
                                  contact.isPrimary
                                    ? "bg-red-500 text-white"
                                    : "bg-muted"
                                }`}
                              >
                                <span className="font-semibold">
                                  {contact.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold flex items-center gap-2">
                                  {contact.name}
                                  {contact.isPrimary && (
                                    <Star className="h-4 w-4 text-red-500 fill-red-500" />
                                  )}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {contact.relationship}
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
                        {(personalInfo.allergies.length > 0 ||
                          personalInfo.conditions.length > 0) && (
                          <Badge variant="secondary" className="ml-2">
                            {personalInfo.allergies.length +
                              personalInfo.conditions.length}
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
                      {personalInfo.allergies.length === 0 ? (
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-600 border-green-500/30"
                        >
                          No Known Allergies
                        </Badge>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {personalInfo.allergies.map((allergy) => (
                            <Badge
                              key={allergy}
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
                      {personalInfo.conditions.length === 0 ? (
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-600 border-green-500/30"
                        >
                          No Known Conditions
                        </Badge>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {personalInfo.conditions.map((condition) => (
                            <Badge
                              key={condition}
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
                        {userMedicines.map((med) => (
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
                                      {med.frequency}
                                    </span>
                                  </div>
                                  {med.notes && (
                                    <p className="text-sm text-muted-foreground mt-2 flex items-start gap-1">
                                      <FileText className="h-3 w-3 mt-0.5 shrink-0" />
                                      {med.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 sm:justify-end">
                                {med.times.map((time) => (
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

          {/* Insurance Information */}
          <motion.div variants={item}>
            <Card>
              <Collapsible
                open={expandedSections.includes("insurance")}
                onOpenChange={() => toggleSection("insurance")}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-blue-500" />
                        </div>
                        Insurance Information
                        <Badge variant="secondary" className="ml-2">
                          {userInsurance.length}
                        </Badge>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${
                          expandedSections.includes("insurance")
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {userInsurance.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No insurance information
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {userInsurance.map((ins) => (
                          <div
                            key={ins.id}
                            className="p-4 rounded-lg border bg-muted/30"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Shield className="h-5 w-5 text-blue-500" />
                              </div>
                              <div>
                                <p className="font-semibold">{ins.provider}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Expires: {formatDate(ins.expiryDate)}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="p-3 bg-background rounded-lg border">
                                <p className="text-xs text-muted-foreground mb-1">
                                  Policy Number
                                </p>
                                <p className="font-mono font-medium text-sm">
                                  {ins.policyNumber}
                                </p>
                              </div>
                              <div className="p-3 bg-background rounded-lg border">
                                <p className="text-xs text-muted-foreground mb-1">
                                  Group Number
                                </p>
                                <p className="font-mono font-medium text-sm">
                                  {ins.groupNumber}
                                </p>
                              </div>
                              <div className="p-3 bg-background rounded-lg border">
                                <p className="text-xs text-muted-foreground mb-1">
                                  Member ID
                                </p>
                                <p className="font-mono font-medium text-sm">
                                  {ins.memberId}
                                </p>
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
                        {userDoctors.map((doc) => (
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
                                  <p className="font-semibold">{doc.name}</p>
                                  <Badge variant="outline" className="mt-1">
                                    {doc.specialty}
                                  </Badge>
                                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                    <p className="flex items-center gap-2">
                                      <Phone className="h-3 w-3 shrink-0" />
                                      {doc.phone}
                                    </p>
                                    {doc.email && (
                                      <p className="flex items-center gap-2">
                                        <Mail className="h-3 w-3 shrink-0" />
                                        {doc.email}
                                      </p>
                                    )}
                                    <p className="flex items-start gap-2">
                                      <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                                      {doc.address}
                                    </p>
                                    {doc.hospital && (
                                      <p className="flex items-center gap-2">
                                        <Building2 className="h-3 w-3 shrink-0" />
                                        {doc.hospital}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <a
                                href={`tel:${doc.phone.replace(/\D/g, "")}`}
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

          {/* Preferred Pharmacy */}
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
                        Pharmacy
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
                        {userPharmacies.map((pharm) => (
                          <div
                            key={pharm.id}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border ${
                              pharm.isPreferred
                                ? "bg-purple-500/5 border-purple-500/30"
                                : "bg-muted/30"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                                <Building2 className="h-5 w-5 text-purple-500" />
                              </div>
                              <div>
                                <p className="font-semibold flex items-center gap-2">
                                  {pharm.name}
                                  {pharm.isPreferred && (
                                    <Badge className="bg-purple-500 text-xs">
                                      <Star className="h-3 w-3 mr-1" />
                                      Preferred
                                    </Badge>
                                  )}
                                </p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {pharm.address}
                                </p>
                              </div>
                            </div>
                            <a
                              href={`tel:${pharm.phone.replace(/\D/g, "")}`}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-600 rounded-lg hover:bg-purple-500/20 transition-colors"
                            >
                              <Phone className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                {pharm.phone}
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

          {/* Medical History Q&A */}
          <motion.div variants={item}>
            <Card>
              <Collapsible
                open={expandedSections.includes("history")}
                onOpenChange={() => toggleSection("history")}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                          <ClipboardList className="h-5 w-5 text-orange-500" />
                        </div>
                        Medical History
                        <Badge variant="secondary" className="ml-2">
                          {userHistory.length}
                        </Badge>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${
                          expandedSections.includes("history")
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {userHistory.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No medical history records
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {userHistory.map((record) => (
                          <div
                            key={record.id}
                            className="p-4 rounded-lg border bg-muted/30"
                          >
                            <Badge variant="outline" className="mb-2">
                              {record.category}
                            </Badge>
                            <p className="font-medium text-sm mb-2">
                              {record.question}
                            </p>
                            <div className="bg-background p-3 rounded-lg border text-sm">
                              {record.answer}
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
                        Last updated: {formatDate(user.lastActive)}
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
