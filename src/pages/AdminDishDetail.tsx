import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

interface DishOrder {
  id: string;
  dish_name: string;
  description: string | null;
  cuisine_type: string | null;
  target_use_case: string | null;
  internal_reference: string | null;
  status: string;
  price_charged: number;
  currency: string;
  delivery_url: string | null;
  delivery_note: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  restaurant_profiles: {
    restaurant_name: string;
    country: string | null;
    city: string | null;
  };
}

interface DishPhoto {
  id: string;
  image_url: string;
}

const AdminDishDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dish, setDish] = useState<DishOrder | null>(null);
  const [photos, setPhotos] = useState<DishPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [status, setStatus] = useState<Database["public"]["Enums"]["dish_order_status"]>("NEW");
  const [deliveryUrl, setDeliveryUrl] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");

  useEffect(() => {
    if (id) {
      loadDishData();
    }
  }, [id]);

  const loadDishData = async () => {
    try {
      const { data: dishData, error: dishError } = await supabase
        .from("dish_orders")
        .select(`
          *,
          restaurant_profiles (
            restaurant_name,
            country,
            city
          )
        `)
        .eq("id", id)
        .single();

      if (dishError) throw dishError;
      setDish(dishData as any);
      setStatus(dishData.status as Database["public"]["Enums"]["dish_order_status"]);
      setDeliveryUrl(dishData.delivery_url || "");
      setDeliveryNote(dishData.delivery_note || "");

      const { data: photosData, error: photosError } = await supabase
        .from("dish_photos")
        .select("*")
        .eq("dish_order_id", id)
        .order("created_at", { ascending: true });

      if (photosError) throw photosError;
      setPhotos(photosData || []);
    } catch (error: any) {
      console.error("Error loading dish:", error);
      toast.error("Failed to load dish details");
      navigate("/admin/dishes");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("dish_orders")
        .update({
          status,
          delivery_url: deliveryUrl || null,
          delivery_note: deliveryNote || null,
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Order updated successfully!");
      loadDishData();
    } catch (error: any) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!dish) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
          <p>Dish not found</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gradient-subtle">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center px-4">
            <Button variant="ghost" asChild>
              <Link to="/admin/dishes">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Link>
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{dish.dish_name}</h1>
                <p className="text-muted-foreground mt-1">
                  Order {dish.internal_reference} • {dish.restaurant_profiles.restaurant_name}
                </p>
              </div>
              <Badge className={getStatusColor(dish.status)}>
                {dish.status.replace("_", " ")}
              </Badge>
            </div>

            {/* Order Info */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Restaurant</Label>
                    <p className="mt-1">{dish.restaurant_profiles.restaurant_name}</p>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <p className="mt-1">
                      {dish.restaurant_profiles.city}, {dish.restaurant_profiles.country}
                    </p>
                  </div>
                  {dish.description && (
                    <div className="sm:col-span-2">
                      <Label>Description</Label>
                      <p className="mt-1">{dish.description}</p>
                    </div>
                  )}
                  {dish.cuisine_type && (
                    <div>
                      <Label>Cuisine Type</Label>
                      <p className="mt-1">{dish.cuisine_type}</p>
                    </div>
                  )}
                  {dish.target_use_case && (
                    <div>
                      <Label>Target Use Case</Label>
                      <p className="mt-1">{dish.target_use_case}</p>
                    </div>
                  )}
                  <div>
                    <Label>Price</Label>
                    <p className="mt-1 font-semibold">
                      ${dish.price_charged} {dish.currency}
                    </p>
                  </div>
                  <div>
                    <Label>Created</Label>
                    <p className="mt-1">
                      {new Date(dish.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photos */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Uploaded Photos</CardTitle>
                <CardDescription>{photos.length} photos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <a
                      key={photo.id}
                      href={photo.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={photo.image_url}
                        alt="Dish photo"
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Admin Controls */}
            <Card className="shadow-elegant border-primary/20">
              <CardHeader>
                <CardTitle>Admin Controls</CardTitle>
                <CardDescription>Update order status and delivery details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as Database["public"]["Enums"]["dish_order_status"])}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">NEW</SelectItem>
                      <SelectItem value="IN_PRODUCTION">IN PRODUCTION</SelectItem>
                      <SelectItem value="READY">READY</SelectItem>
                      <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                      <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryUrl">Delivery URL</Label>
                  <Input
                    id="deliveryUrl"
                    type="url"
                    placeholder="https://..."
                    value={deliveryUrl}
                    onChange={(e) => setDeliveryUrl(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Link to Google Drive, Sketchfab, or any 3D/AR viewer
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryNote">Delivery Note</Label>
                  <Textarea
                    id="deliveryNote"
                    placeholder="Internal or external notes about this delivery..."
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button onClick={handleSave} disabled={saving} size="lg" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDishDetail;
