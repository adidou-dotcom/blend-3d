-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for dish order status
CREATE TYPE dish_order_status AS ENUM ('NEW', 'IN_PRODUCTION', 'READY', 'DELIVERED', 'CANCELLED');

-- Create enum for payment status
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED');

-- Create enum for app roles
CREATE TYPE app_role AS ENUM ('admin', 'restaurant_owner');

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'restaurant_owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create restaurant_profiles table
CREATE TABLE public.restaurant_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_name TEXT NOT NULL,
  country TEXT,
  city TEXT,
  website_url TEXT,
  whatsapp_number TEXT,
  logo_url TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on restaurant_profiles
ALTER TABLE public.restaurant_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for restaurant_profiles
CREATE POLICY "Users can view their own profile"
  ON public.restaurant_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.restaurant_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.restaurant_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.restaurant_profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create dish_orders table
CREATE TABLE public.dish_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_profile_id UUID NOT NULL REFERENCES public.restaurant_profiles(id) ON DELETE CASCADE,
  dish_name TEXT NOT NULL,
  internal_reference TEXT UNIQUE,
  description TEXT,
  cuisine_type TEXT,
  target_use_case TEXT,
  price_charged DECIMAL(10,2) NOT NULL DEFAULT 99.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  status dish_order_status NOT NULL DEFAULT 'NEW',
  delivery_url TEXT,
  delivery_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on dish_orders
ALTER TABLE public.dish_orders ENABLE ROW LEVEL SECURITY;

-- Function to generate internal reference
CREATE OR REPLACE FUNCTION generate_internal_reference()
RETURNS TRIGGER AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(internal_reference FROM 9) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.dish_orders
  WHERE internal_reference LIKE 'MB-DISH-%';
  
  NEW.internal_reference := 'MB-DISH-' || LPAD(next_number::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate internal reference
CREATE TRIGGER set_internal_reference
  BEFORE INSERT ON public.dish_orders
  FOR EACH ROW
  WHEN (NEW.internal_reference IS NULL)
  EXECUTE FUNCTION generate_internal_reference();

-- RLS policies for dish_orders
CREATE POLICY "Users can view their own orders"
  ON public.dish_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON public.dish_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
  ON public.dish_orders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON public.dish_orders FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all orders"
  ON public.dish_orders FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create dish_photos table
CREATE TABLE public.dish_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dish_order_id UUID NOT NULL REFERENCES public.dish_orders(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on dish_photos
ALTER TABLE public.dish_photos ENABLE ROW LEVEL SECURITY;

-- RLS policies for dish_photos
CREATE POLICY "Users can view photos of their own orders"
  ON public.dish_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.dish_orders
      WHERE dish_orders.id = dish_photos.dish_order_id
      AND dish_orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert photos for their own orders"
  ON public.dish_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dish_orders
      WHERE dish_orders.id = dish_photos.dish_order_id
      AND dish_orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all photos"
  ON public.dish_photos FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create payment_records table
CREATE TABLE public.payment_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dish_order_id UUID NOT NULL REFERENCES public.dish_orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status payment_status NOT NULL DEFAULT 'PENDING',
  provider TEXT DEFAULT 'manual',
  provider_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on payment_records
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment_records
CREATE POLICY "Users can view their own payment records"
  ON public.payment_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment records"
  ON public.payment_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment records"
  ON public.payment_records FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all payment records"
  ON public.payment_records FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for dish photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('dish-photos', 'dish-photos', true);

-- Storage policies for dish-photos bucket
CREATE POLICY "Users can upload photos for their orders"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'dish-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view dish photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'dish-photos');

CREATE POLICY "Users can delete their own photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'dish-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage bucket for restaurant logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-logos', 'restaurant-logos', true);

-- Storage policies for restaurant-logos bucket
CREATE POLICY "Users can upload their restaurant logo"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'restaurant-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view restaurant logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'restaurant-logos');

CREATE POLICY "Users can update their restaurant logo"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'restaurant-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_restaurant_profiles_updated_at
  BEFORE UPDATE ON public.restaurant_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dish_orders_updated_at
  BEFORE UPDATE ON public.dish_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-assign restaurant_owner role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'restaurant_owner');
  RETURN NEW;
END;
$$;

-- Trigger to auto-assign role on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();