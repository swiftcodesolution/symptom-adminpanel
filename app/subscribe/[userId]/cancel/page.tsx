// app/subscribe/[userId]/cancel/page.tsx
"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SubscriptionCancelPage() {
  const params = useParams();
  const userId = params.userId as string;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-muted p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <XCircle className="h-10 w-10 text-muted-foreground" />
            </div>

            <h2 className="text-2xl font-bold mt-6">Payment Cancelled</h2>

            <p className="text-muted-foreground mt-3">
              No worries! Your subscription was not processed. You can try again
              whenever you&apos;re ready.
            </p>

            <div className="mt-8 space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={() => (window.location.href = `/subscribe/${userId}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Plans
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Need help? Contact our support team.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
