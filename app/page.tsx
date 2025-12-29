// app\page.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Heart, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const formItemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const email = e.currentTarget.email.value.trim();
    const password = e.currentTarget.password.value;

    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await userCredential.user.getIdToken();

      // Verify admin claim on the server
      const res = await fetch("/panel/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.admin) {
        setError("You are not an admin");
        setIsLoading(false);
        return;
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Login failed");
      setIsLoading(false);
    }
  };

  const handleResetLink = async () => {
    setResetLoading(true);
    try {
      const emailInput = document.getElementById(
        "reset-email"
      ) as HTMLInputElement;
      await sendPasswordResetEmail(auth, emailInput.value);
      setResetSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset link");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      {/* Left side - Branding */}
      <div className="hidden bg-linear-to-br from-primary/10 via-background to-primary/5 lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <div className="text-center max-w-md">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-8"
          >
            <Heart size={48} className="text-primary" />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold tracking-tight mb-4"
          >
            Your Health Companion
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-muted-foreground mb-8"
          >
            Admin Panel
          </motion.p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex items-center justify-center py-12 min-h-screen px-4">
        <motion.div
          className="mx-auto grid w-full max-w-87.5 gap-6"
          variants={formContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Mobile Logo */}
          <motion.div
            className="lg:hidden flex flex-col items-center gap-4 mb-4"
            variants={formItemVariants}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <Heart size={32} className="text-primary" />
            </div>
            <h1 className="text-xl font-bold">Your Health Companion</h1>
          </motion.div>

          <motion.div
            className="grid gap-2 text-center"
            variants={formItemVariants}
          >
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-balance text-muted-foreground">
              Sign in to access the admin dashboard
            </p>
          </motion.div>

          <form onSubmit={handleLogin} className="grid gap-4">
            <motion.div className="grid gap-2" variants={formItemVariants}>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@healthcompanion.com"
                required
                disabled={isLoading}
                className="h-11"
              />
            </motion.div>

            <motion.div className="grid gap-2" variants={formItemVariants}>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>

                {/* Forgot Password Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-xs text-muted-foreground"
                    >
                      Forgot password?
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Reset Password</DialogTitle>
                      <DialogDescription>
                        Enter your email to receive a reset link.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      {resetSuccess ? (
                        <div className="p-4 rounded-lg bg-green-100 text-green-800 text-center">
                          ✅ Reset link sent! Check your email.
                        </div>
                      ) : (
                        <>
                          <div className="grid gap-2">
                            <Label htmlFor="reset-email">Email</Label>
                            <Input
                              id="reset-email"
                              type="email"
                              placeholder="admin@healthcompanion.com"
                            />
                          </div>

                          <Button
                            type="button"
                            onClick={handleResetLink}
                            disabled={resetLoading}
                          >
                            {resetLoading ? "Sending..." : "Send Reset Link"}
                          </Button>
                        </>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Password Input */}
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLoading}
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">Toggle password visibility</span>
                </Button>
              </div>
            </motion.div>

            {error && (
              <motion.div
                className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <motion.div variants={formItemVariants}>
              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
