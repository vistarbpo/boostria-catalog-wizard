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
  Underline
} from "lucide-react";

interface PropertiesPanelProps {
  selectedElement: any;
}

export function PropertiesPanel({ selectedElement }: PropertiesPanelProps) {
  const [properties, setProperties] = useState({
    fill: "#000000",
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
  });

  useEffect(() => {
    if (selectedElement) {
      setProperties({
        fill: selectedElement.fill || "#000000",
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="appearance">Style</TabsTrigger>
              <TabsTrigger value="position">Position</TabsTrigger>
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

              {/* Fill Color */}
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
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}