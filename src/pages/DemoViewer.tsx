import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DishOrder {
  dish_name: string;
  internal_reference: string;
}

const DemoViewer = () => {
  const { id } = useParams();
  const [dish, setDish] = useState<DishOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDishData();
    }
  }, [id]);

  const loadDishData = async () => {
    try {
      // Note: This is a public route, so we don't filter by user_id
      // In production, you'd want to add RLS policies for public access
      const { data, error } = await supabase
        .from("dish_orders")
        .select("dish_name, internal_reference")
        .eq("id", id)
        .single();

      if (error) throw error;
      setDish(data);
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

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-3xl bg-gradient-primary bg-clip-text text-transparent">
            3D Dish Viewer
          </CardTitle>
          <CardDescription>Interactive 3D model preview</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {dish ? (
            <>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">{dish.dish_name}</h2>
                <p className="text-sm text-muted-foreground">
                  Order: {dish.internal_reference}
                </p>
              </div>

              <div className="bg-muted rounded-lg p-12 flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-full opacity-20 animate-pulse"></div>
                  <p className="text-lg font-medium">3D Viewer Coming Soon</p>
                  <p className="text-sm text-muted-foreground max-w-md">
                    This interactive 3D viewer will allow you to rotate, zoom, and explore
                    the dish model in augmented reality.
                  </p>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold">What's Next?</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Interactive 3D model rotation and zoom</li>
                  <li>AR view on mobile devices</li>
                  <li>Downloadable 3D files</li>
                  <li>Embed code for your website</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Dish not found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoViewer;
