import { useState, useRef } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
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
import { useCanvasStore } from "../../hooks/useCanvasStore";
import { useProduct } from "../../contexts/ProductContext";

type MenuSection = "source" | "images" | "shapes" | "text" | "layers" | null;

interface ToolbarSidebarProps {
  canvasStore: ReturnType<typeof useCanvasStore>;
}

export function ToolbarSidebar({ canvasStore }: ToolbarSidebarProps) {
  // Add error handling for useProduct
  let productContext;
  try {
    productContext = useProduct();
  } catch (error) {
    console.error('ProductProvider error:', error);
    // Fallback to prevent crash
    productContext = {
      currentProduct: {
        id: 'fallback',
        title: 'Loading...',
        description: 'Loading...',
        brand: 'Loading...',
        price: '$0.00',
        salePrice: '$0.00',
        category: 'Loading...',
        media: {}
      },
      uploadedAssets: [],
      addUploadedAsset: () => {},
      getMediaUrl: () => ''
    };
  }
  
  const { currentProduct, uploadedAssets, addUploadedAsset } = productContext;
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
    
    // Get the actual value from current product first
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
        dynamicValue = currentProduct.salePrice || '';
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
      case 'sku':
        dynamicValue = currentProduct.sku || 'WS-001';
        break;
      case 'product_url':
        dynamicValue = currentProduct.product_url || 'https://example.com/product';
        break;
      case 'condition':
        dynamicValue = currentProduct.condition || 'new';
        break;
      case 'availability':
        dynamicValue = currentProduct.availability || 'in stock';
        break;
      case 'currency':
        dynamicValue = currentProduct.currency || 'USD';
        break;
      default:
        dynamicValue = `{${fieldType}}`;
    }
    
    // Create text element with dynamic content from the start
    canvasStore.addTextElement({ x: centerX, y: centerY }, dynamicValue);
    
    // Immediately update it with dynamic properties
    requestAnimationFrame(() => {
      const selectedElement = canvasStore.getSelectedElement();
      if (selectedElement && selectedElement.type === 'text') {
        canvasStore.updateElement(selectedElement.id, { 
          isDynamic: true,
          dynamicField: fieldType,
          dynamicContent: dynamicValue,
          color: '#3b82f6', // Blue color to indicate dynamic field
          autoSize: true // Auto-size text for dynamic content
        });
      }
    });
  };

  const handleAddDynamicImage = (mediaKey: string) => {
    const centerX = canvasStore.canvasState.canvasSize.width / 2 - 100;
    const centerY = canvasStore.canvasState.canvasSize.height / 2 - 100;
    
    // Get the media URL from the product context
    const mediaUrl = productContext.getMediaUrl(mediaKey);
    
    if (mediaUrl) {
      canvasStore.addImageElement(mediaUrl, { x: centerX, y: centerY });
      
      // Update the image to be dynamic
      setTimeout(() => {
        const selectedElement = canvasStore.getSelectedElement();
        if (selectedElement && selectedElement.type === 'image') {
          canvasStore.updateElement(selectedElement.id, {
            fillType: 'dynamic',
            fillSource: mediaKey,
            fillImageUrl: mediaUrl
          });
        }
      }, 100);
    }
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

  return (
    <div className="w-80 bg-card border-r border-border h-full flex flex-col">
      {/* Menu Tabs */}
      <div className="flex border-b border-border">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`flex-1 p-3 text-xs font-medium transition-colors ${
              activeSection === item.id 
                ? 'bg-primary text-primary-foreground border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <item.icon className="w-4 h-4 mx-auto mb-1" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            {activeSection === "source" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Source Feed</h3>
                <p className="text-sm text-muted-foreground">
                  Add dynamic elements from your product data
                </p>
                
                {/* Product Images */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Product Images</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddDynamicImage('image_link')}
                      className="justify-start h-auto p-2"
                    >
                      <div className="flex items-center gap-2">
                        {productContext.getMediaUrl('image_link') ? (
                          <img 
                            src={productContext.getMediaUrl('image_link')} 
                            alt="Main product"
                            className="w-8 h-8 object-cover rounded border"
                          />
                        ) : (
                          <FileImage className="w-8 h-8" />
                        )}
                        <span className="text-xs">image_link</span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddDynamicImage('additional_image_link')}
                      className="justify-start h-auto p-2"
                    >
                      <div className="flex items-center gap-2">
                        {productContext.getMediaUrl('additional_image_link') ? (
                          <img 
                            src={productContext.getMediaUrl('additional_image_link')} 
                            alt="Additional product"
                            className="w-8 h-8 object-cover rounded border"
                          />
                        ) : (
                          <FileImage className="w-8 h-8" />
                        )}
                        <span className="text-xs">additional_image_link</span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddDynamicImage('additional_image_link_2')}
                      className="justify-start h-auto p-2"
                    >
                      <div className="flex items-center gap-2">
                        {productContext.getMediaUrl('additional_image_link_2') ? (
                          <img 
                            src={productContext.getMediaUrl('additional_image_link_2')} 
                            alt="Detail product"
                            className="w-8 h-8 object-cover rounded border"
                          />
                        ) : (
                          <FileImage className="w-8 h-8" />
                        )}
                        <span className="text-xs">additional_image_link_2</span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddDynamicImage('brand_logo')}
                      className="justify-start h-auto p-2"
                    >
                      <div className="flex items-center gap-2">
                        {productContext.getMediaUrl('brand_logo') ? (
                          <img 
                            src={productContext.getMediaUrl('brand_logo')} 
                            alt="Brand logo"
                            className="w-8 h-8 object-cover rounded border"
                          />
                        ) : (
                          <FileImage className="w-8 h-8" />
                        )}
                        <span className="text-xs">brand_logo</span>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Text Columns */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Text Columns</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddDynamicField('price')}
                      className="justify-start text-xs"
                    >
                      <Database className="w-4 h-4 mr-1" />
                      price
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddDynamicField('sale_price')}
                      className="justify-start text-xs"
                    >
                      <Database className="w-4 h-4 mr-1" />
                      sale_price
                    </Button>
                  </div>
                </div>

                {/* Main Attributes */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Main Attributes</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddDynamicField('brand')}
                      className="justify-start text-xs"
                    >
                      <Database className="w-4 h-4 mr-1" />
                      brand
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddDynamicField('title')}
                      className="justify-start text-xs"
                    >
                      <Database className="w-4 h-4 mr-1" />
                      title
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddDynamicField('category')}
                    className="justify-start w-full"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    category
                  </Button>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Description</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddDynamicField('description')}
                    className="justify-start w-full"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    description
                  </Button>
                </div>

                {/* Identifiers */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Identifiers</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddDynamicField('id')}
                    className="justify-start w-full"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    id
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddDynamicField('sku')}
                    className="justify-start w-full"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    sku
                  </Button>
                </div>

                {/* Other */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Other</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddDynamicField('product_url')}
                      className="justify-start text-xs"
                    >
                      <Database className="w-4 h-4 mr-1" />
                      link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddDynamicField('condition')}
                      className="justify-start text-xs"
                    >
                      <Database className="w-4 h-4 mr-1" />
                      condition
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddDynamicField('availability')}
                      className="justify-start text-xs"
                    >
                      <Database className="w-4 h-4 mr-1" />
                      availability
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddDynamicField('currency')}
                      className="justify-start text-xs"
                    >
                      <Database className="w-4 h-4 mr-1" />
                      currency
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "shapes" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Shapes</h3>
                <div className="grid grid-cols-2 gap-2">
                  {shapes.map((shape, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddShape(shape.type)}
                      className="flex flex-col h-16 p-2"
                    >
                      <shape.icon className="w-6 h-6 mb-1" />
                      <span className="text-xs">{shape.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "text" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Text</h3>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Text Presets</h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTextPreset('heading1')}
                      className="justify-start w-full"
                    >
                      <Type className="w-4 h-4 mr-2" />
                      Heading 1
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTextPreset('heading2')}
                      className="justify-start w-full"
                    >
                      <Type className="w-4 h-4 mr-2" />
                      Heading 2
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTextPreset('body')}
                      className="justify-start w-full"
                    >
                      <Type className="w-4 h-4 mr-2" />
                      Body Text
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddText}
                      className="justify-start w-full"
                    >
                      <Type className="w-4 h-4 mr-2" />
                      Custom Text
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "layers" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Layers</h3>
                <div className="space-y-2">
                  {canvasStore.canvasState.elements.map((element) => (
                    <div key={element.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{element.type} - {element.id.slice(0, 8)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => canvasStore.selectElement(element.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}