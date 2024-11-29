-- Drop the unique constraint on ean_code
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_user_id_ean_code_key;

-- Add a new unique constraint that includes status
ALTER TABLE public.products
ADD CONSTRAINT products_user_id_ean_code_status_key 
UNIQUE (user_id, ean_code, status);

-- This allows multiple products with the same EAN code but different statuses
-- Useful for tracking product history and different versions