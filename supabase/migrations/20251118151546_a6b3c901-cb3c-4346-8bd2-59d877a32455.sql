-- Fix security warnings by setting search_path on trigger functions

-- Drop and recreate generate_internal_reference with proper search_path
DROP FUNCTION IF EXISTS generate_internal_reference() CASCADE;

CREATE OR REPLACE FUNCTION generate_internal_reference()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Recreate trigger
CREATE TRIGGER set_internal_reference
  BEFORE INSERT ON public.dish_orders
  FOR EACH ROW
  WHEN (NEW.internal_reference IS NULL)
  EXECUTE FUNCTION generate_internal_reference();

-- Drop and recreate update_updated_at_column with proper search_path
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate triggers for updated_at
CREATE TRIGGER update_restaurant_profiles_updated_at
  BEFORE UPDATE ON public.restaurant_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dish_orders_updated_at
  BEFORE UPDATE ON public.dish_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();