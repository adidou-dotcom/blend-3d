import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";

interface DishOrderWithProfile {
  id: string;
  dish_name: string;
  internal_reference: string | null;
  status: string;
  created_at: string;
  price_charged: number;
  currency: string;
  restaurant_profiles: {
    restaurant_name: string;
    user_id: string;
  };
}

const AdminDishes = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get("filter") || "All";
  
  const [dishes, setDishes] = useState<DishOrderWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(initialFilter);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadDishes();
  }, []);

  const loadDishes = async () => {
    try {
      const { data, error } = await supabase
        .from("dish_orders")
        .select(`
          id,
          dish_name,
          internal_reference,
          status,
          created_at,
          price_charged,
          currency,
          restaurant_profiles (
            restaurant_name,
            user_id
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDishes(data as any || []);
    } catch (error) {
      console.error("Error loading dishes:", error);
    } finally {
      setLoading(false);
    }
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

  const filteredDishes = dishes.filter(dish => {
    const matchesFilter = filter === "All" || dish.status === filter;
    const matchesSearch = 
      dish.dish_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.internal_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.restaurant_profiles.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gradient-subtle">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link to="/admin" className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Menublend Admin
            </Link>
            <nav className="flex gap-6">
              <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link to="/admin/dishes" className="text-sm font-medium text-primary">
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
            <h1 className="text-3xl font-bold">All Dish Orders</h1>
            <p className="text-muted-foreground mt-1">Manage and track all customer orders</p>
          </div>

          {/* Filters and Search */}
          <div className="mb-6 flex flex-col gap-4">
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
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by dish name, reference, or restaurant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <Card className="shadow-elegant">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Dish Name</TableHead>
                      <TableHead>Restaurant</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDishes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDishes.map((dish) => (
                        <TableRow
                          key={dish.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/admin/dishes/${dish.id}`)}
                        >
                          <TableCell className="font-mono text-sm">
                            {dish.internal_reference}
                          </TableCell>
                          <TableCell className="font-medium">{dish.dish_name}</TableCell>
                          <TableCell>{dish.restaurant_profiles.restaurant_name}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(dish.status)}>
                              {dish.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            ${dish.price_charged} {dish.currency}
                          </TableCell>
                          <TableCell>
                            {new Date(dish.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDishes;
