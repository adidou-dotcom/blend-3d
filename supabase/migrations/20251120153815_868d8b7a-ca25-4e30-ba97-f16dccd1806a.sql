-- Create subscription_records table for Paddle subscriptions
CREATE TABLE public.subscription_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  paddle_subscription_id text UNIQUE,
  plan text NOT NULL, -- "BASIC" or "PRO"
  status text NOT NULL, -- "TRIALING", "ACTIVE", "CANCELED", "PAUSED"
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_records ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own subscription"
  ON public.subscription_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON public.subscription_records FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own subscription"
  ON public.subscription_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.subscription_records FOR UPDATE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_subscription_records_updated_at
  BEFORE UPDATE ON public.subscription_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add pack_quota and pack_purchased columns to restaurant_profiles
ALTER TABLE public.restaurant_profiles 
ADD COLUMN IF NOT EXISTS pack_dishes_remaining integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pack_dishes_total integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pack_purchased_at timestamptz;