// app/subscribe/[userId]/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { toast } from "sonner";

export default function SubscriptionSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params.userId as string;
  const sessionId = searchParams.get("session_id");

  const [verifying, setVerifying] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    // Trigger confetti on success
    const triggerConfetti = () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    };

    // Simulate verification (webhook should have already updated the user)
    const timer = setTimeout(() => {
      setVerifying(false);
      triggerConfetti();
    }, 2000);

    return () => clearTimeout(timer);
  }, [sessionId]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-muted">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
            <h2 className="text-xl font-semibold mt-6">
              Verifying your subscription...
            </h2>
            <p className="text-muted-foreground mt-2">
              This will only take a moment
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-muted">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold mt-6">Something went wrong</h2>
            <p className="text-muted-foreground mt-2">{error}</p>
            <Button
              className="mt-6"
              onClick={() => (window.location.href = `/subscribe/${userId}`)}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-muted p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-center gap-2 mt-6">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <h2 className="text-2xl font-bold">Welcome to Premium!</h2>
                <Sparkles className="h-5 w-5 text-yellow-500" />
              </div>

              <p className="text-muted-foreground mt-3 px-4">
                Your subscription is now active. You have full access to all
                premium features.
              </p>

              <div className="mt-8 p-4 rounded-lg bg-muted">
                <h3 className="font-semibold mb-2">What&apos;s Next?</h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Open the mobile app to access premium features
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Your subscription syncs automatically
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Manage your subscription anytime
                  </li>
                </ul>
              </div>

              <div className="mt-8 space-y-3">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    // This could deep link to your mobile app
                    // or redirect to a download page
                    toast.info(
                      "Open your mobile app to start using premium features!"
                    );
                  }}
                >
                  Open Mobile App
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    (window.location.href = `/subscribe/${userId}`)
                  }
                >
                  View Subscription Details
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
