import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [restaurantName, setRestaurantName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Load existing profile data
    const loadProfile = async () => {
      const { data } = await supabase
        .from("restaurant_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setRestaurantName(data.restaurant_name || "");
        setCountry(data.country || "");
        setCity(data.city || "");
        setWebsiteUrl(data.website_url || "");
        setWhatsappNumber(data.whatsapp_number || "");

        if (data.onboarding_completed) {
          navigate("/app");
        }
      }
    };

    loadProfile();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !restaurantName || !country || !city) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("restaurant_profiles")
        .update({
          restaurant_name: restaurantName,
          country,
          city,
          website_url: websiteUrl || null,
          whatsapp_number: whatsappNumber || null,
          onboarding_completed: true,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Profile completed!");
      navigate("/app");
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast.error("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-subtle px-4 py-12">
      <Card className="w-full max-w-2xl shadow-elegant">
        <CardHeader>
          <CardTitle className="text-2xl">Complete your profile</CardTitle>
          <CardDescription>
            Tell us about your restaurant to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="restaurantName">
                Restaurant Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="restaurantName"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">
                  Country <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL (optional)</Label>
              <Input
                id="websiteUrl"
                type="url"
                placeholder="https://yourrestaurant.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">WhatsApp Number (optional)</Label>
              <Input
                id="whatsappNumber"
                type="tel"
                placeholder="+1234567890"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Complete setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
