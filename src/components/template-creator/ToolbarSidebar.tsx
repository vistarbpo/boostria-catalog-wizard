import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MousePointer2, 
  Type, 
  Square, 
  Circle, 
  Image, 
  Shapes,
  Palette,
  Upload,
  Database
} from "lucide-react";

interface ToolbarSidebarProps {
  selectedTool: string;
  onToolSelect: (tool: string) => void;
}

export function ToolbarSidebar({ selectedTool, onToolSelect }: ToolbarSidebarProps) {
  const tools = [
    { id: "select", icon: MousePointer2, label: "Select" },
    { id: "text", icon: Type, label: "Text" },
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "image", icon: Image, label: "Image" },
  ];

  const textStyles = [
    "Heading 1",
    "Heading 2", 
    "Subtitle",
    "Body Text",
    "Caption"
  ];

  const shapes = [
    "Rectangle",
    "Circle", 
    "Triangle",
    "Arrow",
    "Star",
    "Line"
  ];

  const colors = [
    "#000000", "#ffffff", "#ff0000", "#00ff00", 
    "#0000ff", "#ffff00", "#ff00ff", "#00ffff",
    "#800000", "#008000", "#000080", "#800080"
  ];

  return (
    <div className="w-80 border-r border-border bg-card">
      {/* Quick Tools */}
      <div className="p-4 border-b border-border">
        <div className="grid grid-cols-5 gap-2">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={selectedTool === tool.id ? "default" : "outline"}
              size="sm"
              className="flex-col h-12 w-12 p-1"
              onClick={() => onToolSelect(tool.id)}
            >
              <tool.icon className="w-4 h-4 mb-1" />
              <span className="text-xs">{tool.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="elements" className="flex-1">
        <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
          <TabsTrigger value="elements" className="text-xs">
            <Shapes className="w-3 h-3 mr-1" />
            Elements
          </TabsTrigger>
          <TabsTrigger value="text" className="text-xs">
            <Type className="w-3 h-3 mr-1" />
            Text
          </TabsTrigger>
          <TabsTrigger value="media" className="text-xs">
            <Image className="w-3 h-3 mr-1" />
            Media
          </TabsTrigger>
          <TabsTrigger value="data" className="text-xs">
            <Database className="w-3 h-3 mr-1" />
            Data
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-180px)]">
          <TabsContent value="elements" className="p-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Shapes</h3>
              <div className="grid grid-cols-2 gap-2">
                {shapes.map((shape) => (
                  <Button 
                    key={shape}
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => onToolSelect(shape.toLowerCase())}
                  >
                    <div className="w-8 h-8 bg-primary/20 rounded mb-1"></div>
                    <span className="text-xs">{shape}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Custom Shapes</h3>
              <Button 
                variant="outline" 
                className="w-full h-20 flex-col"
                onClick={() => onToolSelect("custom-shape")}
              >
                <Upload className="w-8 h-8 mb-1" />
                <span className="text-xs">Upload Shape</span>
              </Button>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Colors</h3>
              <div className="grid grid-cols-6 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded border-2 border-border"
                    style={{ backgroundColor: color }}
                    onClick={() => {/* Handle color selection */}}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="text" className="p-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Text Styles</h3>
              <div className="space-y-2">
                {textStyles.map((style) => (
                  <Button
                    key={style}
                    variant="outline"
                    className="w-full justify-start text-left"
                    onClick={() => onToolSelect("text")}
                  >
                    <Type className="w-4 h-4 mr-2" />
                    {style}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="media" className="p-4 space-y-4">
            <Button className="w-full" variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Stock Images</h3>
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div 
                    key={i}
                    className="aspect-square bg-muted rounded border cursor-pointer hover:border-primary"
                  >
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data" className="p-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Dynamic Fields</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  Product Title
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  Product Price
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  Product Image
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  Brand Name
                </Button>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}