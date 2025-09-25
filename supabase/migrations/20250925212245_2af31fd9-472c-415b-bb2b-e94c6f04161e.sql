-- Add unique constraint on SKU and user_id combination to prevent future duplicates
ALTER TABLE public.products 
ADD CONSTRAINT products_user_sku_unique 
UNIQUE (user_id, sku);