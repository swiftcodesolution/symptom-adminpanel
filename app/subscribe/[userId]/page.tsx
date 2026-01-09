// app/subscribe/[userId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Loader2, Crown, Zap, Star, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Plan {
  priceId: string;
  productId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  intervalCount: number;
  features: string[];
  metadata: Record<string, string>;
}

interface UserSubscription {
  status: string;
  planName: string;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
}

const planIcons: Record<string, any> = {
  basic: Zap,
  pro: Star,
  premium: Crown,
};

export default function SubscribePage() {
  const params = useParams();

  const userId = params.userId as string;

  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  // Fetch plans and user subscription
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch plans from Stripe
        const plansRes = await fetch("/panel/api/stripe/plans");
        if (plansRes.ok) {
          const data = await plansRes.json();
          setPlans(data.plans);
        }

        // Fetch user's current subscription (you might need to create this endpoint)
        // For now, we'll check via the checkout success redirect
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load subscription plans");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  const handleSubscribe = async (priceId: string) => {
    try {
      setCheckoutLoading(priceId);

      const response = await fetch("/panel/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          priceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to start checkout"
      );
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);

      const response = await fetch("/panel/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to open portal");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to open subscription management"
      );
    } finally {
      setPortalLoading(false);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-muted">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full potential of your health journey with our premium
            features
          </p>
        </motion.div>

        {/* Current Subscription Banner */}
        {currentSubscription && currentSubscription.status === "active" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="border-primary bg-primary/5">
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        You&apos;re subscribed to {currentSubscription.planName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {currentSubscription.cancelAtPeriodEnd
                          ? `Cancels on ${new Date(
                              currentSubscription.currentPeriodEnd * 1000
                            ).toLocaleDateString()}`
                          : `Renews on ${new Date(
                              currentSubscription.currentPeriodEnd * 1000
                            ).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                  >
                    {portalLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4 mr-2" />
                    )}
                    Manage Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => {
            const isPopular = plan.metadata?.popular === "true";
            const IconComponent = planIcons[plan.name.toLowerCase()] || Star;

            return (
              <motion.div
                key={plan.priceId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`relative h-full flex flex-col ${
                    isPopular ? "border-primary shadow-lg scale-105" : ""
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div
                      className={`h-12 w-12 mx-auto rounded-xl flex items-center justify-center mb-4 ${
                        isPopular
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10"
                      }`}
                    >
                      <IconComponent
                        className={`h-6 w-6 ${isPopular ? "" : "text-primary"}`}
                      />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="grow">
                    <div className="text-center mb-6">
                      <span className="text-4xl font-bold">
                        {formatPrice(plan.price, plan.currency)}
                      </span>
                      <span className="text-muted-foreground">
                        /{plan.interval}
                      </span>
                    </div>

                    <Separator className="my-6" />

                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className="w-full"
                      size="lg"
                      variant={isPopular ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan.priceId)}
                      disabled={checkoutLoading === plan.priceId}
                    >
                      {checkoutLoading === plan.priceId ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Get Started"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 text-muted-foreground"
        >
          <p className="text-sm">
            Secure payment powered by Stripe. Cancel anytime.
          </p>
          <p className="text-xs mt-2">
            By subscribing, you agree to our Terms of Service and Privacy
            Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
