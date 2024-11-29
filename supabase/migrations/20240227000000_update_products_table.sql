-- Add new columns to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS asin TEXT,
ADD COLUMN IF NOT EXISTS browse_nodes TEXT[],
ADD COLUMN IF NOT EXISTS sales_rank INTEGER,
ADD COLUMN IF NOT EXISTS buy_box JSONB DEFAULT '{"price": null, "sellerId": null, "sellerName": null, "isAmazonFulfilled": false, "isAmazonSelling": false, "isPreorder": false, "isBackordered": false, "shippingCountry": null}'::jsonb,
ADD COLUMN IF NOT EXISTS amazon_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS lowest_prices JSONB DEFAULT '{"fbaNew": null, "new": null, "used": null, "collectible": null, "refurbished": null}'::jsonb,
ADD COLUMN IF NOT EXISTS list_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS product_group TEXT,
ADD COLUMN IF NOT EXISTS product_type TEXT;

-- Make images column nullable
ALTER TABLE public.products ALTER COLUMN images DROP NOT NULL;