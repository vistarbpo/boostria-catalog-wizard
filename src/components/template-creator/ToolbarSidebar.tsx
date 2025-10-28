import { useState, useRef, useEffect } from "react";
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
  RectangleHorizontal,
  ArrowUp,
  ArrowDown,
  Lock,
  Unlock,
  Copy,
  Package,
  QrCode,
  Barcode,
  BadgePercent,
  Tag
} from "lucide-react";
import { useCanvasStore } from "../../hooks/useCanvasStore";
import { useProduct } from "../../contexts/ProductContext";
import { useWidgets } from "../../hooks/useWidgets";
import { toast } from "sonner";
import { createRatingWidget } from "./widgets/RatingWidget";
import { createPriceWidget, priceWidgetPresets } from "./widgets/PriceWidget";

type MenuSection = "source" | "images" | "shapes" | "text" | "layers" | "widgets" | null;

interface ToolbarSidebarProps {
  canvasStore: ReturnType<typeof useCanvasStore>;
}

export function ToolbarSidebar({ canvasStore }: ToolbarSidebarProps) {
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [dragOverElement, setDragOverElement] = useState<string | null>(null);

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
  const { widgets, addWidget, deleteWidget } = useWidgets();
  
  // Debug log
  useEffect(() => {
    console.log('ToolbarSidebar - Current widgets:', widgets);
    console.log('ToolbarSidebar - Widgets from localStorage:', localStorage.getItem('canvas_widgets'));
  }, [widgets]);
  
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
    { id: "widgets" as const, icon: Package, label: "Widgets" },
  ];

  const shapes = [
    { icon: Circle, name: "Circle", type: "circle" as const },
    { icon: Square, name: "Rectangle", type: "rectangle" as const },
    { icon: Triangle, name: "Triangle", type: "triangle" as const },
    { icon: Star, name: "Star", type: "star" as const },
    { icon: Heart, name: "Heart", type: "heart" as const },
    { icon: Plus, name: "Plus", type: "plus" as const },
    { icon: ArrowRight, name: "Arrow", type: "arrow" as const },
    { icon: Diamond, name: "Diamond", type: "diamond" as const },
    { icon: RectangleHorizontal, name: "Line", type: "line" as const }
  ];

  const handleAddShape = (shapeType: "rectangle" | "circle" | "triangle" | "star" | "heart" | "plus" | "arrow" | "diamond" | "line") => {
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
    const canvasWidth = canvasStore.canvasState.canvasSize.width;
    const canvasHeight = canvasStore.canvasState.canvasSize.height;
    
    // Calculate 80% width for title and description
    const textWidth = Math.round(canvasWidth * 0.8);
    const centerX = (canvasWidth - textWidth) / 2;
    const centerY = canvasHeight / 2 - 25;
    
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
    
    // Clear selection first to keep existing elements
    canvasStore.clearSelection();
    
    // Prepare initial properties based on field type
    const textOverrides: any = {
      isDynamic: true,
      dynamicField: fieldType,
      dynamicContent: dynamicValue,
      color: '#000000'
    };
    
    // Set specific properties for title
    if (fieldType === 'title') {
      textOverrides.fontSize = 44;
      textOverrides.fontWeight = '700';
      textOverrides.size = { width: textWidth, height: 100 };
      textOverrides.textWrapping = true;
      textOverrides.autoSize = false;
    }
    
    // Set specific properties for description
    if (fieldType === 'description') {
      textOverrides.size = { width: textWidth, height: 200 };
      textOverrides.textWrapping = true;
      textOverrides.autoSize = true;
    }
    
    // Create text element with all properties from the start
    canvasStore.addTextElement({ x: centerX, y: centerY }, dynamicValue, textOverrides);
  };

  const handleAddDynamicImage = (mediaKey: string) => {
    // Get the media URL from the product context
    const mediaUrl = productContext.getMediaUrl(mediaKey);
    
    if (mediaUrl) {
      // Pass dynamic properties directly to addImageElement
      canvasStore.addImageElement(mediaUrl, undefined, {
        fillType: 'dynamic',
        fillSource: mediaKey,
        fillImageUrl: mediaUrl
      });
    }
  };

  const handleMoveLayerUp = (elementId: string) => {
    canvasStore.bringForward();
  };

  const handleMoveLayerDown = (elementId: string) => {
    canvasStore.sendBackward();
  };

  const handleDragStart = (e: React.DragEvent, elementId: string) => {
    setDraggedElement(elementId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, elementId: string) => {
    e.preventDefault();
    if (draggedElement && draggedElement !== elementId) {
      setDragOverElement(elementId);
    }
  };

  const handleDragEnd = () => {
    if (draggedElement && dragOverElement && draggedElement !== dragOverElement) {
      const draggedEl = canvasStore.canvasState.elements.find(el => el.id === draggedElement);
      const targetEl = canvasStore.canvasState.elements.find(el => el.id === dragOverElement);
      
      if (draggedEl && targetEl) {
        // Swap z-indices
        const draggedZIndex = draggedEl.zIndex;
        const targetZIndex = targetEl.zIndex;
        
        canvasStore.updateElement(draggedElement, { zIndex: targetZIndex });
        canvasStore.updateElement(dragOverElement, { zIndex: draggedZIndex });
        
        toast.success('Layer order updated');
      }
    }
    
    setDraggedElement(null);
    setDragOverElement(null);
  };

  const handleDragLeave = () => {
    setDragOverElement(null);
  };

  const handleDuplicateSelected = () => {
    const selectedElements = canvasStore.getSelectedElements();
    selectedElements.forEach((element) => {
      const newElement = {
        ...element,
        id: Math.random().toString(36).substr(2, 9),
        position: {
          x: element.position.x + 20,
          y: element.position.y + 20
        },
        zIndex: Math.max(...canvasStore.canvasState.elements.map(el => el.zIndex)) + 1
      };
      
      // Add the duplicated element to canvas
      if (element.type === 'text') {
        canvasStore.addTextElement(newElement.position, (element as any).content);
        setTimeout(() => {
          const addedElement = canvasStore.getSelectedElement();
          if (addedElement) {
            canvasStore.updateElement(addedElement.id, {
              ...newElement,
              id: addedElement.id
            });
          }
        }, 100);
      } else if (element.type === 'shape') {
        canvasStore.addShapeElement((element as any).shapeType, newElement.position);
        setTimeout(() => {
          const addedElement = canvasStore.getSelectedElement();
          if (addedElement) {
            canvasStore.updateElement(addedElement.id, {
              ...newElement,
              id: addedElement.id
            });
          }
        }, 100);
      } else if (element.type === 'image') {
        canvasStore.addImageElement((element as any).src, newElement.position);
        setTimeout(() => {
          const addedElement = canvasStore.getSelectedElement();
          if (addedElement) {
            canvasStore.updateElement(addedElement.id, {
              ...newElement,
              id: addedElement.id
            });
          }
        }, 100);
      }
    });
  };

  const handleAddTextPreset = (preset: string) => {
    // Clear selection first to avoid affecting previous text
    canvasStore.clearSelection();
    
    const canvasWidth = canvasStore.canvasState.canvasSize.width;
    const textWidth = canvasWidth * 0.6; // 60% width (20% padding on each side)
    const centerX = canvasWidth * 0.2; // Start at 20% from left
    const centerY = canvasStore.canvasState.canvasSize.height / 2 - 50;
    
    let presetConfig: Partial<any> = {};
    
    switch (preset) {
      case 'heading1':
        presetConfig = { 
          content: 'Heading 1',
          fontSize: 64,
          fontWeight: 'Bold',
          width: textWidth
        };
        break;
      case 'heading2':
        presetConfig = { 
          content: 'Heading 2',
          fontSize: 48,
          fontWeight: '600',
          width: textWidth
        };
        break;
      case 'heading3':
        presetConfig = { 
          content: 'Heading 3',
          fontSize: 36,
          fontWeight: '600',
          width: textWidth
        };
        break;
      case 'subheading':
        presetConfig = { 
          content: 'Subheading Text',
          fontSize: 24,
          fontWeight: 'Medium',
          width: textWidth
        };
        break;
      case 'body':
        presetConfig = { 
          content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
          fontSize: 16,
          fontWeight: 'Regular',
          width: textWidth
        };
        break;
      case 'caption':
        presetConfig = { 
          content: 'Caption or small text',
          fontSize: 12,
          fontWeight: 'Regular',
          width: textWidth
        };
        break;
      case 'button':
        presetConfig = { 
          content: 'Button Text',
          fontSize: 14,
          fontWeight: '600',
          width: textWidth * 0.3
        };
        break;
      case 'custom':
        presetConfig = { 
          content: 'Custom Formatted Text',
          fontSize: 20,
          fontWeight: 'Medium',
          width: textWidth
        };
        break;
      default:
        presetConfig = { 
          content: 'Text',
          width: textWidth
        };
    }
    
    // Add text element with preset configuration directly
    canvasStore.addTextElement(
      { x: centerX, y: centerY },
      presetConfig.content,
      {
        fontSize: presetConfig.fontSize,
        fontWeight: presetConfig.fontWeight,
        size: { width: presetConfig.width, height: 100 }
      }
    );
  };

  return (
    <div className="h-full flex">
      {/* Vertical Menu */}
      <div className="w-16 bg-muted/30 border-r border-border flex flex-col py-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`flex flex-col items-center justify-center gap-1 py-3 px-2 transition-colors ${
              activeSection === item.id 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
            title={item.label}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.id}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="w-64 bg-card border-r border-border h-full flex flex-col">

        <ScrollArea className="h-full">
          <div className="p-3">
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

            {activeSection === "images" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Image Assets</h3>
                
                {/* Filter Tabs */}
                <div className="flex gap-1 mb-4">
                  <Button variant="default" size="sm" className="flex-1 text-xs">
                    All
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    Tags
                  </Button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search" 
                    className="pl-10 h-8 text-sm"
                  />
                </div>
                
                {/* Upload Images */}
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => imageUploadRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Images
                </Button>
                
                <input
                  type="file"
                  ref={imageUploadRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(file => {
                      const url = URL.createObjectURL(file);
                      addUploadedAsset({
                        id: Math.random().toString(36).substr(2, 9),
                        name: file.name,
                        type: 'image',
                        url: url,
                        isFromFeed: false
                      });
                    });
                  }}
                />

                {/* Stock Images Section */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Stock Images</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Product Images from Feed */}
                    {productContext.getMediaUrl('image_link') && (
                      <div className="relative">
                        <Button
                          variant="outline"
                          className="h-20 w-full p-0 overflow-hidden"
                          onClick={() => {
                            canvasStore.addImageElement(productContext.getMediaUrl('image_link'));
                          }}
                        >
                          <img
                            src={productContext.getMediaUrl('image_link')}
                            alt="Main product"
                            className="w-full h-full object-cover"
                          />
                        </Button>
                      </div>
                    )}
                    
                    {productContext.getMediaUrl('additional_image_link') && (
                      <div className="relative">
                        <Button
                          variant="outline"
                          className="h-20 w-full p-0 overflow-hidden"
                          onClick={() => {
                            canvasStore.addImageElement(productContext.getMediaUrl('additional_image_link'));
                          }}
                        >
                          <img
                            src={productContext.getMediaUrl('additional_image_link')}
                            alt="Additional product"
                            className="w-full h-full object-cover"
                          />
                        </Button>
                      </div>
                    )}

                    {/* Placeholder boxes for empty slots */}
                    {Array.from({ length: Math.max(0, 6 - (uploadedAssets.filter(a => a.type === 'image').length + 
                      (productContext.getMediaUrl('image_link') ? 1 : 0) + 
                      (productContext.getMediaUrl('additional_image_link') ? 1 : 0))) }).map((_, i) => (
                      <div key={i} className="relative">
                        <Button
                          variant="outline"
                          className="h-20 w-full p-0 overflow-hidden bg-muted/30"
                          disabled
                        >
                          <FileImage className="w-6 h-6 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BNPL Logos Section */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">BNPL Payment Logos</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Tabby', logo: '/bnpl/tabby.png' },
                      { name: 'Tamara', logo: '/bnpl/tamara.png' },
                      { name: 'Klarna', logo: '/bnpl/klarna.png' },
                      { name: 'Afterpay', logo: '/bnpl/afterpay.png' },
                      { name: 'Affirm', logo: '/bnpl/affirm.png' },
                      { name: 'PayPal', logo: '/bnpl/paypal.png' },
                    ].map((provider) => (
                      <div key={provider.name} className="relative">
                        <Button
                          variant="outline"
                          className="h-16 w-full p-2 overflow-hidden"
                          onClick={() => {
                            canvasStore.addImageElement(provider.logo);
                          }}
                        >
                          <img
                            src={provider.logo}
                            alt={provider.name}
                            className="w-full h-full object-contain"
                          />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              
                {/* Uploaded Images */}
                {uploadedAssets.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Uploaded Images</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {uploadedAssets.filter(asset => asset.type === 'image').map((asset) => (
                        <div key={asset.id} className="relative">
                          <Button
                            variant="outline"
                            className="h-20 w-full p-0 overflow-hidden"
                            onClick={() => {
                              if (asset.url) {
                                canvasStore.addImageElement(asset.url);
                              }
                            }}
                          >
                            {asset.url ? (
                              <img
                                src={asset.url}
                                alt={asset.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FileImage className="w-8 h-8" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Custom SVG</h4>
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={() => svgUploadRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload SVG
                  </Button>
                  <input
                    ref={svgUploadRef}
                    type="file"
                    accept=".svg,image/svg+xml"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const centerX = canvasStore.canvasState.canvasSize.width / 2 - 60;
                        const centerY = canvasStore.canvasState.canvasSize.height / 2 - 60;
                        canvasStore.uploadCustomSVG(file, { x: centerX, y: centerY });
                      }
                      e.target.value = '';
                    }}
                  />
                </div>
              </div>
            )}

            {activeSection === "text" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Text</h3>
                
                {/* Button Widget */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Button Widget</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      canvasStore.clearSelection();
                      const canvasWidth = canvasStore.canvasState.canvasSize.width;
                      const centerX = (canvasWidth - 160) / 2;
                      const centerY = canvasStore.canvasState.canvasSize.height / 2 - 24;
                      canvasStore.addButtonElement({ x: centerX, y: centerY });
                    }}
                    className="justify-start w-full text-left"
                  >
                    <RectangleHorizontal className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Add Button</span>
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Text Presets</h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTextPreset('heading1')}
                      className="justify-start w-full text-left"
                    >
                      <Type className="w-4 h-4 mr-2 flex-shrink-0" />
                      <div className="flex flex-col items-start">
                        <span className="font-bold">Heading 1</span>
                        <span className="text-xs text-muted-foreground">64px, Bold</span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTextPreset('heading2')}
                      className="justify-start w-full text-left"
                    >
                      <Type className="w-4 h-4 mr-2 flex-shrink-0" />
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">Heading 2</span>
                        <span className="text-xs text-muted-foreground">48px, Semi-bold</span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTextPreset('heading3')}
                      className="justify-start w-full text-left"
                    >
                      <Type className="w-4 h-4 mr-2 flex-shrink-0" />
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">Heading 3</span>
                        <span className="text-xs text-muted-foreground">36px, Semi-bold</span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTextPreset('subheading')}
                      className="justify-start w-full text-left"
                    >
                      <Type className="w-4 h-4 mr-2 flex-shrink-0" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Subheading</span>
                        <span className="text-xs text-muted-foreground">24px, Medium</span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTextPreset('body')}
                      className="justify-start w-full text-left"
                    >
                      <Type className="w-4 h-4 mr-2 flex-shrink-0" />
                      <div className="flex flex-col items-start">
                        <span>Body Text</span>
                        <span className="text-xs text-muted-foreground">16px, Lorem ipsum</span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTextPreset('caption')}
                      className="justify-start w-full text-left"
                    >
                      <Type className="w-4 h-4 mr-2 flex-shrink-0" />
                      <div className="flex flex-col items-start">
                        <span className="text-sm">Caption</span>
                        <span className="text-xs text-muted-foreground">12px, Regular</span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTextPreset('custom')}
                      className="justify-start w-full text-left"
                    >
                      <Type className="w-4 h-4 mr-2 flex-shrink-0" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Custom Text</span>
                        <span className="text-xs text-muted-foreground">20px, Medium</span>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "layers" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Layers</h3>
                  <div className="text-xs text-muted-foreground">
                    {canvasStore.canvasState.elements.length} layers
                  </div>
                </div>
                
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {canvasStore.canvasState.elements
                    .sort((a, b) => b.zIndex - a.zIndex) // Sort by z-index (top to bottom)
                    .map((element, index) => {
                      const isSelected = canvasStore.canvasState.selectedElementIds.includes(element.id);
                      
                      return (
                        <div 
                          key={element.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, element.id)}
                          onDragOver={(e) => handleDragOver(e, element.id)}
                          onDragEnd={handleDragEnd}
                          onDragLeave={handleDragLeave}
                          className={`group flex items-center gap-1.5 p-2 rounded border transition-colors min-w-0 ${
                            isSelected 
                              ? 'bg-primary/10 border-primary' 
                              : 'bg-muted/50 border-border hover:bg-muted'
                          } ${
                            dragOverElement === element.id ? 'ring-2 ring-primary' : ''
                          } ${
                            draggedElement === element.id ? 'opacity-50' : ''
                          }`}
                        >
                          {/* Drag Handle */}
                          <div className="cursor-move opacity-50 hover:opacity-100 flex-shrink-0">
                            <GripVertical className="w-3 h-3" />
                          </div>
                          
                          {/* Layer Info */}
                          <div 
                            className="flex-1 flex items-center gap-2 cursor-pointer min-w-0 overflow-hidden"
                            onClick={() => canvasStore.selectElement(element.id)}
                          >
                            {/* Layer Icon */}
                            <div className="flex-shrink-0">
                              {element.type === 'text' && <Type className="w-4 h-4" />}
                              {element.type === 'button' && <RectangleHorizontal className="w-4 h-4" />}
                              {element.type === 'shape' && <Shapes className="w-4 h-4" />}  
                              {element.type === 'image' && <Image className="w-4 h-4" />}
                              {element.type === 'svg' && <FileImage className="w-4 h-4" />}
                            </div>
                            
                            {/* Layer Name & Details */}
                            <div className="flex-1 min-w-0 overflow-hidden max-w-[80px]">
                              <div className="text-xs font-medium truncate">
                                {element.type === 'text' && (element as any).content?.substring(0, 8)}
                                {element.type === 'button' && (element as any).content?.substring(0, 8)}
                                {element.type === 'shape' && `${(element as any).shapeType}`.substring(0, 8)}
                                {element.type === 'image' && 'Image'}
                                {element.type === 'svg' && 'SVG'}
                              </div>
                            </div>
                          </div>
                          
                          {/* Layer Controls - Always visible */}
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            {/* Move Forward */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveLayerUp(element.id);
                              }}
                              disabled={index === 0}
                              title="Bring Forward (Cmd/Ctrl + ])"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </Button>
                            
                            {/* Move Backward */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveLayerDown(element.id);
                              }}
                              disabled={index === canvasStore.canvasState.elements.length - 1}
                              title="Send Backward (Cmd/Ctrl + [)"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </Button>
                            
                            {/* Visibility Toggle */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                canvasStore.updateElement(element.id, { visible: !element.visible });
                              }}
                              title="Toggle Visibility"
                            >
                              {element.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            </Button>
                            
                            {/* Lock Toggle */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                canvasStore.updateElement(element.id, { locked: !element.locked });
                              }}
                              title="Lock/Unlock"
                            >
                              {element.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                            </Button>
                            
                            {/* Delete */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                canvasStore.deleteElement(element.id);
                              }}
                              title="Delete"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    
                  {canvasStore.canvasState.elements.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No layers yet</p>
                      <p className="text-xs">Add text, shapes, or images to get started</p>
                    </div>
                  )}
                </div>
                
                {/* Quick Actions */}
                {canvasStore.canvasState.selectedElementIds.length > 0 && (
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => canvasStore.deleteSelected()}
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDuplicateSelected}
                        className="flex-1"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Duplicate
                      </Button>
                    </div>
                    
                    {/* Group Actions */}
                    {canvasStore.canvasState.selectedElementIds.length > 1 && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            canvasStore.groupSelectedElements();
                            toast.success('Layers grouped successfully');
                          }}
                          className="flex-1"
                        >
                          <Package className="w-4 h-4 mr-1" />
                          Group
                        </Button>
                         <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const selectedElements = canvasStore.getSelectedElements();
                            console.log('Selected elements for widget:', selectedElements);
                            const widgetName = prompt('Enter widget name:', 'My Widget');
                            if (widgetName && selectedElements.length > 0) {
                              canvasStore.groupSelectedElements();
                              setTimeout(() => {
                                const group = canvasStore.getSelectedElement();
                                console.log('Group created:', group);
                                if (group && group.type === 'group') {
                                  const widget = addWidget(widgetName, [(group as any)]);
                                  console.log('Widget saved:', widget);
                                  console.log('Total widgets:', widgets.length + 1);
                                  toast.success(`Widget "${widgetName}" saved!`);
                                } else {
                                  console.error('Failed to create group');
                                  toast.error('Failed to save widget');
                                }
                              }, 100);
                            }
                          }}
                          className="flex-1"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Save Widget
                        </Button>
                      </div>
                    )}
                    
                    {/* Ungroup */}
                    {canvasStore.canvasState.selectedElementIds.length === 1 && 
                     canvasStore.getSelectedElement()?.type === 'group' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          canvasStore.ungroupSelectedElement();
                          toast.success('Group ungrouped');
                        }}
                        className="w-full"
                      >
                        <Package className="w-4 h-4 mr-1" />
                        Ungroup
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeSection === "widgets" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Widgets</h3>
                  <p className="text-sm text-muted-foreground">
                    Add pre-built widgets or use your saved widgets
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Debug: {widgets.length} widgets loaded
                  </p>
                </div>

                {/* Saved Widgets */}
                {widgets.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      My Widgets ({widgets.length})
                    </h4>
                    <div className="space-y-2">
                      {widgets.map((widget) => (
                        <Card key={widget.id} className="p-2">
                          <div className="flex items-center justify-between gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Clear selection before adding widget
                                canvasStore.clearSelection();
                                
                                // Add widget to canvas
                                const widgetElements = widget.elements.map(el => ({
                                  ...el,
                                  id: Math.random().toString(36).substr(2, 9),
                                  position: {
                                    x: el.position.x + 50,
                                    y: el.position.y + 50
                                  }
                                }));
                                
                                widgetElements.forEach(element => {
                                  if (element.type === 'group') {
                                    const groupEl = element as any;
                                    canvasStore.canvasState.elements.forEach(() => {});
                                    // Add group's children
                                    groupEl.children?.forEach((child: any) => {
                                      const childWithOffset = {
                                        ...child,
                                        id: Math.random().toString(36).substr(2, 9),
                                        position: {
                                          x: element.position.x + child.position.x,
                                          y: element.position.y + child.position.y
                                        }
                                      };
                                      
                                      if (child.type === 'text') {
                                        canvasStore.addTextElement(
                                          childWithOffset.position,
                                          child.content,
                                          childWithOffset
                                        );
                                      } else if (child.type === 'shape') {
                                        canvasStore.addShapeElement(
                                          child.shapeType,
                                          childWithOffset.position
                                        );
                                        setTimeout(() => {
                                          const addedEl = canvasStore.getSelectedElement();
                                          if (addedEl) {
                                            canvasStore.updateElement(addedEl.id, childWithOffset);
                                          }
                                        }, 50);
                                      } else if (child.type === 'image') {
                                        canvasStore.addImageElement(
                                          child.src,
                                          childWithOffset.position
                                        );
                                        setTimeout(() => {
                                          const addedEl = canvasStore.getSelectedElement();
                                          if (addedEl) {
                                            canvasStore.updateElement(addedEl.id, childWithOffset);
                                          }
                                        }, 50);
                                      }
                                    });
                                  }
                                });
                                
                                toast.success(`Added "${widget.name}" to canvas`);
                              }}
                              className="flex-1 justify-start"
                            >
                              <Package className="w-4 h-4 mr-2" />
                              <span className="text-xs truncate">{widget.name}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              onClick={() => {
                                if (confirm(`Delete widget "${widget.name}"?`)) {
                                  deleteWidget(widget.id);
                                  toast.success('Widget deleted');
                                }
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {widgets.length === 0 && (
                  <Card className="p-4 border-dashed">
                    <div className="text-center text-muted-foreground space-y-2">
                      <Package className="w-8 h-8 mx-auto opacity-50" />
                      <p className="text-sm">No saved widgets yet</p>
                      <p className="text-xs">Select multiple layers and click "Save Widget" to create reusable widgets</p>
                    </div>
                  </Card>
                )}

                <div className="border-t pt-4 space-y-4">

                {/* QR Code */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">QR Code</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const centerX = canvasStore.canvasState.canvasSize.width / 2 - 75;
                      const centerY = canvasStore.canvasState.canvasSize.height / 2 - 75;
                      canvasStore.addShapeElement('rectangle', { x: centerX, y: centerY });
                      setTimeout(() => {
                        const selectedElement = canvasStore.getSelectedElement();
                        if (selectedElement) {
                          canvasStore.updateElement(selectedElement.id, {
                            size: { width: 150, height: 150 },
                            fillColor: '#ffffff',
                            strokeColor: '#000000',
                            strokeWidth: 2
                          });
                        }
                      }, 100);
                    }}
                    className="w-full justify-start"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Code Placeholder
                  </Button>
                </div>

                {/* Barcode */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Barcode</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const centerX = canvasStore.canvasState.canvasSize.width / 2 - 100;
                      const centerY = canvasStore.canvasState.canvasSize.height / 2 - 40;
                      canvasStore.addShapeElement('rectangle', { x: centerX, y: centerY });
                      setTimeout(() => {
                        const selectedElement = canvasStore.getSelectedElement();
                        if (selectedElement) {
                          canvasStore.updateElement(selectedElement.id, {
                            size: { width: 200, height: 80 },
                            fillColor: '#ffffff',
                            strokeColor: '#000000',
                            strokeWidth: 2
                          });
                        }
                      }, 100);
                    }}
                    className="w-full justify-start"
                  >
                    <Barcode className="w-4 h-4 mr-2" />
                    Barcode Placeholder
                  </Button>
                </div>

                {/* Rating Widget */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Rating Widget</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const centerX = canvasStore.canvasState.canvasSize.width / 2 - 90;
                      const centerY = canvasStore.canvasState.canvasSize.height / 2 - 12;
                      
                      const ratingWidget = createRatingWidget({
                      position: { x: centerX, y: centerY },
                      rating: 4.5,
                      starFilledColor: '#E4A709',
                      starUnfilledColor: '#D1D5DB',
                      textColor: '#000000',
                      fontSize: 16,
                      showRatingText: true
                    });
                    
                    // Add the elements to canvas
                    const maxZIndex = canvasStore.canvasState.elements.length > 0 
                      ? Math.max(...canvasStore.canvasState.elements.map(e => e.zIndex)) 
                      : 0;
                    
                    ratingWidget.forEach((element, index) => {
                      const updatedElement = { ...element, zIndex: maxZIndex + index + 1 };
                      canvasStore.canvasState.elements.push(updatedElement);
                    });
                    canvasStore.selectElement(ratingWidget[0].id);
                    toast.success('Rating widget added');
                  }}
                    className="w-full justify-start"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Rating Stars
                  </Button>
                </div>

                {/* BNPL Widget */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">BNPL Widget</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      canvasStore.clearSelection();
                      const centerX = canvasStore.canvasState.canvasSize.width / 2 - 150;
                      const centerY = canvasStore.canvasState.canvasSize.height / 2 - 20;
                      
                      // Add text with template-based dynamic price
                      canvasStore.addTextElement(
                        { x: centerX, y: centerY },
                        'Pay {price} in 4 installments',
                        {
                          isDynamic: true,
                          dynamicField: 'price',
                          dynamicContent: currentProduct.price, // Source value for calculations
                          fontSize: 18,
                          fontWeight: '500',
                          color: '#000000',
                          textAlign: 'center',
                          size: { width: 350, height: 40 },
                          modifiers: [{
                            id: Math.random().toString(36).substr(2, 9),
                            type: 'divide',
                            value: 4
                          }],
                          formatting: {
                            currencySymbol: '$',
                            decimals: 2,
                            thousandsSeparator: false
                          },
                          // Mark as template for placeholder replacement
                          isTemplate: true
                        }
                      );
                      
                      toast.success('BNPL text added with divide by 4 modifier - add logos from Images section');
                    }}
                    className="w-full justify-start"
                  >
                    <BadgePercent className="w-4 h-4 mr-2" />
                    Buy Now Pay Later
                  </Button>
                </div>


                {/* Button Widget */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Button Widget</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      canvasStore.clearSelection();
                      const canvasWidth = canvasStore.canvasState.canvasSize.width;
                      const centerX = (canvasWidth - 160) / 2;
                      const centerY = canvasStore.canvasState.canvasSize.height / 2 - 24;
                      canvasStore.addButtonElement({ x: centerX, y: centerY });
                    }}
                    className="w-full justify-start"
                  >
                    <RectangleHorizontal className="w-4 h-4 mr-2" />
                    Add Button
                  </Button>
                </div>

                {/* Badge/Tag */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Badges & Tags</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const centerX = canvasStore.canvasState.canvasSize.width / 2 - 60;
                        const centerY = 30;
                        canvasStore.addTextElement({ x: centerX, y: centerY }, 'SALE', {
                          fontSize: 24,
                          fontWeight: '700',
                          color: '#ffffff'
                        });
                        setTimeout(() => {
                          const selectedElement = canvasStore.getSelectedElement();
                          if (selectedElement) {
                            canvasStore.addShapeElement('rectangle', { x: centerX - 10, y: centerY - 5 });
                            setTimeout(() => {
                              const shape = canvasStore.getSelectedElement();
                              if (shape) {
                                canvasStore.updateElement(shape.id, {
                                  size: { width: 120, height: 40 },
                                  fillColor: '#ef4444',
                                  strokeWidth: 0,
                                  zIndex: selectedElement.zIndex - 1
                                });
                              }
                            }, 50);
                          }
                        }, 100);
                      }}
                      className="justify-start"
                    >
                      <BadgePercent className="w-4 h-4 mr-1" />
                      Sale
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const centerX = canvasStore.canvasState.canvasSize.width / 2 - 60;
                        const centerY = 30;
                        canvasStore.addTextElement({ x: centerX, y: centerY }, 'NEW', {
                          fontSize: 20,
                          fontWeight: '700',
                          color: '#ffffff'
                        });
                        setTimeout(() => {
                          const selectedElement = canvasStore.getSelectedElement();
                          if (selectedElement) {
                            canvasStore.addShapeElement('rectangle', { x: centerX - 10, y: centerY - 5 });
                            setTimeout(() => {
                              const shape = canvasStore.getSelectedElement();
                              if (shape) {
                                canvasStore.updateElement(shape.id, {
                                  size: { width: 100, height: 35 },
                                  fillColor: '#10b981',
                                  strokeWidth: 0,
                                  zIndex: selectedElement.zIndex - 1
                                });
                              }
                            }, 50);
                          }
                        }, 100);
                      }}
                      className="justify-start"
                    >
                      <Tag className="w-4 h-4 mr-1" />
                      New
                    </Button>
                  </div>
                </div>

                {/* Price Widget */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Price Widget</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Default Style */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const centerX = canvasStore.canvasState.canvasSize.width / 2 - 100;
                        const centerY = canvasStore.canvasState.canvasSize.height / 2 - 40;
                        
                        const priceWidget = createPriceWidget({
                          position: { x: centerX, y: centerY },
                          ...priceWidgetPresets.default
                        });
                        
                        const maxZIndex = canvasStore.canvasState.elements.length > 0 
                          ? Math.max(...canvasStore.canvasState.elements.map(e => e.zIndex)) 
                          : 0;
                        
                        priceWidget.forEach((element, index) => {
                          const updatedElement = { ...element, zIndex: maxZIndex + index + 1 };
                          canvasStore.canvasState.elements.push(updatedElement);
                        });
                        canvasStore.selectElement(priceWidget[0].id);
                        toast.success('Price widget added');
                      }}
                      className="justify-start"
                    >
                      <BadgePercent className="w-4 h-4 mr-1" />
                      Default
                    </Button>

                    {/* Large Bold Style */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const centerX = canvasStore.canvasState.canvasSize.width / 2 - 100;
                        const centerY = canvasStore.canvasState.canvasSize.height / 2 - 40;
                        
                        const priceWidget = createPriceWidget({
                          position: { x: centerX, y: centerY },
                          ...priceWidgetPresets.largeBold
                        });
                        
                        const maxZIndex = canvasStore.canvasState.elements.length > 0 
                          ? Math.max(...canvasStore.canvasState.elements.map(e => e.zIndex)) 
                          : 0;
                        
                        priceWidget.forEach((element, index) => {
                          const updatedElement = { ...element, zIndex: maxZIndex + index + 1 };
                          canvasStore.canvasState.elements.push(updatedElement);
                        });
                        canvasStore.selectElement(priceWidget[0].id);
                        toast.success('Price widget added');
                      }}
                      className="justify-start"
                    >
                      <BadgePercent className="w-4 h-4 mr-1" />
                      Large
                    </Button>

                    {/* Red Badge Style */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const centerX = canvasStore.canvasState.canvasSize.width / 2 - 100;
                        const centerY = canvasStore.canvasState.canvasSize.height / 2 - 40;
                        
                        const priceWidget = createPriceWidget({
                          position: { x: centerX, y: centerY },
                          ...priceWidgetPresets.redBadge
                        });
                        
                        const maxZIndex = canvasStore.canvasState.elements.length > 0 
                          ? Math.max(...canvasStore.canvasState.elements.map(e => e.zIndex)) 
                          : 0;
                        
                        priceWidget.forEach((element, index) => {
                          const updatedElement = { ...element, zIndex: maxZIndex + index + 1 };
                          canvasStore.canvasState.elements.push(updatedElement);
                        });
                        canvasStore.selectElement(priceWidget[0].id);
                        toast.success('Price widget added');
                      }}
                      className="justify-start"
                    >
                      <BadgePercent className="w-4 h-4 mr-1" />
                      Badge
                    </Button>

                    {/* Side by Side Style */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const centerX = canvasStore.canvasState.canvasSize.width / 2 - 100;
                        const centerY = canvasStore.canvasState.canvasSize.height / 2 - 20;
                        
                        const priceWidget = createPriceWidget({
                          position: { x: centerX, y: centerY },
                          ...priceWidgetPresets.sideBySide
                        });
                        
                        const maxZIndex = canvasStore.canvasState.elements.length > 0 
                          ? Math.max(...canvasStore.canvasState.elements.map(e => e.zIndex)) 
                          : 0;
                        
                        priceWidget.forEach((element, index) => {
                          const updatedElement = { ...element, zIndex: maxZIndex + index + 1 };
                          canvasStore.canvasState.elements.push(updatedElement);
                        });
                        canvasStore.selectElement(priceWidget[0].id);
                        toast.success('Price widget added');
                      }}
                      className="justify-start"
                    >
                      <BadgePercent className="w-4 h-4 mr-1" />
                      Inline
                    </Button>
                  </div>
                </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}