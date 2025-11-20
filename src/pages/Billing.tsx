import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, CreditCard, Package, ExternalLink } from "lucide-react";
import { PRICING } from "@/config/pricing";
import { openSubscriptionCheckout, openCheckout } from "@/services/paddle";

interface SubscriptionRecord {
  id: string;
  plan: string;
  status: string;
  current_period_end: string | null;
  trial_ends_at: string | null;
  created_at: string;
}

interface RestaurantProfile {
  pack_dishes_remaining: number | null;
  pack_dishes_total: number | null;
}

const Billing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [startingTrial, setStartingTrial] = useState(false);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from("subscription_records")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setSubscription(data);

      // Load restaurant profile for credits
      const { data: profileData, error: profileError } = await supabase
        .from("restaurant_profiles")
        .select("pack_dishes_remaining, pack_dishes_total")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error loading profile:", profileError);
      } else {
        setProfile(profileData);
      }
    } catch (error: any) {
      console.error("Error loading subscription:", error);
      toast.error("Failed to load subscription details");
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = async (plan: 'BASIC' | 'PRO') => {
    if (!user?.email) {
      toast.error("Email not found");
      return;
    }

    setStartingTrial(true);
    try {
      const planConfig = plan === 'BASIC' ? PRICING.HOSTING.BASIC : PRICING.HOSTING.PRO;
      
      await openSubscriptionCheckout({
        priceId: planConfig.id,
        customerEmail: user.email,
        successUrl: `${window.location.origin}/app/billing?success=true`,
        customData: {
          userId: user.id,
          plan: plan,
        },
      });
    } catch (error: any) {
      console.error("Error starting trial:", error);
      toast.error("Failed to start trial. Please try again.");
    } finally {
      setStartingTrial(false);
    }
  };

  const handleUpgradeToPro = async () => {
    if (!user?.email) {
      toast.error("Email not found");
      return;
    }

    setStartingTrial(true);
    try {
      await openSubscriptionCheckout({
        priceId: PRICING.HOSTING.PRO.id,
        customerEmail: user.email,
        successUrl: `${window.location.origin}/app/billing?success=true`,
        customData: {
          userId: user.id,
          plan: 'PRO',
          upgrade: true,
        },
      });
    } catch (error: any) {
      console.error("Error upgrading:", error);
      toast.error("Failed to upgrade. Please try again.");
    } finally {
      setStartingTrial(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      TRIALING: "default",
      ACTIVE: "default",
      CANCELED: "destructive",
      PAUSED: "secondary",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-subtle">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link to="/app" className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Menublend
            </Link>
            <Button variant="ghost" size="sm" onClick={() => navigate("/app")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Billing & Subscription</h1>
            <p className="text-muted-foreground mt-1">
              Manage your hosting plan and billing details
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Dish Credits Section */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Dish Credits
                  </CardTitle>
                  <CardDescription>Purchase credits to create 3D dish demos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Available Credits</p>
                        <p className="text-3xl font-bold">
                          {profile?.pack_dishes_remaining || 0}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Purchased</p>
                        <p className="text-xl font-semibold">
                          {profile?.pack_dishes_total || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Single Dish</h4>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Demo Dish</p>
                          <p className="text-sm text-muted-foreground">1 dish credit</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${PRICING.SINGLE.price}</p>
                          <Button 
                            size="sm"
                            onClick={async () => {
                              if (!user?.email) {
                                toast.error("Email not found");
                                return;
                              }
                              try {
                                await openCheckout({
                                  priceId: PRICING.SINGLE.paddlePriceId,
                                  customerEmail: user.email,
                                  successUrl: `${window.location.origin}/app/billing?success=true`,
                                  quantity: 1,
                                  customData: {
                                    userId: user.id,
                                    dishesCount: 1,
                                  },
                                });
                              } catch (error) {
                                toast.error("Failed to open checkout");
                              }
                            }}
                          >
                            Buy Now
                          </Button>
                        </div>
                      </div>
                    </div>

                    <h4 className="font-semibold mt-6">Credit Packs (Best Value)</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {PRICING.PACKS.map((pack) => (
                        <div key={pack.dishes} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold">{pack.dishes} Dishes</p>
                              <p className="text-sm text-muted-foreground">
                                ${(pack.price / pack.dishes).toFixed(0)}/dish
                              </p>
                            </div>
                            <Badge variant="secondary">
                              Save ${(PRICING.SINGLE.price * pack.dishes - pack.price).toFixed(0)}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <p className="text-xl font-bold">${pack.price}</p>
                            <Button 
                              size="sm"
                              onClick={async () => {
                                if (!user?.email) {
                                  toast.error("Email not found");
                                  return;
                                }
                                try {
                                  await openCheckout({
                                    priceId: pack.paddlePriceId,
                                    customerEmail: user.email,
                                    successUrl: `${window.location.origin}/app/billing?success=true`,
                                    quantity: 1,
                                    customData: {
                                      userId: user.id,
                                      dishesCount: pack.dishes,
                                    },
                                  });
                                } catch (error) {
                                  toast.error("Failed to open checkout");
                                }
                              }}
                            >
                              Buy Pack
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Plan */}
              {subscription ? (
                <Card className="shadow-elegant">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Current Plan
                      </CardTitle>
                      {getStatusBadge(subscription.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Plan</p>
                        <p className="text-lg font-semibold">
                          {subscription.plan === 'BASIC' ? 'Basic Hosting' : 'Pro Hosting'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="text-lg font-semibold capitalize">{subscription.status.toLowerCase()}</p>
                      </div>
                      {subscription.trial_ends_at && (
                        <div>
                          <p className="text-sm text-muted-foreground">Trial Ends</p>
                          <p className="text-lg font-semibold">{formatDate(subscription.trial_ends_at)}</p>
                        </div>
                      )}
                      {subscription.current_period_end && (
                        <div>
                          <p className="text-sm text-muted-foreground">Next Billing Date</p>
                          <p className="text-lg font-semibold">{formatDate(subscription.current_period_end)}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                      {subscription.plan === 'BASIC' && subscription.status === 'ACTIVE' && (
                        <Button onClick={handleUpgradeToPro} disabled={startingTrial}>
                          Upgrade to Pro
                        </Button>
                      )}
                      <Button variant="outline" asChild>
                        <a
                          href="https://vendors.paddle.com/subscriptions/customers/manage"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Manage Subscription
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* No Subscription - Show Plans */}
                  <Card className="shadow-elegant bg-gradient-to-br from-primary/5 to-background">
                    <CardHeader>
                      <CardTitle>Start Your Free Trial</CardTitle>
                      <CardDescription>
                        Choose a hosting plan to keep your 3D dishes live and accessible. First 30 days free!
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Basic Plan */}
                    <Card className="shadow-elegant">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{PRICING.HOSTING.BASIC.name}</CardTitle>
                          <Badge variant="outline">30-Day Free Trial</Badge>
                        </div>
                        <div className="mt-4">
                          <span className="text-4xl font-bold">{PRICING.HOSTING.BASIC.display}</span>
                          <span className="text-muted-foreground ml-2">after trial</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <ul className="space-y-2">
                          {PRICING.HOSTING.BASIC.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start text-sm">
                              <Package className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button
                          className="w-full"
                          onClick={() => handleStartTrial('BASIC')}
                          disabled={startingTrial}
                        >
                          Start Free Trial
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Pro Plan */}
                    <Card className="shadow-elegant border-primary/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{PRICING.HOSTING.PRO.name}</CardTitle>
                          <Badge>Recommended</Badge>
                        </div>
                        <div className="mt-4">
                          <span className="text-4xl font-bold">{PRICING.HOSTING.PRO.display}</span>
                          <span className="text-muted-foreground ml-2">after trial</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <ul className="space-y-2">
                          {PRICING.HOSTING.PRO.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start text-sm">
                              <Package className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button
                          className="w-full"
                          onClick={() => handleStartTrial('PRO')}
                          disabled={startingTrial}
                        >
                          Start Free Trial
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Billing;