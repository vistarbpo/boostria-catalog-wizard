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
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Palette, Plus, MoreHorizontal, ChevronDown, Link as LinkIcon, Eye, Square, Maximize2, RotateCcw, Type, Grid3X3, ArrowUp, ArrowDown, Trash2, Link2, Settings } from "lucide-react";
import { useCanvasStore } from "../../hooks/useCanvasStore";
import { TextElement, ShapeElement, ImageElement, SVGElement } from "../../types/canvas";
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
              <Label className="text-xs mb-2 block">Align to Canvas</Label>
              <div className="grid grid-cols-3 gap-1 mb-2">
                <Button variant="outline" size="sm" onClick={() => alignToCanvas('left')} className="h-8 p-0" title="Align Left">
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => alignToCanvas('center')} className="h-8 p-0" title="Align Center">
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => alignToCanvas('right')} className="h-8 p-0" title="Align Right">
                  <AlignRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <Button variant="outline" size="sm" onClick={() => alignToCanvas('top')} className="h-8 p-0" title="Align Top">
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => alignToCanvas('middle')} className="h-8 p-0" title="Align Middle">
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => alignToCanvas('bottom')} className="h-8 p-0" title="Align Bottom">
                  <ArrowDown className="w-4 h-4" />
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
                <Label className="text-xs">Text Color</Label>
                <Input type="color" value={(selectedElement as TextElement).color} onChange={e => updateElementProperty('color', e.target.value)} className="h-8" />
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
                  <Label className="text-xs">Fill Color</Label>
                  <Input type="color" value={(selectedElement as ShapeElement).fillColor} onChange={e => updateElementProperty('fillColor', e.target.value)} className="h-8" />
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
                  <Label className="text-xs">Stroke Color</Label>
                  <Input type="color" value={(selectedElement as ShapeElement).strokeColor || '#000000'} onChange={e => updateElementProperty('strokeColor', e.target.value)} className="h-8" />
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