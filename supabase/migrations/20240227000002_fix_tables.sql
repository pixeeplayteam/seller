-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.amazon_credentials;
DROP TABLE IF EXISTS public.products;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    ean_code TEXT NOT NULL,
    asin TEXT,
    category TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    dimensions JSONB NOT NULL DEFAULT '{"length": 0, "width": 0, "height": 0, "unit": "cm"}'::jsonb,
    weight JSONB NOT NULL DEFAULT '{"value": 0, "unit": "kg"}'::jsonb,
    images TEXT[],
    status TEXT NOT NULL DEFAULT 'pending',
    browse_nodes TEXT[],
    sales_rank INTEGER,
    buy_box JSONB DEFAULT '{"price": null, "sellerId": null, "sellerName": null, "isAmazonFulfilled": false, "isAmazonSelling": false, "isPreorder": false, "isBackordered": false, "shippingCountry": null}'::jsonb,
    amazon_price DECIMAL(10,2),
    lowest_prices JSONB DEFAULT '{"fbaNew": null, "new": null, "used": null, "collectible": null, "refurbished": null}'::jsonb,
    list_price DECIMAL(10,2),
    product_group TEXT,
    product_type TEXT,
    variations_count INTEGER,
    import_code TEXT,
    upc TEXT,
    part_number TEXT,
    new_offers_count INTEGER,
    used_offers_count INTEGER,
    collectible_offers_count INTEGER,
    refurbished_offers_count INTEGER,
    referral_fee_percentage DECIMAL(5,2),
    prep_fee DECIMAL(10,2),
    package_length DECIMAL(10,2),
    package_width DECIMAL(10,2),
    package_height DECIMAL(10,2),
    package_weight DECIMAL(10,2),
    package_quantity INTEGER,
    brand TEXT,
    manufacturer TEXT,
    contributors TEXT[],
    publication_date DATE,
    release_date DATE,
    color TEXT,
    size TEXT,
    features TEXT[],
    items_count INTEGER,
    pages_count INTEGER,
    is_exchangeable BOOLEAN,
    marketplace TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, ean_code)
);

-- Create amazon_credentials table
CREATE TABLE public.amazon_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    access_key TEXT NOT NULL,
    secret_key TEXT NOT NULL,
    region TEXT NOT NULL,
    marketplace_id TEXT NOT NULL,
    merchant_id TEXT NOT NULL DEFAULT 'pixeeplay',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amazon_credentials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only access their own products"
ON public.products
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own credentials"
ON public.amazon_credentials
FOR ALL
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_ean_code ON public.products(ean_code);
CREATE INDEX idx_products_asin ON public.products(asin);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_amazon_credentials_user_id ON public.amazon_credentials(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_amazon_credentials_updated_at
    BEFORE UPDATE ON public.amazon_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();