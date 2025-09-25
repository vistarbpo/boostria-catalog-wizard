-- Fix the function volatility to allow INSERT operations
CREATE OR REPLACE FUNCTION public.create_sample_products_for_user(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 VOLATILE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    catalog_1_id UUID := gen_random_uuid();
    catalog_2_id UUID := gen_random_uuid();
    catalog_3_id UUID := gen_random_uuid();
    catalog_4_id UUID := gen_random_uuid();
BEGIN
    -- Insert 4 sample catalogs/products with valid enum values
    INSERT INTO public.catalogs (id, user_id, name, source, status, product_count, meta_feed_url, google_feed_url, tiktok_feed_url, snapchat_feed_url, created_at, updated_at) VALUES
    (catalog_1_id, p_user_id, 'Premium Electronics Catalog', 'shopify', 'active', 25, 
     'https://example.com/feeds/electronics-meta.xml', 
     'https://example.com/feeds/electronics-google.xml',
     'https://example.com/feeds/electronics-tiktok.xml',
     'https://example.com/feeds/electronics-snapchat.xml',
     now(), now()),
    
    (catalog_2_id, p_user_id, 'Fashion & Apparel Collection', 'woocommerce', 'active', 45,
     'https://example.com/feeds/fashion-meta.xml',
     'https://example.com/feeds/fashion-google.xml', 
     'https://example.com/feeds/fashion-tiktok.xml',
     'https://example.com/feeds/fashion-snapchat.xml',
     now(), now()),
    
    (catalog_3_id, p_user_id, 'Home & Garden Essentials', 'salla', 'active', 32,
     'https://example.com/feeds/home-meta.xml',
     'https://example.com/feeds/home-google.xml',
     'https://example.com/feeds/home-tiktok.xml', 
     'https://example.com/feeds/home-snapchat.xml',
     now(), now()),
    
    (catalog_4_id, p_user_id, 'Sports & Fitness Gear', 'zid', 'in_sync', 18,
     'https://example.com/feeds/sports-meta.xml',
     'https://example.com/feeds/sports-google.xml',
     'https://example.com/feeds/sports-tiktok.xml',
     'https://example.com/feeds/sports-snapchat.xml', 
     now(), now());

    -- Insert sample media for each catalog with high-quality product photos
    INSERT INTO public.media (catalog_id, type, url, created_at) VALUES
    -- Electronics catalog images
    (catalog_1_id, 'image', 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&h=600&fit=crop&auto=format', now()),
    (catalog_1_id, 'image', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=600&fit=crop&auto=format', now()),
    (catalog_1_id, 'image', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop&auto=format', now()),
    
    -- Fashion catalog images
    (catalog_2_id, 'image', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&auto=format', now()),
    (catalog_2_id, 'image', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop&auto=format', now()),
    (catalog_2_id, 'image', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=600&fit=crop&auto=format', now()),
    
    -- Home & Garden catalog images
    (catalog_3_id, 'image', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&auto=format', now()),
    (catalog_3_id, 'image', 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&h=600&fit=crop&auto=format', now()),
    (catalog_3_id, 'image', 'https://images.unsplash.com/photo-1493663284031-b7e3aaa4cab7?w=800&h=600&fit=crop&auto=format', now()),
    
    -- Sports & Fitness catalog images
    (catalog_4_id, 'image', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format', now()),
    (catalog_4_id, 'image', 'https://images.unsplash.com/photo-1434754205268-ad3b5f549b11?w=800&h=600&fit=crop&auto=format', now()),
    (catalog_4_id, 'image', 'https://images.unsplash.com/photo-1594736797933-d0601ba2fe65?w=800&h=600&fit=crop&auto=format', now());
END;
$function$;

-- Also fix the main function
CREATE OR REPLACE FUNCTION public.create_my_sample_products()
 RETURNS text
 LANGUAGE plpgsql
 VOLATILE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Check if user is authenticated
    IF auth.uid() IS NULL THEN
        RETURN 'Error: User must be authenticated to create sample data';
    END IF;
    
    -- Check if user already has catalogs to avoid duplicates
    IF EXISTS (SELECT 1 FROM public.catalogs WHERE user_id = auth.uid()) THEN
        RETURN 'Sample data already exists for this user';
    END IF;
    
    -- Create sample products for the current user
    PERFORM create_sample_products_for_user(auth.uid());
    
    RETURN 'Successfully created 4 sample products with media';
END;
$function$;