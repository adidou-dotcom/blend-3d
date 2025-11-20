import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, LogOut, User, Package, Sparkles, Info, ShoppingBag } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PRICING } from "@/config/pricing";
import { openCheckout } from "@/services/paddle";

interface DishOrder {
  id: string;
  dish_name: string;
  internal_reference: string;
  status: string;
  created_at: string;
  is_demo: boolean;
}

interface RestaurantProfile {
  restaurant_name: string;
  pack_dishes_remaining: number;
  pack_dishes_total: number;
  pack_purchased_at: string | null;
}

const Dashboard = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [dishes, setDishes] = useState<DishOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("All");
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);

  useEffect(() => {
    if (user) {
      loadDishes();
      loadProfile();
    }
  }, [user]);

  const handleOrderDemoDish = async () => {
    if (!profile) return;
    
    const creditsRemaining = profile.pack_dishes_remaining || 0;
    
    if (creditsRemaining > 0) {
      // User has credits, go directly to create dish
      navigate("/app/dishes/new");
    } else {
      // No credits, open Paddle checkout for single dish
      try {
        await openCheckout({
          priceId: PRICING.SINGLE.id,
          customerEmail: user?.email || "",
          successUrl: `${window.location.origin}/app?purchase=success`,
          customData: {
            userId: user?.id,
            productType: "single",
            dishesCount: 1,
          },
        });
      } catch (error) {
        console.error("Paddle checkout error:", error);
        toast.error("Failed to open checkout. Please try again.");
      }
    }
  };

  const loadProfile = async () => {
    try {
      const { data } = await supabase
        .from("restaurant_profiles")
        .select("restaurant_name, pack_dishes_remaining, pack_dishes_total, pack_purchased_at")
        .eq("user_id", user?.id)
        .single();
      
      if (data) setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadDishes = async () => {
    try {
      const { data, error } = await supabase
        .from("dish_orders")
        .select("id, dish_name, internal_reference, status, created_at, price_charged, currency, is_demo")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDishes(data || []);
    } catch (error) {
      console.error("Error loading dishes:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasPendingDemoOrder = dishes.some(
    d => d.is_demo && (d.status === "NEW" || d.status === "IN_PRODUCTION")
  );
  const hasAnyDemoDish = dishes.some(d => d.is_demo);
  const hasNoDishes = dishes.length === 0;

  const filteredDishes = filter === "All" 
    ? dishes 
    : dishes.filter(dish => dish.status === filter);

  const statusCounts = {
    total: dishes.length,
    inProduction: dishes.filter(d => d.status === "IN_PRODUCTION").length,
    ready: dishes.filter(d => d.status === "READY").length,
    delivered: dishes.filter(d => d.status === "DELIVERED").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-500";
      case "IN_PRODUCTION":
        return "bg-yellow-500";
      case "READY":
        return "bg-green-500";
      case "DELIVERED":
        return "bg-purple-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-subtle">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-8">
              <Link to="/app" className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Menublend
              </Link>
              <nav className="hidden md:flex gap-6">
                <Link to="/app" className="text-sm font-medium text-primary">
                  My Dishes
                </Link>
                <Link to="/app/profile" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Profile
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Admin Panel
                  </Link>
                )}
              </nav>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Welcome & Summary */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Welcome back{profile?.restaurant_name ? `, ${profile.restaurant_name}` : ""}!</h1>
            <p className="text-muted-foreground mt-1">Manage your 3D dish orders</p>
          </div>

          {/* Demo dish banner */}
          {hasAnyDemoDish && !hasNoDishes && (
            <Alert className="mb-6 bg-primary/10 border-primary/20">
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                <strong>Happy with your demo?</strong> Talk to us to scale your 3D menu and create AR experiences for your entire menu.
              </AlertDescription>
            </Alert>
          )}

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card className="shadow-elegant">
              <CardHeader className="pb-3">
                <CardDescription>Total Orders</CardDescription>
                <CardTitle className="text-3xl">{statusCounts.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="shadow-elegant">
              <CardHeader className="pb-3">
                <CardDescription>In Production</CardDescription>
                <CardTitle className="text-3xl text-yellow-600">{statusCounts.inProduction}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="shadow-elegant">
              <CardHeader className="pb-3">
                <CardDescription>Ready</CardDescription>
                <CardTitle className="text-3xl text-green-600">{statusCounts.ready}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="shadow-elegant">
              <CardHeader className="pb-3">
                <CardDescription>Delivered</CardDescription>
                <CardTitle className="text-3xl text-purple-600">{statusCounts.delivered}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Dish Credits Widget */}
          <Card className="mb-6 bg-gradient-to-br from-primary/10 to-background border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dish Credits Available</p>
                  <p className="text-3xl font-bold text-primary">
                    {profile?.pack_dishes_remaining || 0}
                    {(profile?.pack_dishes_total ?? 0) > 0 && (
                      <span className="text-lg text-muted-foreground ml-1">
                        / {profile.pack_dishes_total}
                      </span>
                    )}
                  </p>
                </div>
                <Package className="h-12 w-12 text-primary/50" />
              </div>
              {profile?.pack_purchased_at && (
                <p className="text-xs text-muted-foreground mt-2">
                  Credits purchased on {new Date(profile.pack_purchased_at).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Orders Table Header */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              {["All", "NEW", "IN_PRODUCTION", "READY", "DELIVERED", "CANCELLED"].map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(status)}
                >
                  {status === "All" ? "All" : status.replace("_", " ")}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleOrderDemoDish}
                className="shadow-elegant"
              >
                <Plus className="h-4 w-4 mr-2" />
                {(profile?.pack_dishes_remaining ?? 0) > 0 ? "Create Dish Order" : `Order Dish (${PRICING.SINGLE.display})`}
              </Button>
              <Button 
                onClick={() => navigate("/app/billing")} 
                variant="outline"
                className="border-primary/50"
              >
                <Package className="h-4 w-4 mr-2" />
                Buy Credits
              </Button>
            </div>
          </div>


          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : dishes.length === 0 ? (
            <Card className="shadow-elegant">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-full opacity-20 animate-pulse mb-6"></div>
                <h3 className="text-2xl font-bold mb-2">Order Your First 3D Dish</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  {(profile?.pack_dishes_remaining ?? 0) > 0 
                    ? `You have ${profile?.pack_dishes_remaining} credits. Create your first dish order now!`
                    : `Start with a single dish for ${PRICING.SINGLE.display} or save with multi-dish packs. Upload 8-20 photos to get started.`}
                </p>
                <div className="flex gap-3">
                  <Button onClick={handleOrderDemoDish} size="lg">
                    {(profile?.pack_dishes_remaining ?? 0) > 0 ? "Create Dish Order" : `Order Demo (${PRICING.SINGLE.display})`}
                  </Button>
                  <Button onClick={() => navigate("/app/billing")} size="lg" variant="outline">
                    <Package className="h-5 w-5 mr-2" />
                    View Pricing
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">Typical delivery: 3-5 business days</p>
              </CardContent>
            </Card>
          ) : filteredDishes.length === 0 ? (
            <Card className="shadow-elegant">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No dishes found</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  {filter === "All" 
                    ? "You don't have any dish orders yet. Start with your first 3D dish."
                    : `No dishes with status "${filter.replace("_", " ")}"`}
                </p>
                {filter === "All" && (
                  <Button onClick={() => navigate("/app/dishes/new")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first dish
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredDishes.map((dish) => (
                <Card key={dish.id} className="shadow-elegant hover:shadow-glow transition-shadow cursor-pointer" onClick={() => navigate(`/app/dishes/${dish.id}`)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{dish.dish_name}</CardTitle>
                        <CardDescription className="mt-1">{dish.internal_reference}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(dish.status)}>
                        {dish.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(dish.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
