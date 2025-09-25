-- Update the most recent product to use the newly uploaded images
UPDATE products 
SET 
  main_image_url = '/src/assets/product-images.png',
  additional_images = ARRAY['/src/assets/product-image-3.png', '/src/assets/product-image-4.png', '/src/assets/product-image-5.png']
WHERE id = 'ff360278-ba8d-4735-8f80-dd321987638f';