import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, Package } from "lucide-react";
import QRCode from "react-qr-code";

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
  is_demo: boolean;
}

interface DishPhoto {
  id: string;
  image_url: string;
}

interface PaymentRecord {
  status: string;
  amount: number;
  currency: string;
}

const DishDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dish, setDish] = useState<DishOrder | null>(null);
  const [photos, setPhotos] = useState<DishPhoto[]>([]);
  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDishData();
    }
  }, [id]);

  const loadDishData = async () => {
    try {
      const { data: dishData, error: dishError } = await supabase
        .from("dish_orders")
        .select("*")
        .eq("id", id)
        .eq("user_id", user?.id)
        .single();

      if (dishError) throw dishError;
      setDish(dishData);

      const { data: photosData, error: photosError } = await supabase
        .from("dish_photos")
        .select("*")
        .eq("dish_order_id", id)
        .order("created_at", { ascending: true });

      if (photosError) throw photosError;
      setPhotos(photosData || []);

      // Load payment record
      const { data: paymentData, error: paymentError } = await supabase
        .from("payment_records")
        .select("status, amount, currency")
        .eq("dish_order_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!paymentError && paymentData) {
        setPayment(paymentData);
      }
    } catch (error: any) {
      console.error("Error loading dish:", error);
      toast.error("Failed to load dish details");
      navigate("/app");
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-500";
      case "PENDING":
        return "bg-yellow-500";
      case "FAILED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!dish) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
          <p>Dish not found</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-subtle">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center px-4">
            <Button variant="ghost" asChild>
              <Link to="/app">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
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
                  Order {dish.internal_reference}
                  {dish.is_demo && <span className="ml-2 text-sm font-medium">• Demo Dish</span>}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(dish.status)}>
                  {dish.status.replace("_", " ")}
                </Badge>
                {payment && (
                  <Badge className={getPaymentStatusColor(payment.status)}>
                    {payment.status}
                  </Badge>
                )}
              </div>
            </div>

            {/* Info Card */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {dish.description && (
                    <div>
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
                  <div>
                    <Label>Last Updated</Label>
                    <p className="mt-1">
                      {new Date(dish.updated_at).toLocaleDateString()}
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
                {photos.length > 0 ? (
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
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No photos uploaded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Info - only shown if status is READY or DELIVERED */}
            {(dish.status === "READY" || dish.status === "DELIVERED") && dish.delivery_url && (
              <Card className="shadow-elegant border-primary/20">
                <CardHeader>
                  <CardTitle className="text-green-600">🎉 Your 3D Dish is Ready!</CardTitle>
                  <CardDescription>
                    Access your 3D/AR assets and shareable viewer link
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Delivery URL</Label>
                    <div className="flex gap-2 mt-2">
                      <Input value={dish.delivery_url} readOnly />
                      <Button size="icon" variant="outline" asChild>
                        <a href={dish.delivery_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  {dish.delivery_note && (
                    <div>
                      <Label>Delivery Note</Label>
                      <p className="mt-2 text-sm bg-muted/50 p-3 rounded-lg">
                        {dish.delivery_note}
                      </p>
                    </div>
                  )}

                  <div>
                    <Label className="mb-2 block">QR Code</Label>
                    <div className="bg-white p-6 rounded-lg inline-block">
                      <QRCode value={dish.delivery_url} size={200} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Scan this QR code to view your 3D dish on any device
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Public Viewer Placeholder */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Public Viewer URL</CardTitle>
                <CardDescription>Coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  value="Feature coming soon..."
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  A public-facing viewer link will be available in a future update
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default DishDetail;
