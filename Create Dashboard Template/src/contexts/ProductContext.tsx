import { createContext, useContext, useState, ReactNode } from 'react';

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
}

const defaultProduct: Product = {
  id: 'WS-001',
  title: 'Premium White Suit Jacket',
  description: 'Elegant white suit jacket crafted from premium cotton blend. Perfect for formal occasions, business meetings, and special events.',
  brand: 'LUXE Fashion',
  price: '$299.99',
  salePrice: '$199.99',
  category: 'Formal Wear',
  media: {
    'image_link': {
      id: 'main-1',
      name: 'Product Main Image',
      url: 'https://images.unsplash.com/photo-1749096291459-32c38f03e6df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHN1aXQlMjBqYWNrZXQlMjBwcm9kdWN0fGVufDF8fHx8MTc1ODY2MTQ3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      type: 'image',
      isFromFeed: true
    },
    'additional_image_link': {
      id: 'detail-1',
      name: 'Detail View 1',
      url: 'https://images.unsplash.com/photo-1752432133289-1c0f375819b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwcHJvZHVjdCUyMGRldGFpbCUyMGNsb3NlJTIwdXB8ZW58MXx8fHwxNzU4NzQ4NjMwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      type: 'image',
      isFromFeed: true
    },
    'additional_image_link_2': {
      id: 'texture-1',
      name: 'Fabric Texture',
      url: 'https://images.unsplash.com/photo-1684779170885-a96321b17061?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwY2xvdGhpbmclMjB0ZXh0dXJlJTIwcGF0dGVybnxlbnwxfHx8fDE3NTg3NDg0MjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      type: 'image',
      isFromFeed: true
    },
    'additional_image_link_3': {
      id: 'material-1',
      name: 'Material Close-up',
      url: 'https://images.unsplash.com/photo-1665764045207-a0f035401210?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9kdWN0JTIwdGV4dGlsZSUyMG1hdGVyaWFsfGVufDF8fHx8MTc1ODc0ODQyNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      type: 'image',
      isFromFeed: true
    },
    'brand_logo': {
      id: 'logo-1',
      name: 'Brand Logo',
      url: 'https://images.unsplash.com/photo-1758467700789-d6f49099c884?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFuZCUyMGxvZ28lMjBkZXNpZ24lMjBtb2Rlcm58ZW58MXx8fHwxNzU4Njg2ODM1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      type: 'image',
      isFromFeed: true
    },
    'manual_image_1': {
      id: 'manual-1',
      name: 'Lifestyle Image',
      url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9kdWN0fGVufDB8fHx8MTc1ODY2MTQ4NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      type: 'image',
      isFromFeed: false
    },
    'manual_image_2': {
      id: 'manual-2',
      name: 'Style Guide',
      url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYWNjZXNzb3J5fGVufDB8fHx8MTc1ODY2MTQ4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      type: 'image',
      isFromFeed: false
    },
    'category_image': {
      id: 'category-1',
      name: 'Category Banner',
      url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXRlZ29yeXxlbnwwfHx8fDE3NTg2NjE0ODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      type: 'image',
      isFromFeed: true
    }
  }
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [currentProduct, setCurrentProduct] = useState<Product>(defaultProduct);
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);

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
      removeUploadedAsset
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