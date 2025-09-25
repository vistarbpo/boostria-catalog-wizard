import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Slider } from "../ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
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
import { useCanvasStore } from "../../hooks/useCanvasStore";
import { TextElement, ShapeElement, ImageElement, SVGElement } from "../../types/canvas";
import { useProduct } from "../../contexts/ProductContext";

interface PropertiesPanelProps {
  canvasStore: ReturnType<typeof useCanvasStore>;
}

export function PropertiesPanel({ canvasStore }: PropertiesPanelProps) {
  const selectedElement = canvasStore.getSelectedElement();
  
  // Add error handling for useProduct
  let productContext;
  try {
    productContext = useProduct();
  } catch (error) {
    console.error('ProductProvider error in PropertiesPanel:', error);
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
  
  const { currentProduct, getMediaUrl, uploadedAssets } = productContext;
  
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
  }, [selectedElement?.id, selectedElement?.type]);

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
    <div className="w-80 bg-card border-l border-border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold capitalize">{selectedElement.type} Properties</h3>
          <Badge variant="secondary" className="text-xs">
            {selectedElement.id.slice(0, 8)}
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Basic Properties */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Transform</h4>
            
            {/* Position */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">X Position</Label>
                <Input
                  type="number"
                  value={Math.round(selectedElement.position.x)}
                  onChange={(e) => updateElementProperty('position', {
                    ...selectedElement.position,
                    x: parseFloat(e.target.value) || 0
                  })}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">Y Position</Label>
                <Input
                  type="number"
                  value={Math.round(selectedElement.position.y)}
                  onChange={(e) => updateElementProperty('position', {
                    ...selectedElement.position,
                    y: parseFloat(e.target.value) || 0
                  })}
                  className="h-8"
                />
              </div>
            </div>

            {/* Size */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Width</Label>
                <Input
                  type="number"
                  value={Math.round(selectedElement.size.width)}
                  onChange={(e) => updateElementProperty('size', {
                    ...selectedElement.size,
                    width: parseFloat(e.target.value) || 1
                  })}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">Height</Label>
                <Input
                  type="number"
                  value={Math.round(selectedElement.size.height)}
                  onChange={(e) => updateElementProperty('size', {
                    ...selectedElement.size,
                    height: parseFloat(e.target.value) || 1
                  })}
                  className="h-8"
                />
              </div>
            </div>

            {/* Rotation & Opacity */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Rotation (°)</Label>
                <Input
                  type="number"
                  value={selectedElement.rotation}
                  onChange={(e) => updateElementProperty('rotation', parseFloat(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">Opacity (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={selectedElement.opacity}
                  onChange={(e) => updateElementProperty('opacity', parseFloat(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
            </div>

            {/* Visibility & Lock */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={selectedElement.visible}
                  onCheckedChange={(checked) => updateElementProperty('visible', checked)}
                />
                <Label className="text-xs">Visible</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={selectedElement.locked}
                  onCheckedChange={(checked) => updateElementProperty('locked', checked)}
                />
                <Label className="text-xs">Locked</Label>
              </div>
            </div>
          </div>

          {/* Element-specific properties */}
          {selectedElement.type === 'text' && (
            <div className="space-y-4">
              <Separator />
              <h4 className="text-sm font-medium">Text Properties</h4>
              
              {/* Text Content */}
              <div>
                <Label className="text-xs">Content</Label>
                <Input
                  value={localValues.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  onBlur={(e) => handleInputBlur('content', e.target.value)}
                  placeholder="Enter text..."
                  className="h-8"
                />
              </div>

              {/* Font Properties */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Font Size</Label>
                  <Input
                    type="number"
                    value={localValues.fontSize}
                    onChange={(e) => handleInputChange('fontSize', e.target.value)}
                    onBlur={(e) => handleInputBlur('fontSize', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Font Weight</Label>
                  <Select
                    value={(selectedElement as TextElement).fontWeight}
                    onValueChange={(value) => updateElementProperty('fontWeight', value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Regular">Regular</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Bold">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Text Color */}
              <div>
                <Label className="text-xs">Text Color</Label>
                <Input
                  type="color"
                  value={(selectedElement as TextElement).color}
                  onChange={(e) => updateElementProperty('color', e.target.value)}
                  className="h-8"
                />
              </div>

              {/* Text Alignment */}
              <div>
                <Label className="text-xs mb-2 block">Text Alignment</Label>
                <div className="flex gap-1">
                  {[
                    { value: 'left', icon: AlignLeft },
                    { value: 'center', icon: AlignCenter },
                    { value: 'right', icon: AlignRight }
                  ].map((align) => (
                    <Button
                      key={align.value}
                      variant={(selectedElement as TextElement).textAlign === align.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateElementProperty('textAlign', align.value)}
                      className="h-8 w-8 p-0"
                    >
                      <align.icon className="w-4 h-4" />
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedElement.type === 'shape' && (
            <div className="space-y-4">
              <Separator />
              <h4 className="text-sm font-medium">Shape Properties</h4>
              
              {/* Fill Color */}
              <div>
                <Label className="text-xs">Fill Color</Label>
                <Input
                  type="color"
                  value={(selectedElement as ShapeElement).fillColor}
                  onChange={(e) => updateElementProperty('fillColor', e.target.value)}
                  className="h-8"
                />
              </div>

              {/* Stroke */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Stroke Color</Label>
                  <Input
                    type="color"
                    value={(selectedElement as ShapeElement).strokeColor || '#000000'}
                    onChange={(e) => updateElementProperty('strokeColor', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Stroke Width</Label>
                  <Input
                    type="number"
                    min="0"
                    value={(selectedElement as ShapeElement).strokeWidth}
                    onChange={(e) => updateElementProperty('strokeWidth', parseFloat(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>
              </div>

              {/* Corner Radius for rectangles */}
              {(selectedElement as ShapeElement).shapeType === 'rectangle' && (
                <div>
                  <Label className="text-xs">Corner Radius</Label>
                  <Input
                    type="number"
                    min="0"
                    value={(selectedElement as ShapeElement).cornerRadius || 0}
                    onChange={(e) => updateElementProperty('cornerRadius', parseFloat(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>
              )}
            </div>
          )}

          {selectedElement.type === 'image' && (
            <div className="space-y-4">
              <Separator />
              <h4 className="text-sm font-medium">Image Properties</h4>
              
              {/* Object Fit */}
              <div>
                <Label className="text-xs">Object Fit</Label>
                <Select
                  value={(selectedElement as ImageElement).objectFit}
                  onValueChange={(value) => updateElementProperty('objectFit', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cover">Cover</SelectItem>
                    <SelectItem value="contain">Contain</SelectItem>
                    <SelectItem value="fill">Fill</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Corner Radius */}
              <div>
                <Label className="text-xs">Corner Radius</Label>
                <Input
                  type="number"
                  min="0"
                  value={(selectedElement as ImageElement).cornerRadius || 0}
                  onChange={(e) => updateElementProperty('cornerRadius', parseFloat(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
            </div>
          )}

          {/* Z-Index */}
          <div className="space-y-4">
            <Separator />
            <div>
              <Label className="text-xs">Layer Order</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateElementProperty('zIndex', selectedElement.zIndex + 1)}
                  className="flex-1"
                >
                  Bring Forward
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateElementProperty('zIndex', Math.max(0, selectedElement.zIndex - 1))}
                  className="flex-1"
                >
                  Send Backward
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Separator />
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Duplicate element
                  const newElement = { 
                    ...selectedElement, 
                    id: Math.random().toString(36).substr(2, 9),
                    position: { 
                      x: selectedElement.position.x + 20, 
                      y: selectedElement.position.y + 20 
                    }
                  };
                  canvasStore.updateElement(newElement.id, newElement);
                }}
                className="w-full"
              >
                Duplicate Element
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => canvasStore.deleteElement(selectedElement.id)}
                className="w-full"
              >
                Delete Element
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}