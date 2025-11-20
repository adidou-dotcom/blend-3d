import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface DishOrder {
  dish_name: string;
  internal_reference: string;
  description: string | null;
  status: string;
  delivery_url: string | null;
  restaurant_profiles: {
    restaurant_name: string;
    city: string | null;
    country: string | null;
    logo_url: string | null;
  };
}

interface DishPhoto {
  image_url: string;
}

const DemoViewer = () => {
  const { id } = useParams();
  const [dish, setDish] = useState<DishOrder | null>(null);
  const [photos, setPhotos] = useState<DishPhoto[]>([]);
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
        .select(`
          dish_name,
          internal_reference,
          description,
          status,
          delivery_url,
          restaurant_profiles (
            restaurant_name,
            city,
            country,
            logo_url
          )
        `)
        .eq("id", id)
        .single();

      if (dishError) throw dishError;

      const { data: photosData } = await supabase
        .from("dish_photos")
        .select("image_url")
        .eq("dish_order_id", id)
        .limit(1);

      setDish(dishData);
      setPhotos(photosData || []);
    } catch (error) {
      console.error("Error loading dish:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full text-center p-8">
          <CardHeader>
            <CardTitle>Demo Not Found</CardTitle>
            <CardDescription>This 3D dish demo doesn't exist or has been removed.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isNotReady = dish.status !== "READY" && dish.status !== "DELIVERED";

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Menublend
          </Link>
          <Badge variant="outline">3D Demo Dish</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-start gap-6">
            {dish.restaurant_profiles.logo_url && (
              <img src={dish.restaurant_profiles.logo_url} alt={dish.restaurant_profiles.restaurant_name} className="w-20 h-20 rounded-full object-cover border-2" />
            )}
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                {dish.restaurant_profiles.restaurant_name}
                {dish.restaurant_profiles.city && <> • {dish.restaurant_profiles.city}, {dish.restaurant_profiles.country}</>}
              </p>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">{dish.dish_name}</h1>
              <p className="text-sm text-muted-foreground mt-2">Order #{dish.internal_reference}</p>
            </div>
          </div>

          {photos.length > 0 && (
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
              <img src={photos[0].image_url} alt={dish.dish_name} className="w-full h-full object-cover" />
            </div>
          )}

          {isNotReady && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6 text-center">
                <p className="font-medium">🚧 This demo is not ready yet. Typical turnaround: 5-7 business days</p>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>3D / AR Viewer</CardTitle>
            </CardHeader>
            <CardContent>
              {dish.delivery_url ? (
                <iframe src={dish.delivery_url} className="w-full h-[500px] rounded-lg" title="3D Dish Viewer" allowFullScreen />
              ) : (
                <div className="bg-muted rounded-lg p-12 flex items-center justify-center min-h-[500px]">
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-full opacity-20 animate-pulse"></div>
                    <p className="text-lg font-medium">3D model is being processed</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {dish.description && (
            <Card>
              <CardHeader><CardTitle>About This Dish</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground">{dish.description}</p></CardContent>
            </Card>
          )}

          <Card className="bg-gradient-subtle border-primary/20">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">Menublend</div>
              <h3 className="text-xl font-semibold">Powered by Menublend</h3>
              <p className="text-sm text-muted-foreground">Transform your menu into immersive 3D/AR experiences.</p>
              <Button asChild variant="default"><Link to="/">Learn More<ExternalLink className="ml-2 h-4 w-4" /></Link></Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DemoViewer;
