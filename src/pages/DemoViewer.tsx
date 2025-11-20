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
      <Card className="max-w-4xl w-full">
        <CardHeader>
          <CardTitle className="text-3xl bg-gradient-primary bg-clip-text text-transparent">
            {dish ? dish.dish_name : "3D Dish Viewer"}
          </CardTitle>
          <CardDescription>
            {dish && `Order: ${dish.internal_reference}`}
            <span className="ml-2 text-xs">• 3D demo dish by Menublend</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {dish ? (
            <>
              <div className="bg-muted rounded-lg p-12 flex items-center justify-center min-h-[500px]">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-full opacity-20 animate-pulse"></div>
                  <p className="text-lg font-medium">3D Viewer Coming Soon</p>
                  <p className="text-sm text-muted-foreground max-w-md">
                    This photorealistic 3D viewer will allow guests to rotate, zoom, and explore
                    the dish model in augmented reality on their mobile devices.
                  </p>
                </div>
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
