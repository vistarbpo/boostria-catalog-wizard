import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { 
  Database,
  Image,
  Shapes,
  Type,
  Layers,
  Upload,
  Search,
  Circle, 
  Square, 
  Triangle, 
  Star, 
  Heart, 
  Diamond,
  Plus,
  GripVertical,
  Eye,
  EyeOff,
  X,
  FileImage,
  Hexagon,
  Pentagon,
  Settings,
  MessageCircle,
  MessageSquare,
  Shield,
  Flag,
  ArrowRight,
  Flower,
  RectangleHorizontal
} from "lucide-react";
import { useCanvasStore } from "../hooks/useCanvasStore";
import { useProduct } from "../contexts/ProductContext";

type MenuSection = "source" | "images" | "shapes" | "text" | "layers" | null;

interface LeftSidebarProps {
  canvasStore: ReturnType<typeof useCanvasStore>;
}

export function LeftSidebar({ canvasStore }: LeftSidebarProps) {
  const { currentProduct, uploadedAssets, addUploadedAsset } = useProduct();
  const [activeSection, setActiveSection] = useState<MenuSection>("source");
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const svgUploadRef = useRef<HTMLInputElement>(null);
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({
    'layer-1': true,
    'layer-2': true,
    'layer-3': true,
    'layer-4': true,
    'layer-5': true,
    'layer-6': true,
    'layer-7': true,
    'layer-8': true,
    'layer-9': true,
    'layer-10': true,
    'layer-11': true,
    'layer-12': true,
  });

  const menuItems = [
    { id: "source" as const, icon: Database, label: "Source Feed" },
    { id: "images" as const, icon: Image, label: "Images" },
    { id: "shapes" as const, icon: Shapes, label: "Shapes" },
    { id: "text" as const, icon: Type, label: "Text" },
    { id: "layers" as const, icon: Layers, label: "Layers" },
  ];

  const shapes = [
    { icon: RectangleHorizontal, name: "Oval", type: "circle" as const },
    { icon: Square, name: "Rectangle", type: "rectangle" as const },
    { icon: Square, name: "Rounded Rect", type: "rectangle" as const, rounded: true },
    { icon: Circle, name: "Circle", type: "circle" as const },
    { icon: Triangle, name: "Triangle", type: "triangle" as const },
    { icon: Pentagon, name: "Pentagon", type: "polygon" as const },
    { icon: Hexagon, name: "Hexagon", type: "polygon" as const },
    { icon: Circle, name: "Filled Circle", type: "circle" as const, filled: true },
    { icon: Star, name: "Star", type: "star" as const },
    { icon: Star, name: "Star 6", type: "star" as const, variant: "6-point" },
    { icon: Plus, name: "Cross", type: "polygon" as const },
    { icon: Settings, name: "Gear", type: "polygon" as const },
    { icon: Flower, name: "Flower", type: "polygon" as const },
    { icon: Circle, name: "Scalloped", type: "circle" as const, scalloped: true },
    { icon: Heart, name: "Heart", type: "heart" as const },
    { icon: MessageCircle, name: "Speech", type: "polygon" as const },
    { icon: MessageSquare, name: "Message", type: "rectangle" as const },
    { icon: Shield, name: "Shield", type: "polygon" as const },
    { icon: Flag, name: "Flag", type: "polygon" as const },
    { icon: ArrowRight, name: "Arrow", type: "polygon" as const }
  ];

  const handleAddShape = (shapeType: "rectangle" | "circle" | "triangle" | "star" | "heart" | "polygon") => {
    const centerX = canvasStore.canvasState.canvasSize.width / 2 - 60;
    const centerY = canvasStore.canvasState.canvasSize.height / 2 - 40;
    canvasStore.addShapeElement(shapeType, { x: centerX, y: centerY });
  };

  const handleAddText = () => {
    const centerX = canvasStore.canvasState.canvasSize.width / 2 - 100;
    const centerY = canvasStore.canvasState.canvasSize.height / 2 - 25;
    canvasStore.addTextElement({ x: centerX, y: centerY });
  };

  const handleAddDynamicField = (fieldType: string) => {
    const centerX = canvasStore.canvasState.canvasSize.width / 2 - 100;
    const centerY = canvasStore.canvasState.canvasSize.height / 2 - 25;
    canvasStore.addTextElement({ x: centerX, y: centerY });
    
    // Update the text content to show it's dynamic
    setTimeout(() => {
      const selectedElement = canvasStore.getSelectedElement();
      if (selectedElement && selectedElement.type === 'text') {
        // Get the actual value from current product
        let dynamicValue = '';
        switch (fieldType) {
          case 'title':
            dynamicValue = currentProduct.title;
            break;
          case 'description':
            dynamicValue = currentProduct.description;
            break;
          case 'price':
            dynamicValue = currentProduct.price;
            break;
          case 'sale_price':
            dynamicValue = currentProduct.salePrice;
            break;
          case 'brand':
            dynamicValue = currentProduct.brand;
            break;
          case 'category':
            dynamicValue = currentProduct.category;
            break;
          case 'id':
            dynamicValue = currentProduct.id;
            break;
          default:
            dynamicValue = `{${fieldType}}`;
        }
        
        canvasStore.updateElement(selectedElement.id, { 
          content: `{${fieldType}}`,
          isDynamic: true,
          dynamicField: fieldType,
          dynamicContent: dynamicValue,
          color: '#3b82f6', // Blue color to indicate dynamic field
          autoSize: true // Auto-size text for dynamic content
        });
      }
    }, 100);
  };

  const handleAddTextPreset = (preset: string) => {
    const centerX = canvasStore.canvasState.canvasSize.width / 2 - 100;
    const centerY = canvasStore.canvasState.canvasSize.height / 2 - 25;
    canvasStore.addTextElement({ x: centerX, y: centerY });
    
    // Update the text properties based on preset
    setTimeout(() => {
      const selectedElement = canvasStore.getSelectedElement();
      if (selectedElement && selectedElement.type === 'text') {
        let updates: Partial<any> = {};
        
        switch (preset) {
          case 'heading1':
            updates = { 
              content: 'Heading 1',
              fontSize: 48,
              fontWeight: 'Bold'
            };
            break;
          case 'heading2':
            updates = { 
              content: 'Heading 2',
              fontSize: 32,
              fontWeight: 'Bold'
            };
            break;
          case 'heading3':
            updates = { 
              content: 'Heading 3',
              fontSize: 24,
              fontWeight: 'Medium'
            };
            break;
          case 'body':
            updates = { 
              content: 'Body text paragraph',
              fontSize: 16,
              fontWeight: 'Regular'
            };
            break;
          case 'caption':
            updates = { 
              content: 'Caption text',
              fontSize: 12,
              fontWeight: 'Regular'
            };
            break;
          case 'button':
            updates = { 
              content: 'Button Text',
              fontSize: 14,
              fontWeight: 'Medium'
            };
            break;
          default:
            updates = { content: 'Text' };
        }
        
        canvasStore.updateElement(selectedElement.id, updates);
      }
    }, 100);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        const asset: UploadedAsset = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          url,
          type: 'image',
          file,
          uploadedAt: new Date()
        };
        addUploadedAsset(asset);
      }
    });
    
    // Reset input
    if (imageUploadRef.current) {
      imageUploadRef.current.value = '';
    }
  };

  const handleSVGUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const svgContent = e.target?.result as string;
          const url = URL.createObjectURL(file);
          const asset: UploadedAsset = {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            url,
            type: 'svg',
            file,
            uploadedAt: new Date()
          };
          addUploadedAsset(asset);
        };
        reader.readAsText(file);
      }
    });
    
    // Reset input
    if (svgUploadRef.current) {
      svgUploadRef.current.value = '';
    }
  };

  const handleAddUploadedImage = (asset: UploadedAsset) => {
    const centerX = canvasStore.canvasState.canvasSize.width / 2 - 100;
    const centerY = canvasStore.canvasState.canvasSize.height / 2 - 100;
    canvasStore.addImageElement(asset.url, { x: centerX, y: centerY });
  };

  const handleAddUploadedSVG = (asset: UploadedAsset) => {
    if (asset.type === 'svg') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const svgContent = e.target?.result as string;
        const centerX = canvasStore.canvasState.canvasSize.width / 2 - 60;
        const centerY = canvasStore.canvasState.canvasSize.height / 2 - 60;
        canvasStore.addSVGElement(svgContent, { x: centerX, y: centerY });
      };
      reader.readAsText(asset.file);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "source":
        return (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border flex-shrink-0">
              <h2 className="text-lg mb-2">Source Feed</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Add dynamic elements from your source feed
              </p>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search" 
                  className="pl-10"
                />
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
                <p className="text-sm text-primary mb-1">You are using a sample feed.</p>
                <Button variant="link" className="text-primary p-0 h-auto underline">
                  Upload your own feed
                </Button>
                <span className="text-sm text-muted-foreground"> to replace it.</span>
              </div>
            </div>
            
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-4">
                {/* Images Section */}
                <div className="mb-6">
                  <div className="text-sm text-muted-foreground mb-2">Images</div>
                  <div className="w-full h-32 bg-muted rounded-lg mb-3 overflow-hidden">
                    <img 
                      src={currentProduct.media.image_link?.url} 
                      alt={currentProduct.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Media Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {Object.entries(currentProduct.media).slice(0, 4).map(([key, media]) => (
                      <div key={key} className="aspect-square bg-muted rounded overflow-hidden">
                        <img 
                          src={media.url} 
                          alt={media.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(currentProduct.media).map(([key, media]) => (
                      <div key={key} className="bg-muted/30 rounded p-2 cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="text-xs text-primary">{key}</div>
                        <div className="text-xs text-muted-foreground">
                          {media.name} {media.isFromFeed && "(Feed)"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Basic Product Info */}
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Product Information</div>
                    <div className="grid grid-cols-1 gap-2">
                      <div 
                        className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={() => handleAddDynamicField('title')}
                      >
                        <div className="text-xs text-primary">title</div>
                        <div className="text-sm">{currentProduct.title}</div>
                      </div>
                      <div 
                        className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={() => handleAddDynamicField('description')}
                      >
                        <div className="text-xs text-primary">description</div>
                        <div className="text-sm">{currentProduct.description}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div 
                          className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors"
                          onClick={() => handleAddDynamicField('brand')}
                        >
                          <div className="text-xs text-primary">brand</div>
                          <div className="text-sm">{currentProduct.brand}</div>
                        </div>
                        <div 
                          className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors"
                          onClick={() => handleAddDynamicField('id')}
                        >
                          <div className="text-xs text-primary">id</div>
                          <div className="text-sm">{currentProduct.id}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div 
                          className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors"
                          onClick={() => handleAddDynamicField('category')}
                        >
                          <div className="text-xs text-primary">category</div>
                          <div className="text-sm">{currentProduct.category}</div>
                        </div>
                        <div 
                          className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors"
                          onClick={() => handleAddDynamicField('subcategory')}
                        >
                          <div className="text-xs text-primary">subcategory</div>
                          <div className="text-sm">Formal Wear</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pricing */}
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Pricing</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div 
                        className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={() => handleAddDynamicField('price')}
                      >
                        <div className="text-xs text-primary">price</div>
                        <div className="text-sm">{currentProduct.price}</div>
                      </div>
                      <div 
                        className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={() => handleAddDynamicField('sale_price')}
                      >
                        <div className="text-xs text-primary">sale_price</div>
                        <div className="text-sm">{currentProduct.salePrice}</div>
                      </div>
                      <div 
                        className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={() => handleAddDynamicField('discount_percentage')}
                      >
                        <div className="text-xs text-primary">discount_percentage</div>
                        <div className="text-sm">30%</div>
                      </div>
                      <div 
                        className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={() => handleAddDynamicField('currency')}
                      >
                        <div className="text-xs text-primary">currency</div>
                        <div className="text-sm">USD</div>
                      </div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Product Details</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div 
                        className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={() => handleAddDynamicField('color')}
                      >
                        <div className="text-xs text-primary">color</div>
                        <div className="text-sm">White</div>
                      </div>
                      <div 
                        className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={() => handleAddDynamicField('size')}
                      >
                        <div className="text-xs text-primary">size</div>
                        <div className="text-sm">Medium</div>
                      </div>
                      <div 
                        className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={() => handleAddDynamicField('material')}
                      >
                        <div className="text-xs text-primary">material</div>
                        <div className="text-sm">Cotton Blend</div>
                      </div>
                      <div 
                        className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={() => handleAddDynamicField('weight')}
                      >
                        <div className="text-xs text-primary">weight</div>
                        <div className="text-sm">1.2 lbs</div>
                      </div>
                    </div>
                  </div>

                  {/* Inventory & SKU */}
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Inventory</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">availability</div>
                        <div className="text-sm">In Stock</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">quantity</div>
                        <div className="text-sm">25</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">sku</div>
                        <div className="text-sm">WSJ-M-001</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">gtin</div>
                        <div className="text-sm">1234567890123</div>
                      </div>
                    </div>
                  </div>

                  {/* Ratings & Reviews */}
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Reviews</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">rating</div>
                        <div className="text-sm">4.5</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">review_count</div>
                        <div className="text-sm">127</div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping */}
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Shipping</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">shipping_weight</div>
                        <div className="text-sm">1.5 lbs</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">shipping_cost</div>
                        <div className="text-sm">$5.99</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">shipping_time</div>
                        <div className="text-sm">3-5 days</div>
                      </div>
                    </div>
                  </div>

                  {/* Variants */}
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Variants</div>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">color_variants</div>
                        <div className="text-sm">White, Black, Navy</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">size_variants</div>
                        <div className="text-sm">XS, S, M, L, XL</div>
                      </div>
                    </div>
                  </div>

                  {/* SEO & Marketing */}
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">SEO & Marketing</div>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">meta_title</div>
                        <div className="text-sm">Premium White Suit Jacket - MyBrand</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">meta_description</div>
                        <div className="text-sm">Shop our premium white suit jacket...</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">keywords</div>
                        <div className="text-sm">suit, jacket, formal, white</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">tags</div>
                        <div className="text-sm">formal, business, wedding</div>
                      </div>
                    </div>
                  </div>

                  {/* Custom Fields */}
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Custom Fields</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">custom_label_0</div>
                        <div className="text-sm">Premium Quality</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">custom_label_1</div>
                        <div className="text-sm">Best Seller</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">custom_label_2</div>
                        <div className="text-sm">New Arrival</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">custom_label_3</div>
                        <div className="text-sm">Limited Edition</div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Identifiers */}
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Identifiers</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">mpn</div>
                        <div className="text-sm">WJ-2024-001</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">upc</div>
                        <div className="text-sm">123456789012</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">ean</div>
                        <div className="text-sm">1234567890123</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">isbn</div>
                        <div className="text-sm">N/A</div>
                      </div>
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Dimensions</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">length</div>
                        <div className="text-sm">28 in</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">width</div>
                        <div className="text-sm">20 in</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">height</div>
                        <div className="text-sm">2 in</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="text-xs text-primary">volume</div>
                        <div className="text-sm">1120 cu in</div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        );
        
      case "images":
        return (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg mb-2">IMAGE ASSETS</h2>
              <div className="flex gap-2 mb-4">
                <Button variant="default" size="sm" className="flex-1">All</Button>
                <Button variant="ghost" size="sm" className="flex-1">Tags</Button>
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search" 
                  className="pl-10"
                />
              </div>
              <input
                ref={imageUploadRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button 
                className="w-full gap-2"
                onClick={() => imageUploadRef.current?.click()}
              >
                <Upload className="w-4 h-4" />
                Upload Images
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-4">
                {/* Uploaded Images */}
                {uploadedAssets.filter(asset => asset.type === 'image').length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm text-muted-foreground mb-2">Uploaded Images</h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {uploadedAssets
                        .filter(asset => asset.type === 'image')
                        .map((asset) => (
                          <div 
                            key={asset.id} 
                            className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                            onClick={() => handleAddUploadedImage(asset)}
                          >
                            <img 
                              src={asset.url} 
                              alt={asset.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Stock Images */}
                <div>
                  <h3 className="text-sm text-muted-foreground mb-2">Stock Images</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="aspect-square bg-red-600 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                      <img 
                        src="https://images.unsplash.com/photo-1675555261978-74dd7e9c0c01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjBzYWxlJTIwYmFubmVyfGVufDF8fHx8MTc1ODY2MTQ4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
                        alt="Sale banner"
                        className="w-full h-full object-cover"
                        onClick={() => canvasStore.addImageElement("https://images.unsplash.com/photo-1675555261978-74dd7e9c0c01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjBzYWxlJTIwYmFubmVyfGVufDF8fHx8MTc1ODY2MTQ4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", { x: canvasStore.canvasState.canvasSize.width / 2 - 100, y: canvasStore.canvasState.canvasSize.height / 2 - 100 })}
                      />
                    </div>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="aspect-square bg-muted rounded-lg"></div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        );
        
      case "shapes":
        return (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg mb-2">Shapes</h2>
              <p className="text-sm text-muted-foreground mb-4">
                All geometric shapes + upload svg shapes. Color changeable or fill with dynamic images.
              </p>
              <input
                ref={svgUploadRef}
                type="file"
                accept=".svg,image/svg+xml"
                multiple
                onChange={handleSVGUpload}
                className="hidden"
              />
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => svgUploadRef.current?.click()}
              >
                <Upload className="w-4 h-4" />
                Upload SVG File
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-4">
                {/* Uploaded SVGs */}
                {uploadedAssets.filter(asset => asset.type === 'svg').length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm text-muted-foreground mb-2">Uploaded SVGs</h3>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {uploadedAssets
                        .filter(asset => asset.type === 'svg')
                        .map((asset) => (
                          <Button
                            key={asset.id}
                            variant="ghost"
                            size="sm"
                            className="h-14 flex flex-col gap-1 p-2 hover:bg-accent transition-colors"
                            onClick={() => handleAddUploadedSVG(asset)}
                          >
                            <div className="w-6 h-6 flex items-center justify-center">
                              <img src={asset.url} alt={asset.name} className="w-full h-full object-contain" />
                            </div>
                            <span className="text-xs leading-tight text-center truncate w-full">{asset.name.replace('.svg', '')}</span>
                          </Button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Built-in Shapes */}
                <div>
                  <h3 className="text-sm text-muted-foreground mb-2">Basic Shapes</h3>
                  <div className="grid grid-cols-3 gap-2">
                  {shapes.map((shape, index) => (
                    <Button
                      key={`${shape.name}-${index}`}
                      variant="ghost"
                      size="sm"
                      className="h-14 flex flex-col gap-1 p-2 hover:bg-accent transition-colors"
                      onClick={() => handleAddShape(shape.type)}
                    >
                      <div className="flex items-center justify-center w-6 h-6">
                        {shape.rounded ? (
                          <div className="w-5 h-4 border-2 border-current rounded-md"></div>
                        ) : shape.filled ? (
                          <div className="w-5 h-5 bg-current rounded-full"></div>
                        ) : shape.scalloped ? (
                          <div className="w-5 h-5 border-2 border-current rounded-full border-dashed"></div>
                        ) : shape.variant === "6-point" ? (
                          <div className="relative w-5 h-5">
                            <Star className="w-5 h-5 absolute" />
                            <div className="absolute inset-0 rotate-30">
                              <Star className="w-5 h-5" />
                            </div>
                          </div>
                        ) : (
                          <shape.icon className="w-5 h-5" />
                        )}
                      </div>
                      <span className="text-xs leading-tight text-center">{shape.name}</span>
                    </Button>
                  ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        );
        
      case "text":
        return (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg mb-2">Text</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Add and customize text elements
              </p>
              <Button className="w-full gap-2" onClick={handleAddText}>
                <Plus className="w-4 h-4" />
                Add Text
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-4">
                <div className="space-y-3">
                  <div 
                    className="p-3 border border-border rounded-lg cursor-pointer hover:bg-accent"
                    onClick={() => handleAddTextPreset('heading1')}
                  >
                    <div className="text-lg font-medium mb-1">Heading 1</div>
                    <div className="text-xs text-muted-foreground">Large title text (48px)</div>
                  </div>
                  <div 
                    className="p-3 border border-border rounded-lg cursor-pointer hover:bg-accent"
                    onClick={() => handleAddTextPreset('heading2')}
                  >
                    <div className="text-base font-medium mb-1">Heading 2</div>
                    <div className="text-xs text-muted-foreground">Subtitle text (32px)</div>
                  </div>
                  <div 
                    className="p-3 border border-border rounded-lg cursor-pointer hover:bg-accent"
                    onClick={() => handleAddTextPreset('heading3')}
                  >
                    <div className="text-sm font-medium mb-1">Heading 3</div>
                    <div className="text-xs text-muted-foreground">Section heading (24px)</div>
                  </div>
                  <div 
                    className="p-3 border border-border rounded-lg cursor-pointer hover:bg-accent"
                    onClick={() => handleAddTextPreset('body')}
                  >
                    <div className="text-sm mb-1">Body Text</div>
                    <div className="text-xs text-muted-foreground">Paragraph text (16px)</div>
                  </div>
                  <div 
                    className="p-3 border border-border rounded-lg cursor-pointer hover:bg-accent"
                    onClick={() => handleAddTextPreset('caption')}
                  >
                    <div className="text-xs mb-1">Caption</div>
                    <div className="text-xs text-muted-foreground">Small text (12px)</div>
                  </div>
                  <div 
                    className="p-3 border border-border rounded-lg cursor-pointer hover:bg-accent"
                    onClick={() => handleAddTextPreset('button')}
                  >
                    <div className="text-sm font-medium mb-1">Button Text</div>
                    <div className="text-xs text-muted-foreground">Call-to-action text (14px)</div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        );
        
      case "layers":
        const layerData = canvasStore.canvasState.elements
          .sort((a, b) => b.zIndex - a.zIndex) // Sort by z-index, highest first
          .map(element => {
            let icon = Type;
            let color = 'bg-blue-500';
            let name = 'Untitled';

            switch (element.type) {
              case 'text':
                icon = Type;
                color = 'bg-blue-500';
                name = element.content.length > 20 
                  ? element.content.substring(0, 20) + '...' 
                  : element.content;
                break;
              case 'shape':
                icon = Shapes;
                color = 'bg-purple-500';
                name = element.shapeType.charAt(0).toUpperCase() + element.shapeType.slice(1);
                break;
              case 'image':
                icon = FileImage;
                color = 'bg-orange-500';
                name = 'Image';
                break;
            }

            return {
              id: element.id,
              name,
              type: element.type,
              icon,
              color,
              visible: element.visible
            };
          });

        const toggleLayerVisibility = (elementId: string) => {
          const element = canvasStore.canvasState.elements.find(el => el.id === elementId);
          if (element) {
            canvasStore.updateElement(elementId, { visible: !element.visible });
          }
        };

        const deleteLayer = (elementId: string) => {
          canvasStore.deleteElement(elementId);
        };

        const selectLayer = (elementId: string) => {
          canvasStore.selectElement(elementId);
        };

        return (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg mb-2">Feed Based Canvas</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your design layers
              </p>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2">
                <div className="space-y-1">
                  {layerData.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      No elements on canvas.<br />
                      Add shapes, text, or images to get started.
                    </div>
                  ) : (
                    layerData.map((layer, index) => (
                      <div 
                        key={layer.id}
                        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                          canvasStore.canvasState.selectedElementIds.includes(layer.id) ? 'bg-accent' : 'hover:bg-accent/50'
                        }`}
                        onClick={() => selectLayer(layer.id)}
                      >
                        {/* Drag Handle */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-6 h-6 p-0 cursor-grab hover:cursor-grabbing text-muted-foreground hover:text-foreground"
                        >
                          <GripVertical className="w-3 h-3" />
                        </Button>

                        {/* Layer Icon */}
                        <div className={`w-6 h-6 rounded flex items-center justify-center ${layer.color}`}>
                          <layer.icon className="w-3 h-3 text-white" />
                        </div>

                        {/* Layer Name */}
                        <span className="flex-1 text-sm truncate">
                          {layer.name}
                        </span>

                        {/* Visibility Toggle */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-6 h-6 p-0 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLayerVisibility(layer.id);
                          }}
                        >
                          {layer.visible ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                        </Button>

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-6 h-6 p-0 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteLayer(layer.id);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full">
      {/* Narrow Icon Menu */}
      <div className="w-16 bg-muted border-r border-border flex flex-col items-center py-4">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            onClick={() => setActiveSection(activeSection === item.id ? null : item.id)}
            className={`w-12 h-12 mb-2 p-0 ${
              activeSection === item.id 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <item.icon className="w-5 h-5" />
          </Button>
        ))}
      </div>

      {/* Expandable Content Panel */}
      {activeSection && (
        <div className="w-80 bg-card border-r border-border">
          {renderContent()}
        </div>
      )}
    </div>
  );
}