-- Remove duplicate products, keeping only the most recent one for each SKU
DELETE FROM public.products 
WHERE id NOT IN (
    SELECT DISTINCT ON (sku) id 
    FROM public.products 
    ORDER BY sku, created_at DESC
);