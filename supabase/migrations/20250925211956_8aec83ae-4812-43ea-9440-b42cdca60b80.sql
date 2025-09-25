-- Update sample products to be owned by the authenticated user
UPDATE public.products 
SET user_id = 'a49e7ad8-9555-493e-bee3-c2fdc2e52319'::uuid
WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid;