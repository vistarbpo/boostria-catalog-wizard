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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { AlignLeft, AlignCenter, AlignRight, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, Bold, Italic, Underline, Strikethrough, Palette, Plus, MoreHorizontal, ChevronDown, Link as LinkIcon, Eye, Square, Maximize2, RotateCcw, Type, Grid3X3, ArrowUp, ArrowDown, Trash2, Link2, Settings, Ungroup } from "lucide-react";
import { ColorPicker } from "../ui/color-picker";
import { useCanvasStore } from "../../hooks/useCanvasStore";
import { TextElement, ShapeElement, ImageElement, SVGElement, ButtonElement, GroupElement } from "../../types/canvas";
import { useProduct } from "../../contexts/ProductContext";
import { CanvasSettings } from "./CanvasSettings";
import { DynamicFieldSettings } from "./DynamicFieldSettings";
interface PropertiesPanelProps {
  canvasStore: ReturnType<typeof useCanvasStore>;
}
export function PropertiesPanel({
  canvasStore
}: PropertiesPanelProps) {
  const selectedElement = canvasStore.getSelectedElement();

  // Add error handling for useProduct
  const {
    currentProduct,
    getMediaUrl,
    uploadedAssets
  } = useProduct();

  // Local state for controlled inputs
  const [localValues, setLocalValues] = useState({
    content: '',
    fontSize: '32',
    letterSpacing: '0',
    lineSpacing: '1.2'
  });

  // State for corner radius linking
  const [cornerRadiusLinked, setCornerRadiusLinked] = useState(true);
  
  // State for dynamic field settings dialog
  const [dynamicSettingsOpen, setDynamicSettingsOpen] = useState(false);

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
      canvasStore.updateElement(selectedElement.id, {
        [property]: value
      });
    }
  };
  const handleInputChange = (property: keyof typeof localValues, value: string) => {
    setLocalValues(prev => ({
      ...prev,
      [property]: value
    }));
  };
  const handleInputBlur = (property: string, value: string) => {
    if (selectedElement) {
      let processedValue: any = value;

      // Convert string values to appropriate types
      if (property === 'fontSize' || property === 'letterSpacing') {
        const numValue = parseFloat(value);
        processedValue = isNaN(numValue) ? 0 : Math.max(1, numValue); // Ensure minimum of 1 for fontSize
      } else if (property === 'lineHeight') {
        const numValue = parseFloat(value);
        processedValue = isNaN(numValue) ? 1.2 : Math.max(0.5, numValue);
      }
      canvasStore.updateElement(selectedElement.id, {
        [property]: processedValue
      });
    }
  };

  // Real-time font size updates
  const handleFontSizeChange = (value: string) => {
    handleInputChange('fontSize', value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0 && selectedElement) {
      canvasStore.updateElement(selectedElement.id, {
        fontSize: numValue
      });
    }
  };
  const alignToCanvas = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (!selectedElement) return;
    const canvasWidth = canvasStore.canvasState.canvasSize.width;
    const canvasHeight = canvasStore.canvasState.canvasSize.height;
    const elementWidth = selectedElement.size.width;
    const elementHeight = selectedElement.size.height;
    let newPosition = {
      ...selectedElement.position
    };
    switch (alignment) {
      case 'left':
        newPosition.x = 0;
        break;
      case 'center':
        newPosition.x = (canvasWidth - elementWidth) / 2;
        break;
      case 'right':
        newPosition.x = canvasWidth - elementWidth;
        break;
      case 'top':
        newPosition.y = 0;
        break;
      case 'middle':
        newPosition.y = (canvasHeight - elementHeight) / 2;
        break;
      case 'bottom':
        newPosition.y = canvasHeight - elementHeight;
        break;
    }
    updateElementProperty('position', newPosition);
  };
  if (!selectedElement) {
    return <div className="w-80 bg-card border-l border-border h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold">Canvas Settings</h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4">
            <CanvasSettings canvasStore={canvasStore} />
          </div>
        </ScrollArea>
      </div>;
  }
  return <div className="w-80 bg-card border-l border-border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold capitalize">
            {selectedElement.type === 'group' ? 'Group' : selectedElement.type} Properties
          </h3>
          <Badge variant="secondary" className="text-xs">
            {selectedElement.type === 'group' ? `${(selectedElement as any).children?.length || 0} items` : selectedElement.id.slice(0, 8)}
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
                <Input type="number" value={Math.round(selectedElement.position.x)} onChange={e => updateElementProperty('position', {
                ...selectedElement.position,
                x: parseFloat(e.target.value) || 0
              })} className="h-8" />
              </div>
              <div>
                <Label className="text-xs">Y Position</Label>
                <Input type="number" value={Math.round(selectedElement.position.y)} onChange={e => updateElementProperty('position', {
                ...selectedElement.position,
                y: parseFloat(e.target.value) || 0
              })} className="h-8" />
              </div>
            </div>

            {/* Size */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Width</Label>
                <Input type="number" value={Math.round(selectedElement.size.width)} onChange={e => updateElementProperty('size', {
                ...selectedElement.size,
                width: parseFloat(e.target.value) || 1
              })} className="h-8" />
              </div>
              <div>
                <Label className="text-xs">Height</Label>
                <Input type="number" value={Math.round(selectedElement.size.height)} onChange={e => updateElementProperty('size', {
                ...selectedElement.size,
                height: parseFloat(e.target.value) || 1
              })} className="h-8" />
              </div>
            </div>

            {/* Rotation & Opacity */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Rotation (°)</Label>
                <Input type="number" value={selectedElement.rotation} onChange={e => updateElementProperty('rotation', parseFloat(e.target.value) || 0)} className="h-8" />
              </div>
              <div>
                <Label className="text-xs">Opacity (%)</Label>
                <Input type="number" min="0" max="100" value={selectedElement.opacity} onChange={e => updateElementProperty('opacity', parseFloat(e.target.value) || 0)} className="h-8" />
              </div>
            </div>

            {/* Alignment */}
            <div>
              <Label className="text-xs mb-2 block">Align</Label>
              <div className="grid grid-cols-6 gap-1">
                <Button variant="outline" size="sm" onClick={() => alignToCanvas('left')} className="h-8 p-0" title="Align Left">
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => alignToCanvas('center')} className="h-8 p-0" title="Align Center Horizontal">
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => alignToCanvas('right')} className="h-8 p-0" title="Align Right">
                  <AlignRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => alignToCanvas('top')} className="h-8 p-0" title="Align Top">
                  <AlignVerticalJustifyStart className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => alignToCanvas('middle')} className="h-8 p-0" title="Align Center Vertical">
                  <AlignVerticalJustifyCenter className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => alignToCanvas('bottom')} className="h-8 p-0" title="Align Bottom">
                  <AlignVerticalJustifyEnd className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Visibility & Lock */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch checked={selectedElement.visible} onCheckedChange={checked => updateElementProperty('visible', checked)} />
                <Label className="text-xs">Visible</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={selectedElement.locked} onCheckedChange={checked => updateElementProperty('locked', checked)} />
                <Label className="text-xs">Locked</Label>
              </div>
            </div>

            {/* Delete Button */}
            <div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Element
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Element</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this {selectedElement.type} element? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => canvasStore.deleteElement(selectedElement.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Element-specific properties */}
          {selectedElement.type === 'text' && <div className="space-y-4">
              <Separator />
              <h4 className="text-sm font-medium">Text Properties</h4>
              
              {/* Text Content */}
              <div>
                <Label className="text-xs">Content</Label>
                <div className="flex gap-2">
                  <Input 
                    value={localValues.content} 
                    onChange={e => handleInputChange('content', e.target.value)} 
                    onBlur={e => handleInputBlur('content', e.target.value)} 
                    placeholder="Enter text..." 
                    className="h-8 flex-1" 
                  />
                  {(selectedElement as TextElement).isDynamic && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDynamicSettingsOpen(true)}
                      className="h-8 px-2"
                      title="Dynamic Field Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {(selectedElement as TextElement).isDynamic && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Dynamic: {(selectedElement as TextElement).dynamicField}
                  </Badge>
                )}
              </div>

              {/* Dynamic Field Settings Dialog */}
              {(selectedElement as TextElement).isDynamic && (
                <DynamicFieldSettings
                  element={selectedElement as TextElement}
                  open={dynamicSettingsOpen}
                  onClose={() => setDynamicSettingsOpen(false)}
                  onUpdate={(updates) => {
                    canvasStore.updateElement(selectedElement.id, updates);
                  }}
                />
              )}

              {/* Font Properties */}
              <div className="space-y-3">
                {/* Font Family */}
                <div>
                  <Label className="text-xs">Font Family</Label>
                  <Select value={(selectedElement as TextElement).fontFamily || 'Inter'} onValueChange={value => updateElementProperty('fontFamily', value)}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-popover">
                      <SelectItem value="Inter">Inter (Modern Sans)</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Lato">Lato</SelectItem>
                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Nunito">Nunito</SelectItem>
                      <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                      <SelectItem value="Raleway">Raleway</SelectItem>
                      <SelectItem value="Ubuntu">Ubuntu</SelectItem>
                      <SelectItem value="Oswald">Oswald (Display)</SelectItem>
                      <SelectItem value="Playfair Display">Playfair Display (Serif)</SelectItem>
                      <SelectItem value="Merriweather">Merriweather (Serif)</SelectItem>
                      <SelectItem value="Lora">Lora (Serif)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Font Size</Label>
                    <Input type="number" min="1" value={localValues.fontSize} onChange={e => handleFontSizeChange(e.target.value)} className="h-8" />
                  </div>
                  <div>
                    <Label className="text-xs">Font Weight</Label>
                    <Select value={(selectedElement as TextElement).fontWeight} onValueChange={value => updateElementProperty('fontWeight', value)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-popover">
                        <SelectItem value="300">Light (300)</SelectItem>
                        <SelectItem value="400">Regular (400)</SelectItem>
                        <SelectItem value="500">Medium (500)</SelectItem>
                        <SelectItem value="600">Semi Bold (600)</SelectItem>
                        <SelectItem value="700">Bold (700)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Text Color */}
              <div>
                <Label className="text-xs mb-1 block">Text Color</Label>
                <ColorPicker
                  value={(selectedElement as TextElement).color}
                  onChange={(color) => updateElementProperty('color', color)}
                />
              </div>

              {/* Text Alignment */}
              <div>
                <Label className="text-xs mb-2 block">Text Alignment</Label>
                <div className="flex gap-1">
                  {[{
                value: 'left',
                icon: AlignLeft
              }, {
                value: 'center',
                icon: AlignCenter
              }, {
                value: 'right',
                icon: AlignRight
              }].map(align => <Button key={align.value} variant={(selectedElement as TextElement).textAlign === align.value ? "default" : "outline"} size="sm" onClick={() => updateElementProperty('textAlign', align.value)} className="h-8 w-8 p-0">
                      <align.icon className="w-4 h-4" />
                    </Button>)}
                </div>
              </div>

              {/* Text Decoration */}
              <div>
                <Label className="text-xs mb-2 block">Decoration</Label>
                <div className="flex gap-1">
                  <Button 
                    variant={(selectedElement as TextElement).textDecoration === 'none' || !(selectedElement as TextElement).textDecoration ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => updateElementProperty('textDecoration', 'none')} 
                    className="h-8 flex-1"
                    title="None"
                  >
                    —
                  </Button>
                  <Button 
                    variant={(selectedElement as TextElement).textDecoration === 'underline' ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => updateElementProperty('textDecoration', 'underline')} 
                    className="h-8 w-8 p-0"
                    title="Underline"
                  >
                    <Underline className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant={(selectedElement as TextElement).textDecoration === 'line-through' ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => updateElementProperty('textDecoration', 'line-through')} 
                    className="h-8 w-8 p-0"
                    title="Strikethrough"
                  >
                    <Strikethrough className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Text Case Transform */}
              <div>
                <Label className="text-xs mb-2 block">Case</Label>
                <div className="grid grid-cols-5 gap-1">
                  <Button 
                    variant={(selectedElement as TextElement).textTransform === 'none' || !(selectedElement as TextElement).textTransform ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => updateElementProperty('textTransform', 'none')} 
                    className="h-8 text-xs"
                    title="None"
                  >
                    —
                  </Button>
                  <Button 
                    variant={(selectedElement as TextElement).textTransform === 'uppercase' ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => updateElementProperty('textTransform', 'uppercase')} 
                    className="h-8 text-xs font-semibold"
                    title="Uppercase"
                  >
                    AG
                  </Button>
                  <Button 
                    variant={(selectedElement as TextElement).textTransform === 'lowercase' ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => updateElementProperty('textTransform', 'lowercase')} 
                    className="h-8 text-xs"
                    title="Lowercase"
                  >
                    ag
                  </Button>
                  <Button 
                    variant={(selectedElement as TextElement).textTransform === 'capitalize' ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => updateElementProperty('textTransform', 'capitalize')} 
                    className="h-8 text-xs"
                    title="Capitalize"
                  >
                    Ag
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled
                    className="h-8 text-xs opacity-50"
                    title="More options"
                  >
                    ›
                  </Button>
                </div>
              </div>

              {/* Text Direction (RTL/LTR) */}
              <div>
                <Label className="text-xs">Text Direction</Label>
                <Select value={(selectedElement as TextElement).direction || 'ltr'} onValueChange={value => updateElementProperty('direction', value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover">
                    <SelectItem value="ltr">Left to Right (LTR)</SelectItem>
                    <SelectItem value="rtl">Right to Left (RTL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Letter Spacing */}
              <div>
                <Label className="text-xs">Letter Spacing (px)</Label>
                <Input type="number" value={localValues.letterSpacing} onChange={e => handleInputChange('letterSpacing', e.target.value)} onBlur={e => handleInputBlur('letterSpacing', e.target.value)} className="h-8" step="0.1" />
              </div>

              {/* Line Height */}
              <div>
                <Label className="text-xs">Line Height</Label>
                <Input type="number" value={localValues.lineSpacing} onChange={e => handleInputChange('lineSpacing', e.target.value)} onBlur={e => handleInputBlur('lineHeight', e.target.value)} className="h-8" step="0.1" min="0.5" max="3" />
              </div>
            </div>}

          {selectedElement.type === 'button' && <div className="space-y-4">
              <Separator />
              <h4 className="text-sm font-medium">Button Properties</h4>
              
              {/* Button Content */}
              <div>
                <Label className="text-xs">Button Text</Label>
                <Input 
                  value={(selectedElement as ButtonElement).content} 
                  onChange={e => updateElementProperty('content', e.target.value)} 
                  placeholder="Enter button text..." 
                  className="h-8" 
                />
              </div>

              {/* Font Properties */}
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Font Family</Label>
                  <Select value={(selectedElement as ButtonElement).fontFamily || 'Inter'} onValueChange={value => updateElementProperty('fontFamily', value)}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-popover">
                      <SelectItem value="Inter">Inter (Modern Sans)</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Lato">Lato</SelectItem>
                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Nunito">Nunito</SelectItem>
                      <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                      <SelectItem value="Raleway">Raleway</SelectItem>
                      <SelectItem value="Ubuntu">Ubuntu</SelectItem>
                      <SelectItem value="Oswald">Oswald (Display)</SelectItem>
                      <SelectItem value="Playfair Display">Playfair Display (Serif)</SelectItem>
                      <SelectItem value="Merriweather">Merriweather (Serif)</SelectItem>
                      <SelectItem value="Lora">Lora (Serif)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Font Size</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      value={(selectedElement as ButtonElement).fontSize} 
                      onChange={e => updateElementProperty('fontSize', parseFloat(e.target.value) || 16)} 
                      className="h-8" 
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Font Weight</Label>
                    <Select value={(selectedElement as ButtonElement).fontWeight} onValueChange={value => updateElementProperty('fontWeight', value)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-popover">
                        <SelectItem value="300">Light (300)</SelectItem>
                        <SelectItem value="400">Regular (400)</SelectItem>
                        <SelectItem value="500">Medium (500)</SelectItem>
                        <SelectItem value="600">Semi Bold (600)</SelectItem>
                        <SelectItem value="700">Bold (700)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs mb-1 block">Text Color</Label>
                  <ColorPicker
                    value={(selectedElement as ButtonElement).color}
                    onChange={(color) => updateElementProperty('color', color)}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Background Color</Label>
                  <ColorPicker
                    value={(selectedElement as ButtonElement).backgroundColor}
                    onChange={(color) => updateElementProperty('backgroundColor', color)}
                  />
                </div>
              </div>

              {/* Text Alignment */}
              <div>
                <Label className="text-xs mb-2 block">Text Alignment</Label>
                <div className="flex gap-1">
                  {[{
                value: 'left',
                icon: AlignLeft
              }, {
                value: 'center',
                icon: AlignCenter
              }, {
                value: 'right',
                icon: AlignRight
              }].map(align => <Button key={align.value} variant={(selectedElement as ButtonElement).textAlign === align.value ? "default" : "outline"} size="sm" onClick={() => updateElementProperty('textAlign', align.value)} className="h-8 w-8 p-0">
                      <align.icon className="w-4 h-4" />
                    </Button>)}
                </div>
              </div>

              {/* Text Direction (RTL support) */}
              <div>
                <Label className="text-xs">Text Direction</Label>
                <Select value={(selectedElement as ButtonElement).direction || 'ltr'} onValueChange={value => updateElementProperty('direction', value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ltr">Left to Right (LTR)</SelectItem>
                    <SelectItem value="rtl">Right to Left (RTL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Padding */}
              <div className="space-y-2">
                <Label className="text-xs">Padding (px)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Top</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      value={(selectedElement as ButtonElement).padding.top} 
                      onChange={e => updateElementProperty('padding', {
                        ...(selectedElement as ButtonElement).padding,
                        top: parseFloat(e.target.value) || 0
                      })} 
                      className="h-8" 
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Right</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      value={(selectedElement as ButtonElement).padding.right} 
                      onChange={e => updateElementProperty('padding', {
                        ...(selectedElement as ButtonElement).padding,
                        right: parseFloat(e.target.value) || 0
                      })} 
                      className="h-8" 
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Bottom</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      value={(selectedElement as ButtonElement).padding.bottom} 
                      onChange={e => updateElementProperty('padding', {
                        ...(selectedElement as ButtonElement).padding,
                        bottom: parseFloat(e.target.value) || 0
                      })} 
                      className="h-8" 
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Left</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      value={(selectedElement as ButtonElement).padding.left} 
                      onChange={e => updateElementProperty('padding', {
                        ...(selectedElement as ButtonElement).padding,
                        left: parseFloat(e.target.value) || 0
                      })} 
                      className="h-8" 
                    />
                  </div>
                </div>
              </div>

              {/* Corner Radius */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Corner Radius</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setCornerRadiusLinked(!cornerRadiusLinked)}
                    title={cornerRadiusLinked ? "Unlink corners" : "Link corners"}
                  >
                    <Link2 className={`w-3 h-3 ${cornerRadiusLinked ? '' : 'opacity-30'}`} />
                  </Button>
                </div>
                {cornerRadiusLinked ? (
                  <Input 
                    type="number" 
                    min="0" 
                    value={(selectedElement as ButtonElement).cornerRadii?.topLeft ?? (selectedElement as ButtonElement).cornerRadius ?? 0} 
                    onChange={e => {
                      const value = parseFloat(e.target.value) || 0;
                      updateElementProperty('cornerRadii', {
                        topLeft: value,
                        topRight: value,
                        bottomLeft: value,
                        bottomRight: value,
                      });
                    }} 
                    className="h-8" 
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Top Left</Label>
                      <Input 
                        type="number" 
                        min="0" 
                        value={(selectedElement as ButtonElement).cornerRadii?.topLeft ?? 0} 
                        onChange={e => {
                          const current = (selectedElement as ButtonElement).cornerRadii || { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 };
                          updateElementProperty('cornerRadii', {
                            ...current,
                            topLeft: parseFloat(e.target.value) || 0
                          });
                        }} 
                        className="h-8" 
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Top Right</Label>
                      <Input 
                        type="number" 
                        min="0" 
                        value={(selectedElement as ButtonElement).cornerRadii?.topRight ?? 0} 
                        onChange={e => {
                          const current = (selectedElement as ButtonElement).cornerRadii || { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 };
                          updateElementProperty('cornerRadii', {
                            ...current,
                            topRight: parseFloat(e.target.value) || 0
                          });
                        }} 
                        className="h-8" 
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Bottom Left</Label>
                      <Input 
                        type="number" 
                        min="0" 
                        value={(selectedElement as ButtonElement).cornerRadii?.bottomLeft ?? 0} 
                        onChange={e => {
                          const current = (selectedElement as ButtonElement).cornerRadii || { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 };
                          updateElementProperty('cornerRadii', {
                            ...current,
                            bottomLeft: parseFloat(e.target.value) || 0
                          });
                        }} 
                        className="h-8" 
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Bottom Right</Label>
                      <Input 
                        type="number" 
                        min="0" 
                        value={(selectedElement as ButtonElement).cornerRadii?.bottomRight ?? 0} 
                        onChange={e => {
                          const current = (selectedElement as ButtonElement).cornerRadii || { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 };
                          updateElementProperty('cornerRadii', {
                            ...current,
                            bottomRight: parseFloat(e.target.value) || 0
                          });
                        }} 
                        className="h-8" 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Border */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Border Color</Label>
                  <Input type="color" value={(selectedElement as ButtonElement).borderColor || '#000000'} onChange={e => updateElementProperty('borderColor', e.target.value)} className="h-8" />
                </div>
                <div>
                  <Label className="text-xs">Border Width</Label>
                  <Input type="number" min="0" value={(selectedElement as ButtonElement).borderWidth} onChange={e => updateElementProperty('borderWidth', parseFloat(e.target.value) || 0)} className="h-8" />
                </div>
              </div>
            </div>}

          {selectedElement.type === 'shape' && <div className="space-y-4">
              <Separator />
              <h4 className="text-sm font-medium">Shape Properties</h4>
              
              {/* Fill Source */}
              <div>
                <Label className="text-xs">Fill Source</Label>
                <Select value={(selectedElement as ShapeElement).fillType || 'solid'} onValueChange={value => {
              updateElementProperty('fillType', value);
              if (value === 'solid') {
                updateElementProperty('fillSource', undefined);
                updateElementProperty('fillImageUrl', undefined);
              }
            }}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid Fill</SelectItem>
                    <SelectItem value="image">Media Fill</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fill Color (only for solid fill) */}
              {((selectedElement as ShapeElement).fillType === 'solid' || !(selectedElement as ShapeElement).fillType) && <div>
                  <Label className="text-xs mb-1 block">Fill Color</Label>
                  <ColorPicker
                    value={(selectedElement as ShapeElement).fillColor}
                    onChange={(color) => updateElementProperty('fillColor', color)}
                  />
                </div>}

              {/* Media Source (only for image fill) */}
              {(selectedElement as ShapeElement).fillType === 'image' && <div className="space-y-2">
                  <div>
                    <Label className="text-xs">Media Source</Label>
                    <Select value={(selectedElement as ShapeElement).fillSource || ''} onValueChange={value => {
                updateElementProperty('fillSource', value);
                const imageUrl = getMediaUrl(value);
                if (imageUrl) {
                  updateElementProperty('fillImageUrl', imageUrl);
                }
              }}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select media source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image_link">Main Image</SelectItem>
                        <SelectItem value="additional_image_link">Additional Image</SelectItem>
                        <SelectItem value="additional_image_link_2">Detail Image</SelectItem>
                        <SelectItem value="brand_logo">Brand Logo</SelectItem>
                        {uploadedAssets.map(asset => <SelectItem key={asset.id} value={asset.id}>
                            {asset.name}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Fill Mode */}
                  <div>
                    <Label className="text-xs">Fill Mode</Label>
                    <Select value={(selectedElement as ShapeElement).fillMode || 'cover'} onValueChange={value => updateElementProperty('fillMode', value)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cover">Cover (Crop to fill)</SelectItem>
                        <SelectItem value="contain">Contain (Fit inside)</SelectItem>
                        <SelectItem value="stretch">Stretch (Distort to fit)</SelectItem>
                        <SelectItem value="center">Center (Original size)</SelectItem>
                        <SelectItem value="tile">Tile (Repeat pattern)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Preview */}
                  {(selectedElement as ShapeElement).fillImageUrl && <div className="mt-2">
                      <Label className="text-xs">Preview</Label>
                      <div className="w-full h-20 border rounded overflow-hidden bg-muted flex items-center justify-center">
                        <img src={(selectedElement as ShapeElement).fillImageUrl} alt="Fill preview" className="max-w-full max-h-full object-contain" />
                      </div>
                    </div>}
                </div>}

              {/* Stroke */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs mb-1 block">Stroke Color</Label>
                  <ColorPicker
                    value={(selectedElement as ShapeElement).strokeColor || '#000000'}
                    onChange={(color) => updateElementProperty('strokeColor', color)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Stroke Width</Label>
                  <Input type="number" min="0" value={(selectedElement as ShapeElement).strokeWidth} onChange={e => updateElementProperty('strokeWidth', parseFloat(e.target.value) || 0)} className="h-8" />
                </div>
              </div>

              {/* Corner Radius for rectangles */}
              {(selectedElement as ShapeElement).shapeType === 'rectangle' && <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Corner Radius</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setCornerRadiusLinked(!cornerRadiusLinked)}
                      title={cornerRadiusLinked ? "Unlink corners" : "Link corners"}
                    >
                      <Link2 className={`w-3 h-3 ${cornerRadiusLinked ? '' : 'opacity-30'}`} />
                    </Button>
                  </div>
                  {cornerRadiusLinked ? (
                    <Input 
                      type="number" 
                      min="0" 
                      value={(selectedElement as ShapeElement).cornerRadii?.topLeft ?? (selectedElement as ShapeElement).cornerRadius ?? 0} 
                      onChange={e => {
                        const value = parseFloat(e.target.value) || 0;
                        updateElementProperty('cornerRadii', {
                          topLeft: value,
                          topRight: value,
                          bottomLeft: value,
                          bottomRight: value,
                        });
                      }} 
                      className="h-8" 
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Input 
                          type="number" 
                          min="0" 
                          value={(selectedElement as ShapeElement).cornerRadii?.topLeft ?? (selectedElement as ShapeElement).cornerRadius ?? 0} 
                          onChange={e => {
                            const value = parseFloat(e.target.value) || 0;
                            const currentRadii = (selectedElement as ShapeElement).cornerRadii || {
                              topLeft: (selectedElement as ShapeElement).cornerRadius || 0,
                              topRight: (selectedElement as ShapeElement).cornerRadius || 0,
                              bottomLeft: (selectedElement as ShapeElement).cornerRadius || 0,
                              bottomRight: (selectedElement as ShapeElement).cornerRadius || 0,
                            };
                            updateElementProperty('cornerRadii', { ...currentRadii, topLeft: value });
                          }} 
                          className="h-8 text-center" 
                          placeholder="TL"
                        />
                      </div>
                      <div>
                        <Input 
                          type="number" 
                          min="0" 
                          value={(selectedElement as ShapeElement).cornerRadii?.topRight ?? (selectedElement as ShapeElement).cornerRadius ?? 0} 
                          onChange={e => {
                            const value = parseFloat(e.target.value) || 0;
                            const currentRadii = (selectedElement as ShapeElement).cornerRadii || {
                              topLeft: (selectedElement as ShapeElement).cornerRadius || 0,
                              topRight: (selectedElement as ShapeElement).cornerRadius || 0,
                              bottomLeft: (selectedElement as ShapeElement).cornerRadius || 0,
                              bottomRight: (selectedElement as ShapeElement).cornerRadius || 0,
                            };
                            updateElementProperty('cornerRadii', { ...currentRadii, topRight: value });
                          }} 
                          className="h-8 text-center" 
                          placeholder="TR"
                        />
                      </div>
                      <div>
                        <Input 
                          type="number" 
                          min="0" 
                          value={(selectedElement as ShapeElement).cornerRadii?.bottomLeft ?? (selectedElement as ShapeElement).cornerRadius ?? 0} 
                          onChange={e => {
                            const value = parseFloat(e.target.value) || 0;
                            const currentRadii = (selectedElement as ShapeElement).cornerRadii || {
                              topLeft: (selectedElement as ShapeElement).cornerRadius || 0,
                              topRight: (selectedElement as ShapeElement).cornerRadius || 0,
                              bottomLeft: (selectedElement as ShapeElement).cornerRadius || 0,
                              bottomRight: (selectedElement as ShapeElement).cornerRadius || 0,
                            };
                            updateElementProperty('cornerRadii', { ...currentRadii, bottomLeft: value });
                          }} 
                          className="h-8 text-center" 
                          placeholder="BL"
                        />
                      </div>
                      <div>
                        <Input 
                          type="number" 
                          min="0" 
                          value={(selectedElement as ShapeElement).cornerRadii?.bottomRight ?? (selectedElement as ShapeElement).cornerRadius ?? 0} 
                          onChange={e => {
                            const value = parseFloat(e.target.value) || 0;
                            const currentRadii = (selectedElement as ShapeElement).cornerRadii || {
                              topLeft: (selectedElement as ShapeElement).cornerRadius || 0,
                              topRight: (selectedElement as ShapeElement).cornerRadius || 0,
                              bottomLeft: (selectedElement as ShapeElement).cornerRadius || 0,
                              bottomRight: (selectedElement as ShapeElement).cornerRadius || 0,
                            };
                            updateElementProperty('cornerRadii', { ...currentRadii, bottomRight: value });
                          }} 
                          className="h-8 text-center" 
                          placeholder="BR"
                        />
                      </div>
                    </div>
                  )}
                </div>}
            </div>}

          {selectedElement.type === 'image' && <div className="space-y-4">
              <Separator />
              <h4 className="text-sm font-medium">Image Properties</h4>
              
              {/* Image Source */}
              <div>
                <Label className="text-xs">Image Source</Label>
                <Select value={(selectedElement as ImageElement).fillType || 'original'} onValueChange={value => {
              updateElementProperty('fillType', value);
              if (value === 'original') {
                updateElementProperty('fillSource', undefined);
                updateElementProperty('fillImageUrl', undefined);
              }
            }}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">Original Image</SelectItem>
                    <SelectItem value="dynamic">Dynamic Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dynamic Media Source */}
              {(selectedElement as ImageElement).fillType === 'dynamic' && <div className="space-y-2">
                  <div>
                    <Label className="text-xs">Media Source</Label>
                    <Select value={(selectedElement as ImageElement).fillSource || ''} onValueChange={value => {
                updateElementProperty('fillSource', value);
                const imageUrl = getMediaUrl(value);
                if (imageUrl) {
                  updateElementProperty('fillImageUrl', imageUrl);
                  updateElementProperty('src', imageUrl);
                }
              }}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select media source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image_link">Main Image</SelectItem>
                        <SelectItem value="additional_image_link">Additional Image</SelectItem>
                        <SelectItem value="additional_image_link_2">Detail Image</SelectItem>
                        <SelectItem value="brand_logo">Brand Logo</SelectItem>
                        {uploadedAssets.map(asset => <SelectItem key={asset.id} value={asset.id}>
                            {asset.name}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Fill Mode */}
                  <div>
                    <Label className="text-xs">Fill Mode</Label>
                    <Select value={(selectedElement as ImageElement).fillMode || 'cover'} onValueChange={value => updateElementProperty('fillMode', value)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cover">Cover (Crop to fill)</SelectItem>
                        <SelectItem value="contain">Contain (Fit inside)</SelectItem>
                        <SelectItem value="stretch">Stretch (Distort to fit)</SelectItem>
                        <SelectItem value="center">Center (Original size)</SelectItem>
                        <SelectItem value="tile">Tile (Repeat pattern)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Preview */}
                  {(selectedElement as ImageElement).fillImageUrl && <div className="mt-2">
                      <Label className="text-xs">Preview</Label>
                      <div className="w-full h-20 border rounded overflow-hidden bg-muted flex items-center justify-center">
                        <img src={(selectedElement as ImageElement).fillImageUrl} alt="Fill preview" className="max-w-full max-h-full object-contain" />
                      </div>
                    </div>}
                </div>}
              
              {/* Object Fit (only for original images) */}
              {((selectedElement as ImageElement).fillType === 'original' || !(selectedElement as ImageElement).fillType) && <div>
                  <Label className="text-xs">Object Fit</Label>
                  <Select value={(selectedElement as ImageElement).objectFit} onValueChange={value => updateElementProperty('objectFit', value)}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cover">Cover</SelectItem>
                      <SelectItem value="contain">Contain</SelectItem>
                      <SelectItem value="fill">Fill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>}

              {/* Corner Radius */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Corner Radius</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setCornerRadiusLinked(!cornerRadiusLinked)}
                    title={cornerRadiusLinked ? "Unlink corners" : "Link corners"}
                  >
                    <Link2 className={`w-3 h-3 ${cornerRadiusLinked ? '' : 'opacity-30'}`} />
                  </Button>
                </div>
                {cornerRadiusLinked ? (
                  <Input 
                    type="number" 
                    min="0" 
                    value={(selectedElement as ImageElement).cornerRadii?.topLeft ?? (selectedElement as ImageElement).cornerRadius ?? 0} 
                    onChange={e => {
                      const value = parseFloat(e.target.value) || 0;
                      updateElementProperty('cornerRadii', {
                        topLeft: value,
                        topRight: value,
                        bottomLeft: value,
                        bottomRight: value,
                      });
                    }} 
                    className="h-8" 
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Input 
                        type="number" 
                        min="0" 
                        value={(selectedElement as ImageElement).cornerRadii?.topLeft ?? (selectedElement as ImageElement).cornerRadius ?? 0} 
                        onChange={e => {
                          const value = parseFloat(e.target.value) || 0;
                          const currentRadii = (selectedElement as ImageElement).cornerRadii || {
                            topLeft: (selectedElement as ImageElement).cornerRadius || 0,
                            topRight: (selectedElement as ImageElement).cornerRadius || 0,
                            bottomLeft: (selectedElement as ImageElement).cornerRadius || 0,
                            bottomRight: (selectedElement as ImageElement).cornerRadius || 0,
                          };
                          updateElementProperty('cornerRadii', { ...currentRadii, topLeft: value });
                        }} 
                        className="h-8 text-center" 
                        placeholder="TL"
                      />
                    </div>
                    <div>
                      <Input 
                        type="number" 
                        min="0" 
                        value={(selectedElement as ImageElement).cornerRadii?.topRight ?? (selectedElement as ImageElement).cornerRadius ?? 0} 
                        onChange={e => {
                          const value = parseFloat(e.target.value) || 0;
                          const currentRadii = (selectedElement as ImageElement).cornerRadii || {
                            topLeft: (selectedElement as ImageElement).cornerRadius || 0,
                            topRight: (selectedElement as ImageElement).cornerRadius || 0,
                            bottomLeft: (selectedElement as ImageElement).cornerRadius || 0,
                            bottomRight: (selectedElement as ImageElement).cornerRadius || 0,
                          };
                          updateElementProperty('cornerRadii', { ...currentRadii, topRight: value });
                        }} 
                        className="h-8 text-center" 
                        placeholder="TR"
                      />
                    </div>
                    <div>
                      <Input 
                        type="number" 
                        min="0" 
                        value={(selectedElement as ImageElement).cornerRadii?.bottomLeft ?? (selectedElement as ImageElement).cornerRadius ?? 0} 
                        onChange={e => {
                          const value = parseFloat(e.target.value) || 0;
                          const currentRadii = (selectedElement as ImageElement).cornerRadii || {
                            topLeft: (selectedElement as ImageElement).cornerRadius || 0,
                            topRight: (selectedElement as ImageElement).cornerRadius || 0,
                            bottomLeft: (selectedElement as ImageElement).cornerRadius || 0,
                            bottomRight: (selectedElement as ImageElement).cornerRadius || 0,
                          };
                          updateElementProperty('cornerRadii', { ...currentRadii, bottomLeft: value });
                        }} 
                        className="h-8 text-center" 
                        placeholder="BL"
                      />
                    </div>
                    <div>
                      <Input 
                        type="number" 
                        min="0" 
                        value={(selectedElement as ImageElement).cornerRadii?.bottomRight ?? (selectedElement as ImageElement).cornerRadius ?? 0} 
                        onChange={e => {
                          const value = parseFloat(e.target.value) || 0;
                          const currentRadii = (selectedElement as ImageElement).cornerRadii || {
                            topLeft: (selectedElement as ImageElement).cornerRadius || 0,
                            topRight: (selectedElement as ImageElement).cornerRadius || 0,
                            bottomLeft: (selectedElement as ImageElement).cornerRadius || 0,
                            bottomRight: (selectedElement as ImageElement).cornerRadius || 0,
                          };
                          updateElementProperty('cornerRadii', { ...currentRadii, bottomRight: value });
                        }} 
                        className="h-8 text-center" 
                        placeholder="BR"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>}

          {/* Group/Widget Properties */}
          {/* BNPL Widget Settings */}
          {selectedElement.type === 'group' && (selectedElement as any).widgetType === 'bnpl' && (
            <div className="space-y-4 pt-4 border-t">
              <div>
                <h4 className="text-sm font-medium mb-3">BNPL Widget Settings</h4>
                
                {/* Provider Selection */}
                <div className="space-y-2 mb-4">
                  <Label>Payment Providers</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['tabby', 'tamara', 'klarna', 'afterpay', 'affirm', 'paypal'] as const).map((provider) => {
                      const isSelected = (selectedElement as any).widgetData?.providers?.includes(provider);
                      return (
                        <Button
                          key={provider}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className="h-auto py-2"
                          onClick={() => {
                            const currentProviders = (selectedElement as any).widgetData?.providers || [];
                            const newProviders = isSelected 
                              ? currentProviders.filter((p: string) => p !== provider)
                              : [...currentProviders, provider];
                            
                            if (newProviders.length > 0) {
                              const widgetData = (selectedElement as any).widgetData;
                              const isSingleProvider = newProviders.length === 1;
                              const logoHeight = 40;
                              const logoSpacing = 12;
                              
                              // Regenerate children based on new providers
                              const providerLogos: Record<string, string> = {
                                tabby: '/bnpl/tabby.svg',
                                tamara: '/bnpl/tamara.svg',
                                klarna: '/bnpl/klarna.svg',
                                afterpay: '/bnpl/afterpay.svg',
                                affirm: '/bnpl/affirm.svg',
                                paypal: '/bnpl/paypal.svg'
                              };
                              
                              const groupEl = selectedElement as any;
                              const textElement = groupEl.children.find((c: any) => c.type === 'text');
                              
                              if (isSingleProvider) {
                                // Single provider: text + one logo
                                const logoElement = {
                                  id: `bnpl-logo-${Math.random().toString(36).substr(2, 9)}`,
                                  type: 'image',
                                  src: providerLogos[newProviders[0]],
                                  position: { x: 320, y: 10 },
                                  size: { width: 120, height: logoHeight },
                                  objectFit: 'contain',
                                  rotation: 0,
                                  opacity: 100,
                                  visible: true,
                                  locked: false,
                                  zIndex: 0,
                                  cornerRadius: 8
                                };
                                
                                updateElementProperty('children', [textElement, logoElement]);
                                updateElementProperty('size', { width: 460, height: 60 });
                              } else {
                                // Multiple providers: text + multiple logos
                                const logoElements: any[] = [];
                                let currentX = 0;
                                
                                newProviders.forEach((prov: string) => {
                                  logoElements.push({
                                    id: `bnpl-logo-${prov}-${Math.random().toString(36).substr(2, 9)}`,
                                    type: 'image',
                                    src: providerLogos[prov],
                                    position: { x: currentX, y: 45 },
                                    size: { width: 120, height: logoHeight },
                                    objectFit: 'contain',
                                    rotation: 0,
                                    opacity: 100,
                                    visible: true,
                                    locked: false,
                                    zIndex: 0,
                                    cornerRadius: 8
                                  });
                                  currentX += 120 + logoSpacing;
                                });
                                
                                const totalLogosWidth = currentX - logoSpacing;
                                updateElementProperty('children', [textElement, ...logoElements]);
                                updateElementProperty('size', { width: Math.max(500, totalLogosWidth), height: 95 });
                              }
                              
                              updateElementProperty('widgetData', {
                                ...widgetData,
                                providers: newProviders
                              });
                            }
                          }}
                        >
                          {provider.charAt(0).toUpperCase() + provider.slice(1)}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Modifier */}
                <div className="space-y-2 mb-4">
                  <Label>Divide Price By</Label>
                  <Input
                    type="number"
                    min="1"
                    value={(selectedElement as any).widgetData?.priceModifier || 4}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 4;
                      updateElementProperty('widgetData', {
                        ...(selectedElement as any).widgetData,
                        priceModifier: value
                      });
                    }}
                  />
                </div>

                {/* Default Price */}
                <div className="space-y-2 mb-4">
                  <Label>Preview Price</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={(selectedElement as any).widgetData?.price || 50}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 50;
                      updateElementProperty('widgetData', {
                        ...(selectedElement as any).widgetData,
                        price: value
                      });
                    }}
                  />
                </div>

                {/* Currency */}
                <div className="space-y-2 mb-4">
                  <Label>Currency</Label>
                  <Input
                    type="text"
                    value={(selectedElement as any).widgetData?.currency || 'SAR'}
                    onChange={(e) => {
                      updateElementProperty('widgetData', {
                        ...(selectedElement as any).widgetData,
                        currency: e.target.value
                      });
                    }}
                  />
                </div>

                {/* Text Color */}
                <div className="space-y-2 mb-4">
                  <Label>Text Color</Label>
                  <ColorPicker
                    value={(selectedElement as any).widgetData?.textColor || '#000000'}
                    onChange={(color) => {
                      updateElementProperty('widgetData', {
                        ...(selectedElement as any).widgetData,
                        textColor: color
                      });
                    }}
                  />
                </div>

                {/* Font Size */}
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Input
                    type="number"
                    min="8"
                    max="72"
                    value={(selectedElement as any).widgetData?.fontSize || 16}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 16;
                      updateElementProperty('widgetData', {
                        ...(selectedElement as any).widgetData,
                        fontSize: value
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {selectedElement.type === 'group' && (selectedElement as any).widgetType === 'rating' && (
            <div className="space-y-4">
              <Separator />
              <h4 className="text-sm font-medium">Rating Widget Settings</h4>
              
              {/* Star Filled Color */}
              <div>
                <Label className="text-xs mb-1 block">Star Filled Color</Label>
                <ColorPicker
                  value={(selectedElement as any).widgetData?.starFilledColor || '#E4A709'}
                  onChange={(color) => {
                    // Update all filled stars
                    const groupEl = selectedElement as any;
                    const updatedChildren = groupEl.children.map((child: any, index: number) => {
                      if (child.type === 'shape' && child.shapeType === 'star' && index < 4) {
                        return { ...child, fillColor: color };
                      }
                      return child;
                    });
                    updateElementProperty('children', updatedChildren);
                    updateElementProperty('widgetData', {
                      ...groupEl.widgetData,
                      starFilledColor: color
                    });
                  }}
                />
              </div>

              {/* Star Unfilled Color */}
              <div>
                <Label className="text-xs mb-1 block">Star Unfilled Color</Label>
                <ColorPicker
                  value={(selectedElement as any).widgetData?.starUnfilledColor || '#D1D5DB'}
                  onChange={(color) => {
                    // Update unfilled stars
                    const groupEl = selectedElement as any;
                    const updatedChildren = groupEl.children.map((child: any, index: number) => {
                      if (child.type === 'shape' && child.shapeType === 'star' && index >= 4) {
                        return { ...child, fillColor: color };
                      }
                      return child;
                    });
                    updateElementProperty('children', updatedChildren);
                    updateElementProperty('widgetData', {
                      ...groupEl.widgetData,
                      starUnfilledColor: color
                    });
                  }}
                />
              </div>

              {/* Rating Text Color */}
              <div>
                <Label className="text-xs mb-1 block">Text Color</Label>
                <ColorPicker
                  value={(selectedElement as any).widgetData?.textColor || '#000000'}
                  onChange={(color) => {
                    // Update text element
                    const groupEl = selectedElement as any;
                    const updatedChildren = groupEl.children.map((child: any) => {
                      if (child.type === 'text') {
                        return { ...child, color: color };
                      }
                      return child;
                    });
                    updateElementProperty('children', updatedChildren);
                    updateElementProperty('widgetData', {
                      ...groupEl.widgetData,
                      textColor: color
                    });
                  }}
                />
              </div>

              {/* Text Font Size */}
              <div>
                <Label className="text-xs">Text Font Size</Label>
                <Input 
                  type="number" 
                  min="8"
                  value={(selectedElement as any).children.find((c: any) => c.type === 'text')?.fontSize || 16}
                  onChange={e => {
                    const fontSize = parseFloat(e.target.value) || 16;
                    const groupEl = selectedElement as any;
                    const updatedChildren = groupEl.children.map((child: any) => {
                      if (child.type === 'text') {
                        return { ...child, fontSize: fontSize };
                      }
                      return child;
                    });
                    updateElementProperty('children', updatedChildren);
                  }}
                  className="h-8" 
                />
              </div>

              {/* Text Font Weight */}
              <div>
                <Label className="text-xs">Text Font Weight</Label>
                <Select 
                  value={(selectedElement as any).children.find((c: any) => c.type === 'text')?.fontWeight || '600'}
                  onValueChange={value => {
                    const groupEl = selectedElement as any;
                    const updatedChildren = groupEl.children.map((child: any) => {
                      if (child.type === 'text') {
                        return { ...child, fontWeight: value };
                      }
                      return child;
                    });
                    updateElementProperty('children', updatedChildren);
                  }}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover">
                    <SelectItem value="300">Light (300)</SelectItem>
                    <SelectItem value="400">Regular (400)</SelectItem>
                    <SelectItem value="500">Medium (500)</SelectItem>
                    <SelectItem value="600">Semi Bold (600)</SelectItem>
                    <SelectItem value="700">Bold (700)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional Display */}
              <div className="space-y-2">
                <Label className="text-xs">Conditional Display</Label>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={(selectedElement as any).conditionalDisplay?.enabled || false}
                    onCheckedChange={checked => {
                      if (checked) {
                        updateElementProperty('conditionalDisplay', {
                          enabled: true,
                          field: 'rating',
                          operator: 'greater_than',
                          value: 3.0
                        });
                      } else {
                        updateElementProperty('conditionalDisplay', undefined);
                      }
                    }}
                  />
                  <span className="text-xs text-muted-foreground">
                    Only show if rating meets condition
                  </span>
                </div>
                
                {(selectedElement as any).conditionalDisplay?.enabled && (
                  <div className="space-y-2 pl-4 border-l-2 border-border">
                    <div>
                      <Label className="text-xs">Condition</Label>
                      <Select 
                        value={(selectedElement as any).conditionalDisplay?.operator || 'greater_than'}
                        onValueChange={value => {
                          const current = (selectedElement as any).conditionalDisplay;
                          updateElementProperty('conditionalDisplay', {
                            ...current,
                            operator: value
                          });
                        }}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-popover">
                          <SelectItem value="greater_than">Greater than</SelectItem>
                          <SelectItem value="less_than">Less than</SelectItem>
                          <SelectItem value="equals">Equals</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Threshold Value</Label>
                      <Input 
                        type="number" 
                        step="0.1"
                        min="0"
                        max="5"
                        value={(selectedElement as any).conditionalDisplay?.value || 3.0}
                        onChange={e => {
                          const current = (selectedElement as any).conditionalDisplay;
                          updateElementProperty('conditionalDisplay', {
                            ...current,
                            value: parseFloat(e.target.value) || 0
                          });
                        }}
                        className="h-8" 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ungroup Button for Groups */}
          {selectedElement.type === 'group' && (
            <div className="space-y-4">
              <Separator />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => canvasStore.ungroupSelectedElement()} 
                className="w-full"
              >
                <Ungroup className="w-4 h-4 mr-2" />
                Ungroup Elements
              </Button>
            </div>
          )}

          {/* Z-Index */}
          <div className="space-y-4">
            <Separator />
            <div>
              <Label className="text-xs">Layer Order</Label>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => updateElementProperty('zIndex', selectedElement.zIndex + 1)} className="flex-1">
                  Bring Forward
                </Button>
                <Button variant="outline" size="sm" onClick={() => updateElementProperty('zIndex', Math.max(0, selectedElement.zIndex - 1))} className="flex-1">
                  Send Backward
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Separator />
            <div className="space-y-2">
              <Button variant="outline" size="sm" onClick={() => {
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
            }} className="w-full">
                Duplicate Element
              </Button>
              
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>;
}