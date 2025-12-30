"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Key,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Check,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Lock,
  Settings,
  CheckCircle2,
  MessageSquare,
  Phone,
  Mail,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { formatDate } from "@/lib/utils";

interface UserSettingsProps {
  params: Promise<{ userId: string }>;
}

interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: string | null;
  photoURL: string | null;
  provider: string;
  createdAt: { _seconds: number; _nanoseconds: number };
  lastLoginAt: { _seconds: number; _nanoseconds: number };
}

interface UserData {
  profile: UserProfile;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function firestoreTimestampToDate(timestamp: {
  _seconds: number;
  _nanoseconds: number;
}): Date {
  return new Date(timestamp._seconds * 1000);
}

// Generate a secure random password
function generatePassword(length: number = 12): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";
  const allChars = lowercase + uppercase + numbers + symbols;

  let password = "";
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

function LoadingSkeleton() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-48" />
      <Separator />
      <div className="grid gap-6">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    </div>
  );
}

export default function UserSettingsPage({ params }: UserSettingsProps) {
  const { userId } = use(params);
  const authFetch = useAuthFetch();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Password reset states
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resetPasswordValue, setResetPasswordValue] = useState("");

  // Confirm dialog
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmTitle, setConfirmTitle] = useState("Are you sure?");

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        setError(null);

        const response = await authFetch(`/panel/api/admin/users/${userId}`);

        if (!response.ok) {
          setError(
            response.status === 404
              ? "User not found"
              : "Failed to fetch user data"
          );
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

  const handleGeneratePassword = () => {
    const generated = generatePassword(12);
    setNewPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
  };

  const handleCopyPassword = async (password?: string) => {
    const textToCopy = password || newPassword;
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success("Password copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy password");
    }
  };

  const handleCopyCredentials = async () => {
    if (!userData?.profile || !resetPasswordValue) return;
    const text = `Health Companion Login Credentials\n\nEmail: ${userData.profile.email}\nPassword: ${resetPasswordValue}\n\nPlease change your password after logging in.`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Credentials copied to clipboard");
    } catch {
      toast.error("Failed to copy credentials");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setResetting(true);

      const response = await authFetch(
        `/panel/api/admin/users/${userId}/reset-password`,
        {
          method: "POST",
          body: JSON.stringify({
            password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      // Store the password for the success dialog
      setResetPasswordValue(newPassword);

      // Close reset dialog and open success dialog
      setIsResetDialogOpen(false);
      setIsSuccessDialogOpen(true);

      // Reset form
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);
    } catch (err) {
      console.error("Reset password error:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to reset password"
      );
    } finally {
      setResetting(false);
    }
  };

  const openConfirmDialog = (
    title: string,
    message: string,
    action: () => void
  ) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setIsConfirmDialogOpen(true);
  };

  const handleResetDialogClose = (open: boolean) => {
    if (!open) {
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);
    }
    setIsResetDialogOpen(open);
  };

  const handleSuccessDialogClose = () => {
    setIsSuccessDialogOpen(false);
    setResetPasswordValue("");
    setCopied(false);
  };

  if (loading) return <LoadingSkeleton />;

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
            don&apos;t have permission.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const { profile } = userData;
  const passwordsMatch = newPassword === confirmPassword;
  const passwordValid = newPassword.length >= 6;
  const canSubmit = passwordValid && passwordsMatch && !resetting;

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
            href="/dashboard/users"
            className="hover:text-foreground transition-colors"
          >
            Users
          </Link>
          <span>/</span>
          <Link
            href={`/dashboard/users/${userId}`}
            className="hover:text-foreground transition-colors"
          >
            {profile.displayName}
          </Link>
          <span>/</span>
          <span className="text-foreground">Settings</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">User Settings</h1>
              <p className="text-sm text-muted-foreground">
                Manage account for {profile.displayName}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="capitalize w-fit">
            {profile.provider}
          </Badge>
        </div>
        <Separator />
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Account Overview */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Overview
              </CardTitle>
              <CardDescription>Basic account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="font-medium">{profile.displayName}</p>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium truncate">{profile.email}</p>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <p className="font-medium">
                    {profile.phoneNumber || "Not provided"}
                  </p>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                  <Label className="text-xs text-muted-foreground">
                    Auth Provider
                  </Label>
                  <p className="font-medium capitalize">{profile.provider}</p>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                  <Label className="text-xs text-muted-foreground">
                    Account Created
                  </Label>
                  <p className="font-medium">
                    {formatDate(
                      firestoreTimestampToDate(profile.createdAt).toISOString()
                    )}
                  </p>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                  <Label className="text-xs text-muted-foreground">
                    Last Login
                  </Label>
                  <p className="font-medium">
                    {formatDate(
                      firestoreTimestampToDate(
                        profile.lastLoginAt
                      ).toISOString()
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Password Reset */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Password Management
              </CardTitle>
              <CardDescription>Reset the user&apos;s password</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-muted/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Reset Password</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Set a new password for this user
                  </p>
                </div>
                <Button onClick={() => setIsResetDialogOpen(true)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={item}>
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions that affect this user&apos;s account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                <div className="space-y-1">
                  <span className="font-medium">Disable Account</span>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable this user&apos;s access
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => {
                    openConfirmDialog(
                      "Disable Account",
                      `Are you sure you want to disable ${profile.displayName}'s account?`,
                      () => toast.info("Feature coming soon")
                    );
                  }}
                >
                  Disable Account
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                <div className="space-y-1">
                  <span className="font-medium">Delete Account</span>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete this user and all their data
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => {
                    openConfirmDialog(
                      "Delete Account",
                      `This will permanently delete ${profile.displayName}'s account and all data. This cannot be undone.`,
                      () => toast.info("Feature coming soon")
                    );
                  }}
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Reset Password Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={handleResetDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Set a new password for{" "}
              <span className="font-medium">{profile.displayName}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="new-password">New Password</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleGeneratePassword}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Generate
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="pr-20"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleCopyPassword()}
                    disabled={!newPassword}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {newPassword && newPassword.length < 6 && (
                <p className="text-xs text-destructive">
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-destructive">
                  Passwords do not match
                </p>
              )}
              {confirmPassword && passwordsMatch && passwordValid && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Passwords match
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                ℹ️ After resetting, you&apos;ll need to share the new password
                with the user manually.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleResetDialogClose(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={!canSubmit}>
              {resetting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Reset Password
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog - Share Password */}
      <Dialog
        open={isSuccessDialogOpen}
        onOpenChange={handleSuccessDialogClose}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-center">
              Password Reset Successfully!
            </DialogTitle>
            <DialogDescription className="text-center">
              Please share the new credentials with the user
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* User Info */}
            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">User</span>
                <span className="font-medium">{profile.displayName}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="font-medium text-sm">{profile.email}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  New Password
                </span>
                <div className="flex items-center gap-2">
                  <code className="px-2 py-1 bg-background rounded border font-mono text-sm">
                    {resetPasswordValue}
                  </code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleCopyPassword(resetPasswordValue)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Copy All Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleCopyCredentials}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy All Credentials
            </Button>

            {/* Share Options */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">
                Share via:
              </p>
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const text = `Your Health Companion password has been reset.\n\nEmail: ${profile.email}\nNew Password: ${resetPasswordValue}\n\nPlease change your password after logging in.`;
                    window.open(
                      `https://wa.me/?text=${encodeURIComponent(text)}`,
                      "_blank"
                    );
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const subject =
                      "Your Health Companion Password Has Been Reset";
                    const body = `Hello ${profile.displayName},\n\nYour password has been reset.\n\nEmail: ${profile.email}\nNew Password: ${resetPasswordValue}\n\nPlease change your password after logging in.\n\nBest regards,\nHealth Companion Team`;
                    window.open(
                      `mailto:${profile.email}?subject=${encodeURIComponent(
                        subject
                      )}&body=${encodeURIComponent(body)}`,
                      "_blank"
                    );
                  }}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </Button>
                {profile.phoneNumber && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const text = `Your Health Companion password has been reset. New Password: ${resetPasswordValue}`;
                      window.open(
                        `sms:${profile.phoneNumber}?body=${encodeURIComponent(
                          text
                        )}`,
                        "_blank"
                      );
                    }}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    SMS
                  </Button>
                )}
              </div>
            </div>

            {/* Warning */}
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-xs text-yellow-700 dark:text-yellow-300 text-center">
                ⚠️ Make sure to share these credentials securely. Advise the
                user to change their password after logging in.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSuccessDialogClose} className="w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{confirmMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmAction) confirmAction();
                setIsConfirmDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
