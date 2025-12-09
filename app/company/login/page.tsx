// app/company/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockCompanies } from "@/lib/mock-data";

const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const formItemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function CompanyLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));

    // Find company by admin username
    const company = mockCompanies.find(
      (c) => c.adminCredentials.username === username
    );

    if (!company) {
      setError("Invalid username or password");
      setIsLoading(false);
      return;
    }

    if (company.status === "suspended") {
      setError(
        "This company account has been suspended. Please contact support."
      );
      setIsLoading(false);
      return;
    }

    if (company.status === "pending") {
      setError("This company account is pending activation.");
      setIsLoading(false);
      return;
    }

    // Redirect to company dashboard
    router.push(`/company/${company.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-500/10 via-background to-background flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        variants={formContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div variants={formItemVariants} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 mb-4">
            <Building2 className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold">Company Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Health Companion for Business
          </p>
        </motion.div>

        <motion.div variants={formItemVariants}>
          <Card>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">Sign In</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter your admin credentials
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="company_admin"
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
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
                    </Button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.p
          variants={formItemVariants}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          Having trouble? Contact your system administrator or{" "}
          <a href="#" className="text-primary hover:underline">
            request support
          </a>
        </motion.p>

        <motion.div
          variants={formItemVariants}
          className="flex items-center justify-center gap-2 mt-8 text-xs text-muted-foreground"
        >
          <Heart className="h-4 w-4 text-primary" />
          <span>Powered by Health Companion</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
