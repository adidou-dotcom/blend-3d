import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Upload, LogOut } from "lucide-react";

interface RestaurantProfile {
  id: string;
  restaurant_name: string;
  country: string | null;
  city: string | null;
  website_url: string | null;
  whatsapp_number: string | null;
  logo_url: string | null;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurant_profiles")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setRestaurantName(data.restaurant_name || "");
      setCountry(data.country || "");
      setCity(data.city || "");
      setWebsiteUrl(data.website_url || "");
      setWhatsappNumber(data.whatsapp_number || "");
      setLogoUrl(data.logo_url || "");
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user!.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("restaurant-logos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("restaurant-logos")
        .getPublicUrl(filePath);

      setLogoUrl(data.publicUrl);
      toast.success("Logo uploaded successfully");
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!restaurantName.trim()) {
      toast.error("Restaurant name is required");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("restaurant_profiles")
        .update({
          restaurant_name: restaurantName,
          country: country || null,
          city: city || null,
          website_url: websiteUrl || null,
          whatsapp_number: whatsappNumber || null,
          logo_url: logoUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user!.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      loadProfile();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
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
                <Link to="/app" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  My Dishes
                </Link>
                <Link to="/app/profile" className="text-sm font-medium text-primary">
                  Profile
                </Link>
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
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <Button variant="ghost" asChild>
                <Link to="/app">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Restaurant Profile</CardTitle>
                <CardDescription>
                  Manage your restaurant information and branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>Restaurant Logo</Label>
                  {logoUrl && (
                    <div className="mb-4">
                      <img
                        src={logoUrl}
                        alt="Restaurant logo"
                        className="h-24 w-24 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploading}
                      className="max-w-xs"
                    />
                    {uploading && (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    )}
                  </div>
                </div>

                {/* Restaurant Name */}
                <div className="space-y-2">
                  <Label htmlFor="restaurantName">
                    Restaurant Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="restaurantName"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="Enter restaurant name"
                  />
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Enter country"
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter city"
                  />
                </div>

                {/* Website URL */}
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>

                {/* WhatsApp Number */}
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                  <Input
                    id="whatsappNumber"
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Profile;
