-- Insert sample catalog/product data for any authenticated user
-- This function will create sample data for the current user
CREATE OR REPLACE FUNCTION create_sample_products_for_user(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    catalog_1_id UUID := gen_random_uuid();
    catalog_2_id UUID := gen_random_uuid();
    catalog_3_id UUID := gen_random_uuid();
    catalog_4_id UUID := gen_random_uuid();
BEGIN
    -- Insert 4 sample catalogs/products
    INSERT INTO public.catalogs (id, user_id, name, source, status, product_count, meta_feed_url, google_feed_url, tiktok_feed_url, snapchat_feed_url, created_at, updated_at) VALUES
    (catalog_1_id, p_user_id, 'Premium Electronics Catalog', 'manual', 'active', 25, 
     'https://example.com/feeds/electronics-meta.xml', 
     'https://example.com/feeds/electronics-google.xml',
     'https://example.com/feeds/electronics-tiktok.xml',
     'https://example.com/feeds/electronics-snapchat.xml',
     now(), now()),
    
    (catalog_2_id, p_user_id, 'Fashion & Apparel Collection', 'shopify', 'active', 45,
     'https://example.com/feeds/fashion-meta.xml',
     'https://example.com/feeds/fashion-google.xml', 
     'https://example.com/feeds/fashion-tiktok.xml',
     'https://example.com/feeds/fashion-snapchat.xml',
     now(), now()),
    
    (catalog_3_id, p_user_id, 'Home & Garden Essentials', 'woocommerce', 'active', 32,
     'https://example.com/feeds/home-meta.xml',
     'https://example.com/feeds/home-google.xml',
     'https://example.com/feeds/home-tiktok.xml', 
     'https://example.com/feeds/home-snapchat.xml',
     now(), now()),
    
    (catalog_4_id, p_user_id, 'Sports & Fitness Gear', 'bigcommerce', 'draft', 18,
     'https://example.com/feeds/sports-meta.xml',
     'https://example.com/feeds/sports-google.xml',
     'https://example.com/feeds/sports-tiktok.xml',
     'https://example.com/feeds/sports-snapchat.xml', 
     now(), now());

    -- Insert sample media for each catalog
    -- Electronics Catalog Media
    INSERT INTO public.media (catalog_id, type, url, created_at) VALUES
    (catalog_1_id, 'image', 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800', now()),
    (catalog_1_id, 'image', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800', now()),
    (catalog_1_id, 'image', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', now()),
    
    -- Fashion Catalog Media  
    (catalog_2_id, 'image', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800', now()),
    (catalog_2_id, 'image', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800', now()),
    (catalog_2_id, 'image', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800', now()),
    
    -- Home & Garden Media
    (catalog_3_id, 'image', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', now()),
    (catalog_3_id, 'image', 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800', now()),
    (catalog_3_id, 'image', 'https://images.unsplash.com/photo-1493663284031-b7e3aaa4cab7?w=800', now()),
    
    -- Sports & Fitness Media
    (catalog_4_id, 'image', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', now()),
    (catalog_4_id, 'image', 'https://images.unsplash.com/photo-1434754205268-ad3b5f549b11?w=800', now()),
    (catalog_4_id, 'image', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', now());

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a helper function that users can call to populate sample data
CREATE OR REPLACE FUNCTION public.create_my_sample_products()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_my_sample_products() TO authenticated;
GRANT EXECUTE ON FUNCTION create_sample_products_for_user(UUID) TO service_role;