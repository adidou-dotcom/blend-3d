import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Upload, X, CheckCircle, ArrowRight, ArrowLeft, Info, Loader2 } from "lucide-react";
import { PRICING, MIN_PHOTOS, MAX_PHOTOS, PHOTO_UPLOAD_TIPS } from "@/config/pricing";
import { notifyAdminNewOrder } from "@/services/emailService";

const CreateDish = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [restaurantProfileId, setRestaurantProfileId] = useState<string | null>(null);
  const [restaurantData, setRestaurantData] = useState<{ name: string; city?: string; country?: string } | null>(null);
  
  // Step 1 data
  const [dishName, setDishName] = useState("");
  const [description, setDescription] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [targetUseCase, setTargetUseCase] = useState("");

  // Step 2 data
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // Step 3 data
  const [dishOrderId, setDishOrderId] = useState<string | null>(null);
  const [internalReference, setInternalReference] = useState<string | null>(null);

  useEffect(() => {
    loadRestaurantProfile();
  }, [user]);

  const loadRestaurantProfile = async () => {
    if (!user) return;

    const { data, error} = await supabase
      .from("restaurant_profiles")
      .select("id, restaurant_name, city, country")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error loading profile:", error);
      toast.error("Please complete your profile first");
      navigate("/onboarding");
      return;
    }

    setRestaurantProfileId(data.id);
    setRestaurantData({
      name: data.restaurant_name,
      city: data.city || undefined,
      country: data.country || undefined,
    });
  };

  const handleStep1Submit = async () => {
    if (!dishName.trim() || !restaurantProfileId) {
      toast.error("Please fill in the dish name");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("dish_orders")
        .insert({
          user_id: user!.id,
          restaurant_profile_id: restaurantProfileId,
          dish_name: dishName,
          description: description || null,
          cuisine_type: cuisineType || null,
          target_use_case: targetUseCase || null,
          status: "NEW",
          is_demo: isDemo,
          price_charged: PRICING.SINGLE.price,
          currency: PRICING.SINGLE.currency,
        })
        .select()
        .single();

      if (error) throw error;

      setDishOrderId(data.id);
      setInternalReference(data.internal_reference);
      setStep(2);
      toast.success("Dish info saved! Now upload your photos.");
    } catch (error: any) {
      console.error("Error creating dish order:", error);
      toast.error("Failed to create dish order");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith("image/"));
    
    if (validFiles.length !== files.length) {
      toast.error("Only image files are allowed");
    }

    const newPhotos = [...photos, ...validFiles].slice(0, MAX_PHOTOS);
    setPhotos(newPhotos);
    
    if (newPhotos.length === MAX_PHOTOS && files.length > MAX_PHOTOS) {
      toast.info(`Maximum ${MAX_PHOTOS} photos allowed`);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleStep2Submit = async () => {
    if (photos.length < MIN_PHOTOS) {
      toast.error(`Please upload at least ${MIN_PHOTOS} photos`);
      return;
    }

    if (photos.length > MAX_PHOTOS) {
      toast.error(`Maximum ${MAX_PHOTOS} photos allowed`);
      return;
    }

    if (!dishOrderId) {
      toast.error("Order ID missing. Please restart the process.");
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = photos.map(async (photo, index) => {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${dishOrderId}/${Date.now()}_${index}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("dish-photos")
          .upload(fileName, photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("dish-photos")
          .getPublicUrl(fileName);

        const { error: dbError } = await supabase
          .from("dish_photos")
          .insert({
            dish_order_id: dishOrderId!,
            image_url: publicUrl,
          });

        if (dbError) throw dbError;
      });

      await Promise.all(uploadPromises);
      setStep(3);
      toast.success("Photos uploaded successfully!");
    } catch (error: any) {
      console.error("Error uploading photos:", error);
      toast.error("Failed to upload photos");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!dishOrderId) return;

    setLoading(true);
    try {
      // Create payment record
      const { error: paymentError } = await supabase
        .from("payment_records")
        .insert({
          dish_order_id: dishOrderId,
          user_id: user!.id,
          amount: PRICING.SINGLE.price,
          currency: PRICING.SINGLE.currency,
          status: "PENDING",
          provider: "manual",
        });

      if (paymentError) throw paymentError;

      // Send notification email to admin
      if (restaurantData && internalReference) {
        await notifyAdminNewOrder({
          restaurantName: restaurantData.name,
          dishName,
          internalReference,
          dishOrderId,
          city: restaurantData.city,
          country: restaurantData.country,
        });
      }

      toast.success("Your demo dish has been submitted! We'll review your photos and send you the 3D/AR result.");
      navigate("/app");
    } catch (error: any) {
      console.error("Error confirming order:", error);
      toast.error("Failed to confirm order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-subtle">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Button variant="ghost" onClick={() => navigate("/app")}>
              ← Back to Dashboard
            </Button>
            <Progress value={(step / 3) * 100} className="w-32" />
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create New 3D Dish Order</h1>
            <p className="text-muted-foreground">
              Step {step} of 3: {step === 1 ? "Dish Information" : step === 2 ? "Upload Photos" : "Review & Confirm"}
            </p>
          </div>

          {step === 1 && (
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Dish Information</CardTitle>
                <CardDescription>Tell us about the dish you want to turn into 3D</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="dishName">Dish Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="dishName"
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    placeholder="e.g., Signature Burger, Chocolate Lava Cake"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of your dish (optional)"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cuisineType">Cuisine Type</Label>
                  <Input
                    id="cuisineType"
                    value={cuisineType}
                    onChange={(e) => setCuisineType(e.target.value)}
                    placeholder="e.g., Italian, Japanese, Fusion (optional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetUseCase">Target Use Case</Label>
                  <Select value={targetUseCase} onValueChange={setTargetUseCase}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a use case (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Menu 3D">Menu 3D</SelectItem>
                      <SelectItem value="AR menu">AR menu</SelectItem>
                      <SelectItem value="Marketing visuals">Marketing visuals</SelectItem>
                      <SelectItem value="Delivery app visuals">Delivery app visuals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Next step:</strong> You will upload 8–20 high-quality photos of your dish from different angles.
                  </p>
                </div>

                <Button onClick={handleStep1Submit} disabled={loading} className="w-full" size="lg">
                  {loading ? "Creating..." : "Next: Upload Photos"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Upload Photos</CardTitle>
                <CardDescription>
                  Upload 8–20 high-quality photos of your dish from different angles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop images here, or click to browse
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoSelect}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Label htmlFor="photo-upload">
                    <Button type="button" variant="outline" asChild>
                      <span>Browse Files</span>
                    </Button>
                  </Label>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {photos.length} / 20 photos
                  </p>
                  <p className={`text-sm ${photos.length >= 8 && photos.length <= 20 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {photos.length < 8 ? `${8 - photos.length} more needed` : photos.length > 20 ? 'Too many photos' : 'Ready to proceed'}
                  </p>
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleStep2Submit}
                    disabled={photos.length < 8 || photos.length > 20 || uploading}
                    className="flex-1"
                    size="lg"
                  >
                    {uploading ? "Uploading..." : "Next: Review & Confirm"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Review & Confirm</CardTitle>
                <CardDescription>Review your order before confirming</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Dish Name</p>
                    <p className="font-medium">{dishName}</p>
                  </div>
                  {description && (
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="font-medium">{description}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Photos Uploaded</p>
                    <p className="font-medium">{photos.length} photos</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-2xl font-bold">$99.00 USD</p>
                  </div>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">What happens next?</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Our team will review your photos and start creating your 3D/AR experience. 
                        Typical delivery time is 5–7 business days.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Payment (MVP)</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        For this MVP, clicking confirm will mark your order as paid. 
                        We'll contact you to arrange payment details separately.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleConfirmOrder}
                    disabled={loading}
                    className="flex-1"
                    size="lg"
                  >
                    {loading ? "Confirming..." : "Confirm & Mark as Paid"}
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default CreateDish;
