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
  RectangleHorizontal,
  ArrowUp,
  ArrowDown,
  Lock,
  Unlock,
  Copy,
  Package,
  StarIcon
} from "lucide-react";
import { useCanvasStore } from "../../hooks/useCanvasStore";
import { useProduct } from "../../contexts/ProductContext";

type MenuSection = "source" | "images" | "shapes" | "text" | "layers" | "widgets" | null;

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
    { id: "widgets" as const, icon: Package, label: "Widgets" },
    { id: "layers" as const, icon: Layers, label: "Layers" },
  ];

  const shapes = [
    { icon: Circle, name: "Circle", type: "circle" as const },
    { icon: Square, name: "Rectangle", type: "rectangle" as const },
    { icon: Triangle, name: "Triangle", type: "triangle" as const },
    { icon: Star, name: "Star", type: "star" as const },
    { icon: Heart, name: "Heart", type: "heart" as const },
    { icon: Plus, name: "Plus", type: "plus" as const },
    { icon: ArrowRight, name: "Arrow", type: "arrow" as const },
    { icon: Diamond, name: "Diamond", type: "diamond" as const }
  ];

  const handleAddShape = (shapeType: "rectangle" | "circle" | "triangle" | "star" | "heart" | "plus" | "arrow" | "diamond") => {
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
    // Get the media URL from the product context
    const mediaUrl = productContext.getMediaUrl(mediaKey);
    
    if (mediaUrl) {
      // Let addImageElement calculate the center position based on actual image dimensions
      canvasStore.addImageElement(mediaUrl);
      
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

  const handleMoveLayerUp = (elementId: string) => {
    const element = canvasStore.canvasState.elements.find(el => el.id === elementId);
    if (element) {
      const maxZIndex = Math.max(...canvasStore.canvasState.elements.map(el => el.zIndex));
      if (element.zIndex < maxZIndex) {
        canvasStore.updateElement(elementId, { zIndex: element.zIndex + 1 });
      }
    }
  };

  const handleMoveLayerDown = (elementId: string) => {
    const element = canvasStore.canvasState.elements.find(el => el.id === elementId);
    if (element) {
      const minZIndex = Math.min(...canvasStore.canvasState.elements.map(el => el.zIndex));
      if (element.zIndex > minZIndex) {
        canvasStore.updateElement(elementId, { zIndex: element.zIndex - 1 });
      }
    }
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

  const handleAddBNPLWidget = () => {
    const centerX = canvasStore.canvasState.canvasSize.width / 2 - 150;
    const centerY = canvasStore.canvasState.canvasSize.height / 2 - 50;
    const maxZIndex = Math.max(...canvasStore.canvasState.elements.map(el => el.zIndex), 0);
    
    // Add "or 4 interest-free payments" text
    canvasStore.addTextElement({ x: centerX, y: centerY }, 'or 4 interest-free payments with');
    setTimeout(() => {
      const textElement = canvasStore.getSelectedElement();
      if (textElement) {
        canvasStore.updateElement(textElement.id, {
          fontSize: 14,
          fontWeight: 'Regular',
          color: '#666666',
          zIndex: maxZIndex + 1
        });
      }
    }, 50);

    // Add Tabby logo placeholder (rectangle with text)
    setTimeout(() => {
      canvasStore.addShapeElement('rectangle', { x: centerX + 220, y: centerY - 5 });
      setTimeout(() => {
        const tabbyLogo = canvasStore.getSelectedElement();
        if (tabbyLogo && tabbyLogo.type === 'shape') {
          canvasStore.updateElement(tabbyLogo.id, {
            size: { width: 60, height: 24 },
            fillColor: '#3DEBB1',
            cornerRadius: 4,
            zIndex: maxZIndex + 2
          });
        }
      }, 50);
    }, 100);

    // Add Tabby text
    setTimeout(() => {
      canvasStore.addTextElement({ x: centerX + 232, y: centerY - 1 }, 'tabby');
      setTimeout(() => {
        const tabbyText = canvasStore.getSelectedElement();
        if (tabbyText) {
          canvasStore.updateElement(tabbyText.id, {
            fontSize: 16,
            fontWeight: 'Bold',
            color: '#FFFFFF',
            zIndex: maxZIndex + 3
          });
        }
      }, 50);
    }, 200);

    // Add Tamara logo placeholder (rectangle with text)
    setTimeout(() => {
      canvasStore.addShapeElement('rectangle', { x: centerX + 290, y: centerY - 5 });
      setTimeout(() => {
        const tamaraLogo = canvasStore.getSelectedElement();
        if (tamaraLogo && tamaraLogo.type === 'shape') {
          canvasStore.updateElement(tamaraLogo.id, {
            size: { width: 60, height: 24 },
            fillColor: '#000000',
            cornerRadius: 4,
            zIndex: maxZIndex + 4
          });
        }
      }, 50);
    }, 300);

    // Add Tamara text
    setTimeout(() => {
      canvasStore.addTextElement({ x: centerX + 298, y: centerY - 1 }, 'tamara');
      setTimeout(() => {
        const tamaraText = canvasStore.getSelectedElement();
        if (tamaraText) {
          canvasStore.updateElement(tamaraText.id, {
            fontSize: 14,
            fontWeight: 'Bold',
            color: '#FFFFFF',
            zIndex: maxZIndex + 5
          });
        }
      }, 50);
    }, 400);
  };

  const handleAddReviewWidget = () => {
    const centerX = canvasStore.canvasState.canvasSize.width / 2 - 100;
    const centerY = canvasStore.canvasState.canvasSize.height / 2 - 30;
    const maxZIndex = Math.max(...canvasStore.canvasState.elements.map(el => el.zIndex), 0);
    
    // Add 5 star shapes
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        canvasStore.addShapeElement('star', { x: centerX + (i * 30), y: centerY });
        setTimeout(() => {
          const star = canvasStore.getSelectedElement();
          if (star && star.type === 'shape') {
            canvasStore.updateElement(star.id, {
              size: { width: 24, height: 24 },
              fillColor: '#FFB800',
              strokeWidth: 0,
              zIndex: maxZIndex + i + 1
            });
          }
        }, 50);
      }, i * 100);
    }

    // Add rating text
    setTimeout(() => {
      canvasStore.addTextElement({ x: centerX + 160, y: centerY + 2 }, '4.8');
      setTimeout(() => {
        const ratingText = canvasStore.getSelectedElement();
        if (ratingText) {
          canvasStore.updateElement(ratingText.id, {
            fontSize: 18,
            fontWeight: 'Bold',
            color: '#333333',
            zIndex: maxZIndex + 6
          });
        }
      }, 50);
    }, 500);

    // Add review count text
    setTimeout(() => {
      canvasStore.addTextElement({ x: centerX + 200, y: centerY + 5 }, '(1,234 reviews)');
      setTimeout(() => {
        const reviewText = canvasStore.getSelectedElement();
        if (reviewText) {
          canvasStore.updateElement(reviewText.id, {
            fontSize: 12,
            fontWeight: 'Regular',
            color: '#666666',
            zIndex: maxZIndex + 7
          });
        }
      }, 50);
    }, 600);
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

            {activeSection === "widgets" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Widgets</h3>
                <p className="text-sm text-muted-foreground">
                  Add pre-grouped dynamic layer sets
                </p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Payment Options</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddBNPLWidget}
                    className="w-full justify-start h-auto p-3"
                  >
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span className="font-medium">BNPL Widget</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Buy Now Pay Later with Tabby & Tamara
                      </span>
                    </div>
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Social Proof</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddReviewWidget}
                    className="w-full justify-start h-auto p-3"
                  >
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-2">
                        <StarIcon className="w-4 h-4" />
                        <span className="font-medium">Review & Rating</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Star rating with review count
                      </span>
                    </div>
                  </Button>
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
                          className={`group flex items-center gap-2 p-2 rounded border transition-colors ${
                            isSelected 
                              ? 'bg-primary/10 border-primary' 
                              : 'bg-muted/50 border-border hover:bg-muted'
                          }`}
                        >
                          {/* Drag Handle */}
                          <div className="cursor-move opacity-50 hover:opacity-100">
                            <GripVertical className="w-3 h-3" />
                          </div>
                          
                          {/* Layer Info */}
                          <div 
                            className="flex-1 flex items-center gap-2 cursor-pointer"
                            onClick={() => canvasStore.selectElement(element.id)}
                          >
                            {/* Layer Icon */}
                            <div className="flex-shrink-0">
                              {element.type === 'text' && <Type className="w-4 h-4" />}
                              {element.type === 'shape' && <Shapes className="w-4 h-4" />}  
                              {element.type === 'image' && <Image className="w-4 h-4" />}
                              {element.type === 'svg' && <FileImage className="w-4 h-4" />}
                            </div>
                            
                            {/* Layer Name & Details */}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {element.type === 'text' && (element as any).content?.substring(0, 20)}
                                {element.type === 'shape' && `${(element as any).shapeType} shape`}
                                {element.type === 'image' && 'Image'}
                                {element.type === 'svg' && 'SVG'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {Math.round(element.size.width)} × {Math.round(element.size.height)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Layer Controls */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Move Up */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveLayerUp(element.id);
                              }}
                              disabled={index === 0}
                            >
                              <ArrowUp className="w-3 h-3" />
                            </Button>
                            
                            {/* Move Down */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveLayerDown(element.id);
                              }}
                              disabled={index === canvasStore.canvasState.elements.length - 1}
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
                  <div className="border-t pt-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => canvasStore.deleteSelected()}
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Delete Selected
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
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}