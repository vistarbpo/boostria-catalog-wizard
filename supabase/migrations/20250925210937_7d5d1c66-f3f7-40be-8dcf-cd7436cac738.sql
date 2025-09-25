-- Create products table for individual product data
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  catalog_id UUID REFERENCES public.catalogs(id) ON DELETE CASCADE,
  
  -- Basic product info
  sku TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  brand TEXT,
  category TEXT,
  
  -- Pricing
  price DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  
  -- Product details
  condition TEXT CHECK (condition IN ('new', 'refurbished', 'used')) DEFAULT 'new',
  availability TEXT CHECK (availability IN ('in stock', 'out of stock', 'preorder', 'backorder')) DEFAULT 'in stock',
  
  -- Images and media
  main_image_url TEXT,
  additional_images TEXT[], -- Array of image URLs
  
  -- Variants and attributes
  size TEXT,
  color TEXT,
  material TEXT,
  weight TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'unisex')),
  
  -- SEO and links
  product_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  
  -- Inventory
  stock_quantity INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for products
CREATE POLICY "Users can view their own products" 
ON public.products 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own products" 
ON public.products 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" 
ON public.products 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" 
ON public.products 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_catalog_id ON public.products(catalog_id);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_category ON public.products(category);