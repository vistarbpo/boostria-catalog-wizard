import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductMedia {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  isFromFeed: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  brand: string;
  price: string;
  salePrice?: string;
  category: string;
  media: Record<string, ProductMedia>;
  sku: string;
  product_url?: string;
  condition: string;
  availability: string;
  currency: string;
}

export interface UploadedAsset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'svg';
  file: File;
  uploadedAt: Date;
}

interface ProductContextType {
  currentProduct: Product;
  setCurrentProduct: (product: Product) => void;
  getMediaUrl: (mediaKey: string) => string;
  uploadedAssets: UploadedAsset[];
  addUploadedAsset: (asset: UploadedAsset) => void;
  removeUploadedAsset: (assetId: string) => void;
  loading: boolean;
}

const defaultProduct: Product = {
  id: 'loading',
  title: 'Loading...',
  description: 'Loading product data...',
  brand: 'Loading...',
  price: '$0.00',
  salePrice: '$0.00',
  category: 'Loading...',
  sku: 'LOADING',
  product_url: '',
  condition: 'new',
  availability: 'in stock', 
  currency: 'USD',
  media: {}
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [currentProduct, setCurrentProduct] = useState<Product>(defaultProduct);
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching product:', error);
          return;
        }

        if (data) {
          // Convert database product to our Product interface
          const product: Product = {
            id: data.id,
            title: data.title || 'Untitled Product',
            description: data.description || '',
            brand: data.brand || '',
            price: data.price ? `$${data.price}` : '$0.00',
            salePrice: data.sale_price ? `$${data.sale_price}` : undefined,
            category: data.category || '',
            sku: data.sku || '',
            product_url: data.product_url || '',
            condition: data.condition || 'new',
            availability: data.availability || 'in stock',
            currency: data.currency || 'USD',
            media: {
              'image_link': {
                id: 'main-image',
                name: 'Main Image',
                url: data.main_image_url || '/src/assets/product-images.png',
                type: 'image',
                isFromFeed: true
              },
              'additional_image_link': {
                id: 'additional-1',
                name: 'Additional Image 1',
                url: data.additional_images?.[0] || '/src/assets/product-image-3.png',
                type: 'image',
                isFromFeed: true
              },
              'additional_image_link_2': {
                id: 'additional-2', 
                name: 'Additional Image 2',
                url: data.additional_images?.[1] || '/src/assets/product-image-4.png',
                type: 'image',
                isFromFeed: true
              },
              'brand_logo': {
                id: 'brand-logo',
                name: 'Brand Logo',
                url: data.additional_images?.[2] || '/src/assets/product-image-5.png',
                type: 'image',
                isFromFeed: true
              }
            }
          };

          setCurrentProduct(product);
        }
      } catch (error) {
        console.error('Error fetching latest product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProduct();
  }, []);

  const getMediaUrl = (mediaKey: string): string => {
    const media = currentProduct.media[mediaKey];
    return media?.url || '';
  };

  const addUploadedAsset = (asset: UploadedAsset) => {
    setUploadedAssets(prev => [...prev, asset]);
  };

  const removeUploadedAsset = (assetId: string) => {
    setUploadedAssets(prev => prev.filter(asset => asset.id !== assetId));
  };

  return (
    <ProductContext.Provider value={{
      currentProduct,
      setCurrentProduct,
      getMediaUrl,
      uploadedAssets,
      addUploadedAsset,
      removeUploadedAsset,
      loading
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
}