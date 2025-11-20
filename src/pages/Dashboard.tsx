import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, LogOut, User, Package, Sparkles, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  const loadProfile = async () => {
    try {
      const { data } = await supabase
        .from("restaurant_profiles")
        .select("restaurant_name, pack_dishes_remaining, pack_dishes_total")
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

          {/* Pack Quota Widget */}
          {profile && profile.pack_dishes_remaining > 0 && (
            <Card className="mb-6 shadow-elegant bg-gradient-to-br from-primary/10 to-background border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Multi-Dish Pack Active
                    </CardTitle>
                    <CardDescription className="mt-1">
                      You can create {profile.pack_dishes_remaining} more dish{profile.pack_dishes_remaining !== 1 ? 'es' : ''} without additional payment
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{profile.pack_dishes_remaining}</div>
                    <div className="text-sm text-muted-foreground">of {profile.pack_dishes_total} remaining</div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

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
                onClick={() => navigate("/app/dishes/new")} 
                className="shadow-elegant"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Dish Order
              </Button>
              {!hasPendingDemoOrder && !hasAnyDemoDish && (
                <Button 
                  onClick={() => navigate("/app/dishes/new?demo=true")} 
                  variant="outline"
                  className="border-primary/50"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Try Demo ($99)
                </Button>
              )}
            </div>
          </div>

          {hasPendingDemoOrder && (
            <Alert className="mt-4 mb-2">
              <Info className="h-4 w-4" />
              <AlertDescription>
                You already have a demo dish in progress. Once it's delivered, you'll be able to order another one.
              </AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : dishes.length === 0 ? (
            <Card className="shadow-elegant">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-full opacity-20 animate-pulse mb-6"></div>
                <h3 className="text-2xl font-bold mb-2">Start with your first 3D dish</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Try a single dish for $99 or save with a multi-dish pack. Upload 8-20 photos, and our team will create an AR-ready 3D visualization.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => navigate("/app/dishes/new?demo=true")} size="lg" variant="outline">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Try Demo ($99)
                  </Button>
                  <Button onClick={() => navigate("/#pricing")} size="lg" className="bg-gradient-primary shadow-glow">
                    View Packs
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">Typical delivery: 5-7 business days</p>
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
