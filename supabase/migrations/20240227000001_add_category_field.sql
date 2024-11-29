-- Add category column to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS category TEXT;

-- Create index for category
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);