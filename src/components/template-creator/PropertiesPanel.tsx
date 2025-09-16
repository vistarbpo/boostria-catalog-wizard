import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Palette, 
  Move, 
  RotateCcw, 
  Copy, 
  Trash2, 
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Image,
  DollarSign,
  Percent
} from "lucide-react";

interface PropertiesPanelProps {
  selectedElement: any;
}

export function PropertiesPanel({ selectedElement }: PropertiesPanelProps) {
  const [properties, setProperties] = useState({
    fill: "#000000",
    fillType: "color", // color, image, dynamic-image
    stroke: "#000000",
    strokeWidth: 1,
    opacity: 100,
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    angle: 0,
    fontSize: 16,
    fontFamily: "Arial",
    textAlign: "left",
    fontWeight: "normal",
    fontStyle: "normal",
    underline: false,
    // Pricing properties
    price: 0,
    salePrice: 0,
    currency: "USD",
    showInstallments: false,
    installmentRate: 4
  });

  useEffect(() => {
    if (selectedElement) {
      setProperties({
        fill: selectedElement.fill || "#000000",
        fillType: "color",
        stroke: selectedElement.stroke || "#000000",
        strokeWidth: selectedElement.strokeWidth || 1,
        opacity: Math.round((selectedElement.opacity || 1) * 100),
        left: Math.round(selectedElement.left || 0),
        top: Math.round(selectedElement.top || 0),
        width: Math.round(selectedElement.width || 0),
        height: Math.round(selectedElement.height || 0),
        angle: Math.round(selectedElement.angle || 0),
        fontSize: selectedElement.fontSize || 16,
        fontFamily: selectedElement.fontFamily || "Arial",
        textAlign: selectedElement.textAlign || "left",
        fontWeight: selectedElement.fontWeight || "normal",
        fontStyle: selectedElement.fontStyle || "normal",
        underline: selectedElement.underline || false,
        price: 0,
        salePrice: 0,
        currency: "USD",
        showInstallments: false,
        installmentRate: 4
      });
    }
  }, [selectedElement]);

  const updateProperty = (key: string, value: any) => {
    if (!selectedElement) return;
    
    setProperties(prev => ({ ...prev, [key]: value }));
    
    if (key === "opacity") {
      selectedElement.set(key, value / 100);
    } else {
      selectedElement.set(key, value);
    }
    
    selectedElement.canvas?.renderAll();
  };

  if (!selectedElement) {
    return (
      <div className="w-80 border-l border-border bg-card p-4">
        <div className="text-center text-muted-foreground">
          <Palette className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  const isTextElement = selectedElement.type === "textbox" || selectedElement.type === "i-text";

  return (
    <div className="w-80 border-l border-border bg-card">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {/* Element Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>

          <Separator />

          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="appearance">Style</TabsTrigger>
              <TabsTrigger value="position">Position</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="space-y-4">
              {/* Text Formatting (for text elements) */}
              {isTextElement && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Text Formatting</Label>
                  
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      <Button
                        variant={properties.fontWeight === "bold" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateProperty("fontWeight", properties.fontWeight === "bold" ? "normal" : "bold")}
                      >
                        <Bold className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={properties.fontStyle === "italic" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateProperty("fontStyle", properties.fontStyle === "italic" ? "normal" : "italic")}
                      >
                        <Italic className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={properties.underline ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateProperty("underline", !properties.underline)}
                      >
                        <Underline className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant={properties.textAlign === "left" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateProperty("textAlign", "left")}
                      >
                        <AlignLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={properties.textAlign === "center" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateProperty("textAlign", "center")}
                      >
                        <AlignCenter className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={properties.textAlign === "right" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateProperty("textAlign", "right")}
                      >
                        <AlignRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Font Size</Label>
                    <Input
                      type="number"
                      value={properties.fontSize}
                      onChange={(e) => updateProperty("fontSize", parseInt(e.target.value))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Font Family</Label>
                    <select 
                      value={properties.fontFamily}
                      onChange={(e) => updateProperty("fontFamily", e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm border rounded-md"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Georgia">Georgia</option>
                    </select>
                  </div>
                  
                  <Separator />
                </div>
              )}

              {/* Fill Options */}
              <div className="space-y-3">
                <Label className="text-xs">Fill Type</Label>
                <div className="flex gap-1">
                  <Button
                    variant={properties.fillType === "color" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateProperty("fillType", "color")}
                    className="flex-1"
                  >
                    <Palette className="w-4 h-4 mr-1" />
                    Color
                  </Button>
                  <Button
                    variant={properties.fillType === "image" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateProperty("fillType", "image")}
                    className="flex-1"
                  >
                    <Image className="w-4 h-4 mr-1" />
                    Image
                  </Button>
                  <Button
                    variant={properties.fillType === "dynamic-image" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateProperty("fillType", "dynamic-image")}
                    className="flex-1 text-xs"
                  >
                    Dynamic
                  </Button>
                </div>

                {properties.fillType === "color" && (
                  <div>
                    <Label className="text-xs">Fill Color</Label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={properties.fill}
                        onChange={(e) => updateProperty("fill", e.target.value)}
                        className="w-12 h-8 border rounded cursor-pointer"
                      />
                      <Input
                        value={properties.fill}
                        onChange={(e) => updateProperty("fill", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                )}

                {properties.fillType === "image" && (
                  <div>
                    <Label className="text-xs">Upload Image</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const imgUrl = event.target?.result as string;
                            // For now, just set the fill directly - we'll improve pattern support later
                            updateProperty("fill", imgUrl);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="mt-1"
                    />
                    <div className="mt-2 text-xs text-muted-foreground">
                      Upload an image to fill this element
                    </div>
                  </div>
                )}

                {properties.fillType === "dynamic-image" && (
                  <div>
                    <Label className="text-xs">Dynamic Image Field</Label>
                    <select 
                      className="w-full mt-1 px-3 py-2 text-sm border rounded-md"
                      defaultValue="product_image"
                    >
                      <option value="product_image">Product Image</option>
                      <option value="brand_logo">Brand Logo</option>
                      <option value="category_image">Category Image</option>
                      <option value="user_avatar">User Avatar</option>
                    </select>
                    <div className="mt-2 p-2 bg-muted rounded text-xs text-muted-foreground">
                      This will show dynamic content when template is generated
                    </div>
                  </div>
                )}
              </div>

              {/* Stroke */}
              <div>
                <Label className="text-xs">Stroke Color</Label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={properties.stroke}
                    onChange={(e) => updateProperty("stroke", e.target.value)}
                    className="w-12 h-8 border rounded cursor-pointer"
                  />
                  <Input
                    value={properties.stroke}
                    onChange={(e) => updateProperty("stroke", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Stroke Width */}
              <div>
                <Label className="text-xs">Stroke Width</Label>
                <Slider
                  value={[properties.strokeWidth]}
                  onValueChange={([value]) => updateProperty("strokeWidth", value)}
                  max={20}
                  step={1}
                  className="mt-2"
                />
                <span className="text-xs text-muted-foreground">{properties.strokeWidth}px</span>
              </div>

              {/* Opacity */}
              <div>
                <Label className="text-xs">Opacity</Label>
                <Slider
                  value={[properties.opacity]}
                  onValueChange={([value]) => updateProperty("opacity", value)}
                  max={100}
                  step={1}
                  className="mt-2"
                />
                <span className="text-xs text-muted-foreground">{properties.opacity}%</span>
              </div>
            </TabsContent>

            <TabsContent value="position" className="space-y-4">
              {/* Position */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">X Position</Label>
                  <Input
                    type="number"
                    value={properties.left}
                    onChange={(e) => updateProperty("left", parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Y Position</Label>
                  <Input
                    type="number"
                    value={properties.top}
                    onChange={(e) => updateProperty("top", parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Size */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Width</Label>
                  <Input
                    type="number"
                    value={properties.width}
                    onChange={(e) => updateProperty("width", parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Height</Label>
                  <Input
                    type="number"
                    value={properties.height}
                    onChange={(e) => updateProperty("height", parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Rotation */}
              <div>
                <Label className="text-xs">Rotation</Label>
                <Slider
                  value={[properties.angle]}
                  onValueChange={([value]) => updateProperty("angle", value)}
                  min={-180}
                  max={180}
                  step={1}
                  className="mt-2"
                />
                <span className="text-xs text-muted-foreground">{properties.angle}°</span>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              {/* Currency Selection */}
              <div>
                <Label className="text-xs">Currency</Label>
                <select 
                  value={properties.currency}
                  onChange={(e) => updateProperty("currency", e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-md"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Regular Price</Label>
                  <Input
                    type="number"
                    value={properties.price}
                    onChange={(e) => updateProperty("price", parseFloat(e.target.value))}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Sale Price</Label>
                  <Input
                    type="number"
                    value={properties.salePrice}
                    onChange={(e) => updateProperty("salePrice", parseFloat(e.target.value))}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Show Savings */}
              {properties.price > 0 && properties.salePrice > 0 && properties.salePrice < properties.price && (
                <div className="p-2 bg-muted rounded text-sm">
                  <div className="text-green-600 font-medium">
                    Save: {getCurrencySymbol(properties.currency)}{(properties.price - properties.salePrice).toFixed(2)}
                  </div>
                  <div className="text-muted-foreground">
                    ({Math.round(((properties.price - properties.salePrice) / properties.price) * 100)}% off)
                  </div>
                </div>
              )}

              {/* Installments */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showInstallments"
                    checked={properties.showInstallments}
                    onChange={(e) => updateProperty("showInstallments", e.target.checked)}
                  />
                  <Label htmlFor="showInstallments" className="text-xs">Show Installment Options</Label>
                </div>

                {properties.showInstallments && (
                  <div>
                    <Label className="text-xs">Installment Rate (%)</Label>
                    <Slider
                      value={[properties.installmentRate]}
                      onValueChange={([value]) => updateProperty("installmentRate", value)}
                      min={1}
                      max={20}
                      step={0.5}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{properties.installmentRate}% APR</span>
                      <span>
                        {getCurrencySymbol(properties.currency)}
                        {calculateInstallment(properties.salePrice || properties.price, properties.installmentRate)}/mo
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Preview */}
              <div className="p-3 border rounded-lg bg-card">
                <Label className="text-xs text-muted-foreground">Price Display Preview</Label>
                <div className="mt-2 space-y-1">
                  {properties.salePrice > 0 && properties.salePrice < properties.price ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-red-600">
                        {getCurrencySymbol(properties.currency)}{properties.salePrice.toFixed(2)}
                      </span>
                      <span className="text-sm line-through text-muted-foreground">
                        {getCurrencySymbol(properties.currency)}{properties.price.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold">
                      {getCurrencySymbol(properties.currency)}{(properties.price || 0).toFixed(2)}
                    </span>
                  )}
                  {properties.showInstallments && (properties.price > 0 || properties.salePrice > 0) && (
                    <div className="text-sm text-muted-foreground">
                      or {getCurrencySymbol(properties.currency)}{calculateInstallment(properties.salePrice || properties.price, properties.installmentRate)}/month
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Helper Functions */}
          {(() => {
            return null;
          })()}
        </div>
      </ScrollArea>
    </div>
  );

  // Helper functions
  function getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
      USD: "$", EUR: "€", GBP: "£", CAD: "C$", AUD: "A$", JPY: "¥", INR: "₹"
    };
    return symbols[currency] || "$";
  }

  function calculateInstallment(price: number, rate: number): string {
    if (!price || price <= 0) return "0.00";
    const monthlyRate = rate / 100 / 12;
    const months = 12; // 12 month financing
    const monthlyPayment = (price * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                         (Math.pow(1 + monthlyRate, months) - 1);
    return monthlyPayment.toFixed(2);
  }
}