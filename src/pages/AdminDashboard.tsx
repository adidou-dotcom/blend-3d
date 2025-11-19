import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Package, Users, DollarSign, TrendingUp } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    newOrders: 0,
    inProduction: 0,
    ready: 0,
    delivered: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get total users
      const { count: usersCount } = await supabase
        .from("restaurant_profiles")
        .select("*", { count: "exact", head: true });

      // Get all orders
      const { data: orders } = await supabase
        .from("dish_orders")
        .select("status");

      setStats({
        totalUsers: usersCount || 0,
        totalOrders: orders?.length || 0,
        newOrders: orders?.filter(o => o.status === "NEW").length || 0,
        inProduction: orders?.filter(o => o.status === "IN_PRODUCTION").length || 0,
        ready: orders?.filter(o => o.status === "READY").length || 0,
        delivered: orders?.filter(o => o.status === "DELIVERED").length || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gradient-subtle">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link to="/admin" className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Menublend Admin
            </Link>
            <nav className="flex gap-6">
              <Link to="/admin" className="text-sm font-medium text-primary">
                Dashboard
              </Link>
              <Link to="/admin/dishes" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Dish Orders
              </Link>
              <Link to="/app" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Exit Admin
              </Link>
            </nav>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of all orders and users</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Overview Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card className="shadow-elegant">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  </CardContent>
                </Card>

                <Card className="shadow-elegant">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  </CardContent>
                </Card>

                <Card className="shadow-elegant">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Revenue (Mock)</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${(stats.totalOrders * 99).toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card className="shadow-elegant">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.delivered}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Status Breakdown */}
              <Card className="shadow-elegant mb-8">
                <CardHeader>
                  <CardTitle>Orders by Status</CardTitle>
                  <CardDescription>Current distribution of dish orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">New</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.newOrders}</p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">In Production</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.inProduction}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Ready</p>
                      <p className="text-2xl font-bold text-green-600">{stats.ready}</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Delivered</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.delivered}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <Button asChild className="shadow-elegant">
                      <Link to="/admin/dishes">View All Orders</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/admin/dishes?filter=NEW">View New Orders</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/admin/dishes?filter=IN_PRODUCTION">View In Production</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
