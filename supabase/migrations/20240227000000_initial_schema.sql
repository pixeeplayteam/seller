-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  ean_code TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  dimensions JSONB NOT NULL DEFAULT '{"length": 0, "width": 0, "height": 0, "unit": "cm"}'::jsonb,
  weight JSONB NOT NULL DEFAULT '{"value": 0, "unit": "kg"}'::jsonb,
  images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create amazon_credentials table
CREATE TABLE IF NOT EXISTS public.amazon_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_key TEXT NOT NULL,
  secret_key TEXT NOT NULL,
  region TEXT NOT NULL,
  marketplace_id TEXT NOT NULL,
  merchant_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT amazon_credentials_user_id_key UNIQUE (user_id)
);

-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Users can only access their own products" ON public.products;
DROP POLICY IF EXISTS "Users can only access their own credentials" ON public.amazon_credentials;

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
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_ean_code ON public.products(ean_code);
CREATE INDEX IF NOT EXISTS idx_amazon_credentials_user_id ON public.amazon_credentials(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_amazon_credentials_updated_at ON public.amazon_credentials;
CREATE TRIGGER update_amazon_credentials_updated_at
  BEFORE UPDATE ON public.amazon_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();