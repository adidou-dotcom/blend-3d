-- Add is_demo column to dish_orders table
ALTER TABLE public.dish_orders 
ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;