import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, LogOut, User, Package } from "lucide-react";

interface DishOrder {
  id: string;
  dish_name: string;
  internal_reference: string;
  status: string;
  created_at: string;
}

const Dashboard = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [dishes, setDishes] = useState<DishOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("All");
  const [restaurantName, setRestaurantName] = useState("");

  useEffect(() => {
    if (user) {
      loadDishes();
      loadRestaurantName();
    }
  }, [user]);

  const loadRestaurantName = async () => {
    try {
      const { data } = await supabase
        .from("restaurant_profiles")
        .select("restaurant_name")
        .eq("user_id", user?.id)
        .single();
      
      if (data) setRestaurantName(data.restaurant_name);
    } catch (error) {
      console.error("Error loading restaurant name:", error);
    }
  };

  const loadDishes = async () => {
    try {
      const { data, error } = await supabase
        .from("dish_orders")
        .select("id, dish_name, internal_reference, status, created_at, price_charged, currency")
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
            <h1 className="text-3xl font-bold">Welcome back{restaurantName ? `, ${restaurantName}` : ""}!</h1>
            <p className="text-muted-foreground mt-1">Manage your 3D dish orders</p>
          </div>

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
            <Button onClick={() => navigate("/app/dishes/new")} className="shadow-elegant">
              <Plus className="h-4 w-4 mr-2" />
              Create 3D Dish
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : dishes.length === 0 ? (
            <Card className="shadow-elegant">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No dishes yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Get started by creating your first 3D dish order. Upload photos and we'll transform them into an immersive AR experience.
                </p>
                <Button onClick={() => navigate("/app/dishes/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first dish
                </Button>
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
