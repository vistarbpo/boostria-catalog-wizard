import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Slider } from "./ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Bold,
  Italic,
  Underline,
  Palette,
  Plus,
  MoreHorizontal,
  ChevronDown,
  Link,
  Eye,
  Square,
  Maximize2,
  RotateCcw,
  Type,
  Grid3X3
} from "lucide-react";
import { useCanvasStore } from "../hooks/useCanvasStore";
import { TextElement, ShapeElement, ImageElement, SVGElement } from "../types/canvas";
import { useProduct } from "../contexts/ProductContext";

interface RightSidebarProps {
  canvasStore: ReturnType<typeof useCanvasStore>;
}

export function RightSidebar({ canvasStore }: RightSidebarProps) {
  const selectedElement = canvasStore.getSelectedElement();
  const { currentProduct, getMediaUrl, uploadedAssets } = useProduct();
  
  // Local state for controlled inputs
  const [localValues, setLocalValues] = useState({
    content: '',
    fontSize: '32',
    letterSpacing: '0',
    lineSpacing: '1.2'
  });

  // Update local values when selection changes
  useEffect(() => {
    if (selectedElement && selectedElement.type === 'text') {
      const textEl = selectedElement as TextElement;
      setLocalValues({
        content: textEl.isDynamic ? textEl.content : textEl.content,
        fontSize: textEl.fontSize.toString(),
        letterSpacing: textEl.letterSpacing.toString(),
        lineSpacing: textEl.lineHeight.toString()
      });
    }
  }, [selectedElement?.id, selectedElement?.type, (selectedElement as TextElement)?.isDynamic, (selectedElement as TextElement)?.dynamicField]);

  const updateElementProperty = (property: string, value: any) => {
    if (selectedElement) {
      canvasStore.updateElement(selectedElement.id, { [property]: value });
    }
  };

  const handleInputChange = (property: keyof typeof localValues, value: string) => {
    setLocalValues(prev => ({ ...prev, [property]: value }));
  };

  const handleInputBlur = (property: string, value: string) => {
    if (selectedElement) {
      let processedValue: any = value;
      
      // Convert string values to appropriate types
      if (property === 'fontSize' || property === 'letterSpacing') {
        processedValue = parseFloat(value) || 0;
      } else if (property === 'lineHeight') {
        processedValue = parseFloat(value) || 1.2;
      }
      
      canvasStore.updateElement(selectedElement.id, { [property]: processedValue });
    }
  };

  if (!selectedElement) {
    return (
      <div className="w-80 bg-card border-l border-border h-full">
        <div className="p-4">
          <div className="text-center text-muted-foreground mt-8">
            <div className="text-lg mb-2">No element selected</div>
            <div className="text-sm">Select an element on the canvas to edit its properties</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-card border-l border-border h-full">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {/* Element Header */}
          <div className="pb-2">
            <h2 className="text-lg capitalize">{selectedElement.type}</h2>
            {selectedElement.type === 'text' && (
              <div className="text-sm text-muted-foreground">
                "{(selectedElement as TextElement).content}"
              </div>
            )}
          </div>

          {/* Transform Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm text-muted-foreground uppercase tracking-wide">Transform</h3>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">X</Label>
                <div className="relative">
                  <Input 
                    value={Math.round(selectedElement.position.x).toString()} 
                    onChange={(e) => updateElementProperty('position', { ...selectedElement.position, x: parseInt(e.target.value) || 0 })}
                    className="h-8 pr-6" 
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">px</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Y</Label>
                <div className="relative">
                  <Input 
                    value={Math.round(selectedElement.position.y).toString()} 
                    onChange={(e) => updateElementProperty('position', { ...selectedElement.position, y: parseInt(e.target.value) || 0 })}
                    className="h-8 pr-6" 
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">px</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">W</Label>
                <div className="relative">
                  <Input 
                    value={Math.round(selectedElement.size.width).toString()} 
                    onChange={(e) => updateElementProperty('size', { ...selectedElement.size, width: parseInt(e.target.value) || 20 })}
                    className="h-8 pr-6" 
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">px</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">H</Label>
                <div className="relative">
                  <Input 
                    value={Math.round(selectedElement.size.height).toString()} 
                    onChange={(e) => updateElementProperty('size', { ...selectedElement.size, height: parseInt(e.target.value) || 20 })}
                    className="h-8 pr-6" 
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">px</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">R</Label>
                <div className="relative">
                  <Input 
                    value={selectedElement.rotation.toString()} 
                    onChange={(e) => updateElementProperty('rotation', parseFloat(e.target.value) || 0)}
                    className="h-8 pr-8" 
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">deg</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Opacity</Label>
                <div className="relative">
                  <Input 
                    value={selectedElement.opacity.toString()} 
                    onChange={(e) => updateElementProperty('opacity', parseInt(e.target.value) || 100)}
                    className="h-8 pr-6" 
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">%</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dynamic Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm text-muted-foreground uppercase tracking-wide">Dynamic</h3>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
            
            {selectedElement.type === 'text' && (
              <div className="space-y-3">
                {/* Dynamic Content Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-accent-foreground" />
                    <span className="text-sm">Dynamic Content</span>
                  </div>
                  <Switch 
                    checked={(selectedElement as TextElement).isDynamic || false} 
                    onCheckedChange={(checked) => {
                      updateElementProperty('isDynamic', checked);
                      if (!checked) {
                        // Reset to static content
                        updateElementProperty('dynamicField', undefined);
                        updateElementProperty('dynamicContent', undefined);
                        updateElementProperty('color', '#000000'); // Reset color
                      }
                    }} 
                  />
                </div>

                {/* Dynamic Field Selection */}
                {(selectedElement as TextElement).isDynamic && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">Data Field</Label>
                      {(selectedElement as TextElement).dynamicField && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            updateElementProperty('dynamicField', undefined);
                            updateElementProperty('dynamicContent', undefined);
                            updateElementProperty('content', 'Text');
                            updateElementProperty('color', '#000000');
                          }}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <Select 
                      value={(selectedElement as TextElement).dynamicField || ''}
                      onValueChange={(value) => {
                        updateElementProperty('dynamicField', value);
                        
                        // Get the actual value from current product
                        let dynamicValue = '';
                        switch (value) {
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
                          case 'discount_percentage':
                            dynamicValue = '30%';
                            break;
                          case 'currency':
                            dynamicValue = 'USD';
                            break;
                          case 'color':
                            dynamicValue = 'White';
                            break;
                          case 'size':
                            dynamicValue = 'Medium';
                            break;
                          case 'material':
                            dynamicValue = 'Cotton Blend';
                            break;
                          case 'weight':
                            dynamicValue = '1.2 lbs';
                            break;
                          default:
                            dynamicValue = `{${value}}`;
                        }
                        
                        updateElementProperty('dynamicContent', dynamicValue);
                        updateElementProperty('content', `{${value}}`);
                        updateElementProperty('color', '#3b82f6'); // Blue color for dynamic
                      }}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select a field..." />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-2 py-1 text-xs text-muted-foreground uppercase tracking-wide">Product Info</div>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="description">Description</SelectItem>
                        <SelectItem value="brand">Brand</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="id">Product ID</SelectItem>
                        
                        <div className="px-2 py-1 text-xs text-muted-foreground uppercase tracking-wide mt-2">Pricing</div>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="sale_price">Sale Price</SelectItem>
                        <SelectItem value="discount_percentage">Discount %</SelectItem>
                        <SelectItem value="currency">Currency</SelectItem>
                        
                        <div className="px-2 py-1 text-xs text-muted-foreground uppercase tracking-wide mt-2">Attributes</div>
                        <SelectItem value="color">Color</SelectItem>
                        <SelectItem value="size">Size</SelectItem>
                        <SelectItem value="material">Material</SelectItem>
                        <SelectItem value="weight">Weight</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Preview of dynamic content */}
                {(selectedElement as TextElement).isDynamic && (selectedElement as TextElement).dynamicContent && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Preview</Label>
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                      {(selectedElement as TextElement).dynamicContent}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedElement.type !== 'text' && (
              <Button variant="ghost" className="w-full justify-start gap-2 h-10 text-muted-foreground" disabled>
                <Link className="w-4 h-4" />
                Dynamic content only available for text
              </Button>
            )}
          </div>

          <Separator />

          {/* Content Section for Text Elements */}
          {selectedElement.type === 'text' && (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm text-muted-foreground uppercase tracking-wide">Content</h3>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Text Content
                    {(selectedElement as TextElement).isDynamic && (
                      <span className="text-blue-600 ml-1">(Dynamic)</span>
                    )}
                  </Label>
                  
                  {(selectedElement as TextElement).isDynamic ? (
                    <div className="relative">
                      <Input 
                        value={localValues.content}
                        className="h-10 bg-blue-50 border-blue-200 text-blue-800" 
                        placeholder="Dynamic field selected..."
                        disabled
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                          {(selectedElement as TextElement).dynamicField}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <Input 
                      value={localValues.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      onBlur={(e) => handleInputBlur('content', e.target.value)}
                      className="h-10" 
                      placeholder="Enter text..."
                    />
                  )}
                </div>
              </div>

              <Separator />

              {/* Text Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm text-muted-foreground uppercase tracking-wide">Text</h3>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
                
                {/* Font Family */}
                <div className="space-y-2">
                  <Select 
                    value={(selectedElement as TextElement).fontFamily} 
                    onValueChange={(value) => updateElementProperty('fontFamily', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Space Grotesk">Space Grotesk</SelectItem>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Font Weight and Size */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Select 
                      value={(selectedElement as TextElement).fontWeight} 
                      onValueChange={(value) => updateElementProperty('fontWeight', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Light">Light</SelectItem>
                        <SelectItem value="Regular">Regular</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Bold">Bold</SelectItem>
                        <SelectItem value="Black">Black</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <div className="relative">
                      <Input 
                        value={localValues.fontSize}
                        onChange={(e) => handleInputChange('fontSize', e.target.value)}
                        onBlur={(e) => handleInputBlur('fontSize', e.target.value)}
                        className="h-9 pr-6" 
                      />
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">PX</span>
                    </div>
                  </div>
                </div>

                {/* Letter and Line Spacing */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 mb-1">
                      <div className="w-3 h-3 flex items-center justify-center">
                        <div className="w-1 h-1 bg-current rounded-full"></div>
                      </div>
                      <span className="text-xs text-muted-foreground">{localValues.letterSpacing}</span>
                      <span className="text-xs text-muted-foreground">px</span>
                    </div>
                    <div className="relative">
                      <Input 
                        value={localValues.letterSpacing}
                        onChange={(e) => handleInputChange('letterSpacing', e.target.value)}
                        onBlur={(e) => handleInputBlur('letterSpacing', e.target.value)}
                        className="h-8 pr-6" 
                      />
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">px</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 mb-1">
                      <div className="w-3 h-3 flex items-center justify-center">
                        <div className="flex flex-col gap-0.5">
                          <div className="w-2 h-0.5 bg-current"></div>
                          <div className="w-2 h-0.5 bg-current"></div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{localValues.lineSpacing}</span>
                    </div>
                    <div className="relative">
                      <Input 
                        value={localValues.lineSpacing}
                        onChange={(e) => handleInputChange('lineSpacing', e.target.value)}
                        onBlur={(e) => handleInputBlur('lineHeight', e.target.value)}
                        className="h-8 pr-6" 
                      />
                    </div>
                  </div>
                </div>

                {/* Text Alignment */}
                <div className="flex gap-1">
                  <Button
                    variant={(selectedElement as TextElement).textAlign === "left" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => updateElementProperty('textAlign', 'left')}
                    className="w-8 h-8 p-0"
                  >
                    <AlignLeft className="w-3 h-3" />
                  </Button>
                  <Button
                    variant={(selectedElement as TextElement).textAlign === "center" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => updateElementProperty('textAlign', 'center')}
                    className="w-8 h-8 p-0"
                  >
                    <AlignCenter className="w-3 h-3" />
                  </Button>
                  <Button
                    variant={(selectedElement as TextElement).textAlign === "right" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => updateElementProperty('textAlign', 'right')}
                    className="w-8 h-8 p-0"
                  >
                    <AlignRight className="w-3 h-3" />
                  </Button>
                </div>

                {/* Auto Size Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div className="w-2 h-2 border border-current rounded-sm flex items-center justify-center">
                        <div className="w-1 h-1 bg-current rounded-full"></div>
                      </div>
                    </div>
                    <span className="text-sm">Auto Size</span>
                  </div>
                  <Switch 
                    checked={(selectedElement as TextElement).autoSize} 
                    onCheckedChange={(checked) => updateElementProperty('autoSize', checked)} 
                  />
                </div>

                {/* Text Wrapping Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-accent-foreground" />
                    <span className="text-sm">Text Wrapping</span>
                  </div>
                  <Switch 
                    checked={(selectedElement as TextElement).textWrapping} 
                    onCheckedChange={(checked) => updateElementProperty('textWrapping', checked)} 
                  />
                </div>

                {/* Text Color */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: (selectedElement as TextElement).color }}
                      ></div>
                      <span className="text-sm">Text Color</span>
                    </div>
                    <Input
                      type="color"
                      value={(selectedElement as TextElement).color}
                      onChange={(e) => updateElementProperty('color', e.target.value)}
                      className="w-8 h-8 p-0 border-0"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Shape Properties */}
          {selectedElement.type === 'shape' && (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm text-muted-foreground uppercase tracking-wide">Shape</h3>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
                
                {/* Fill Source */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Fill Source</Label>
                  <Select 
                    value={(selectedElement as ShapeElement).fillType || 'solid'}
                    onValueChange={(value: 'solid' | 'image') => {
                      updateElementProperty('fillType', value);
                      if (value === 'solid') {
                        updateElementProperty('fillSource', undefined);
                        updateElementProperty('fillImageUrl', undefined);
                      }
                    }}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid Color</SelectItem>
                      <SelectItem value="image">Media Fill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Media Source Dropdown */}
                {(selectedElement as ShapeElement).fillType === 'image' && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Media Source</Label>
                      <Select 
                        value={(selectedElement as ShapeElement).fillSource || ''}
                        onValueChange={(value) => {
                          updateElementProperty('fillSource', value);
                          // Update the image URL based on the selected source
                          let imageUrl = '';
                          if (value.startsWith('uploaded-')) {
                            const assetId = value.replace('uploaded-', '');
                            const asset = uploadedAssets.find(a => a.id === assetId);
                            imageUrl = asset?.url || '';
                          } else {
                            imageUrl = getMediaUrl(value);
                          }
                          updateElementProperty('fillImageUrl', imageUrl);
                        }}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select media source" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(currentProduct.media).map(([key, media]) => (
                            <SelectItem key={key} value={key}>
                              {media.name}
                              {media.isFromFeed && <span className="text-xs text-primary ml-1">(Feed)</span>}
                            </SelectItem>
                          ))}
                          {uploadedAssets.filter(asset => asset.type === 'image').map((asset) => (
                            <SelectItem key={`uploaded-${asset.id}`} value={`uploaded-${asset.id}`}>
                              {asset.name}
                              <span className="text-xs text-accent-foreground ml-1">(Uploaded)</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Fill Mode Dropdown */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Fill Mode</Label>
                      <Select 
                        value={(selectedElement as ShapeElement).fillMode || 'cover'}
                        onValueChange={(value) => updateElementProperty('fillMode', value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cover">Cover (Crop to fill)</SelectItem>
                          <SelectItem value="contain">Contain (Fit entire image)</SelectItem>
                          <SelectItem value="stretch">Stretch (Distort to fit)</SelectItem>
                          <SelectItem value="center">Center (Original size)</SelectItem>
                          <SelectItem value="tile">Tile (Repeat pattern)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Image Preview */}
                    {(selectedElement as ShapeElement).fillImageUrl && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Preview</Label>
                        <div className="w-full h-20 bg-muted rounded overflow-hidden border">
                          <img 
                            src={(selectedElement as ShapeElement).fillImageUrl} 
                            alt="Fill preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Fill Color - only show for solid fills */}
                {(selectedElement as ShapeElement).fillType !== 'image' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: (selectedElement as ShapeElement).fillColor }}
                        ></div>
                        <span className="text-sm">Fill Color</span>
                      </div>
                      <Input
                        type="color"
                        value={(selectedElement as ShapeElement).fillColor}
                        onChange={(e) => updateElementProperty('fillColor', e.target.value)}
                        className="w-8 h-8 p-0 border-0"
                      />
                    </div>
                  </div>
                )}

                {/* Corner Radius for rectangles */}
                {(selectedElement as ShapeElement).shapeType === 'rectangle' && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Corner Radius</Label>
                    <div className="relative">
                      <Input 
                        value={(selectedElement as ShapeElement).cornerRadius?.toString() || '0'}
                        onChange={(e) => updateElementProperty('cornerRadius', parseInt(e.target.value) || 0)}
                        className="h-8 pr-6" 
                      />
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">px</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* SVG Fill Properties */}
          {selectedElement?.type === 'svg' && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm text-muted-foreground uppercase tracking-wide">SVG Fill</h3>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>

                {/* Fill Type Dropdown */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Fill Type</Label>
                  <Select 
                    value={(selectedElement as SVGElement).fillType || 'color'}
                    onValueChange={(value: 'color' | 'image') => {
                      updateElementProperty('fillType', value);
                      if (value === 'color') {
                        updateElementProperty('fillImageUrl', undefined);
                        updateElementProperty('fillSource', undefined);
                      }
                    }}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="color">Solid Color</SelectItem>
                      <SelectItem value="image">Media Fill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Color Fill */}
                {(selectedElement as SVGElement).fillType === 'color' && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Fill Color</Label>
                    <div className="relative">
                      <Input 
                        type="color"
                        value={(selectedElement as SVGElement).fillColor || '#000000'}
                        onChange={(e) => updateElementProperty('fillColor', e.target.value)}
                        className="h-8 w-full cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Media Source Dropdown */}
                {(selectedElement as SVGElement).fillType === 'image' && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Media Source</Label>
                      <Select 
                        value={(selectedElement as SVGElement).fillSource || ''}
                        onValueChange={(value) => {
                          updateElementProperty('fillSource', value);
                          // Update the image URL based on the selected source
                          let imageUrl = '';
                          if (value.startsWith('uploaded-')) {
                            const assetId = value.replace('uploaded-', '');
                            const asset = uploadedAssets.find(a => a.id === assetId);
                            imageUrl = asset?.url || '';
                          } else {
                            imageUrl = getMediaUrl(value);
                          }
                          updateElementProperty('fillImageUrl', imageUrl);
                        }}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select media source" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(currentProduct.media).map(([key, media]) => (
                            <SelectItem key={key} value={key}>
                              {media.name}
                              {media.isFromFeed && <span className="text-xs text-primary ml-1">(Feed)</span>}
                            </SelectItem>
                          ))}
                          {uploadedAssets.filter(asset => asset.type === 'image').map((asset) => (
                            <SelectItem key={`uploaded-${asset.id}`} value={`uploaded-${asset.id}`}>
                              {asset.name}
                              <span className="text-xs text-accent-foreground ml-1">(Uploaded)</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Fill Mode Dropdown */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Fill Mode</Label>
                      <Select 
                        value={(selectedElement as SVGElement).fillMode || 'cover'}
                        onValueChange={(value: 'cover' | 'contain' | 'stretch' | 'center' | 'tile') => 
                          updateElementProperty('fillMode', value)
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cover">Cover</SelectItem>
                          <SelectItem value="contain">Contain</SelectItem>
                          <SelectItem value="stretch">Stretch</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="tile">Tile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Image Preview */}
                    {(selectedElement as SVGElement).fillImageUrl && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Preview</Label>
                        <div className="w-full h-20 bg-muted rounded border overflow-hidden">
                          <img 
                            src={(selectedElement as SVGElement).fillImageUrl} 
                            alt="Fill preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Image Fill Properties */}
          {selectedElement?.type === 'image' && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm text-muted-foreground uppercase tracking-wide">Dynamic Fill</h3>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>

                {/* Fill Type Dropdown */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Fill Type</Label>
                  <Select 
                    value={(selectedElement as ImageElement).fillType || 'original'}
                    onValueChange={(value: 'original' | 'dynamic') => {
                      updateElementProperty('fillType', value);
                      if (value === 'original') {
                        updateElementProperty('fillImageUrl', undefined);
                        updateElementProperty('fillSource', undefined);
                      }
                    }}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">Original Image</SelectItem>
                      <SelectItem value="dynamic">Dynamic Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Media Source Dropdown */}
                {(selectedElement as ImageElement).fillType === 'dynamic' && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Media Source</Label>
                      <Select 
                        value={(selectedElement as ImageElement).fillSource || ''}
                        onValueChange={(value) => {
                          updateElementProperty('fillSource', value);
                          // Update the image URL based on the selected source
                          let imageUrl = '';
                          if (value.startsWith('uploaded-')) {
                            const assetId = value.replace('uploaded-', '');
                            const asset = uploadedAssets.find(a => a.id === assetId);
                            imageUrl = asset?.url || '';
                          } else {
                            imageUrl = getMediaUrl(value);
                          }
                          updateElementProperty('fillImageUrl', imageUrl);
                        }}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select media source" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(currentProduct.media).map(([key, media]) => (
                            <SelectItem key={key} value={key}>
                              {media.name}
                              {media.isFromFeed && <span className="text-xs text-primary ml-1">(Feed)</span>}
                            </SelectItem>
                          ))}
                          {uploadedAssets.filter(asset => asset.type === 'image').map((asset) => (
                            <SelectItem key={`uploaded-${asset.id}`} value={`uploaded-${asset.id}`}>
                              {asset.name}
                              <span className="text-xs text-accent-foreground ml-1">(Uploaded)</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Image Preview */}
                    {(selectedElement as ImageElement).fillImageUrl && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Preview</Label>
                        <div className="w-full h-20 bg-muted rounded border overflow-hidden">
                          <img 
                            src={(selectedElement as ImageElement).fillImageUrl} 
                            alt="Fill preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Corner Radius */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Corner Radius</Label>
                  <div className="relative">
                    <Input 
                      value={(selectedElement as ImageElement).cornerRadius?.toString() || '0'}
                      onChange={(e) => updateElementProperty('cornerRadius', parseInt(e.target.value) || 0)}
                      className="h-8 pr-6" 
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">px</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Additional Properties Section */}
          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm text-muted-foreground uppercase tracking-wide">Additional Properties</h3>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
            
            {/* Opacity Slider */}
            <div className="flex items-center gap-3">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <Slider
                  value={[selectedElement.opacity]}
                  onValueChange={(value) => updateElementProperty('opacity', value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <span className="text-sm text-muted-foreground min-w-[35px]">{selectedElement.opacity}%</span>
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span className="text-sm">Visible</span>
              </div>
              <Switch 
                checked={selectedElement.visible} 
                onCheckedChange={(checked) => updateElementProperty('visible', checked)} 
              />
            </div>

            {/* Lock Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-current rounded"></div>
                <span className="text-sm">Locked</span>
              </div>
              <Switch 
                checked={selectedElement.locked} 
                onCheckedChange={(checked) => updateElementProperty('locked', checked)} 
              />
            </div>

            {/* Text-specific stroke properties */}
            {selectedElement.type === 'text' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border border-current rounded"></div>
                    <span className="text-sm">Stroke</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={(selectedElement as TextElement).strokeColor || '#000000'}
                      onChange={(e) => updateElementProperty('strokeColor', e.target.value)}
                      className="w-6 h-6 p-0 border-0"
                    />
                    <div className="relative">
                      <Input 
                        value={(selectedElement as TextElement).strokeWidth.toString()} 
                        onChange={(e) => updateElementProperty('strokeWidth', parseInt(e.target.value) || 0)}
                        className="h-8 w-12 pr-6" 
                      />
                      <span className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">px</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shape-specific stroke properties */}
            {selectedElement.type === 'shape' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border border-current rounded"></div>
                    <span className="text-sm">Stroke</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={(selectedElement as ShapeElement).strokeColor || '#000000'}
                      onChange={(e) => updateElementProperty('strokeColor', e.target.value)}
                      className="w-6 h-6 p-0 border-0"
                    />
                    <div className="relative">
                      <Input 
                        value={(selectedElement as ShapeElement).strokeWidth.toString()} 
                        onChange={(e) => updateElementProperty('strokeWidth', parseInt(e.target.value) || 0)}
                        className="h-8 w-12 pr-6" 
                      />
                      <span className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">px</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}