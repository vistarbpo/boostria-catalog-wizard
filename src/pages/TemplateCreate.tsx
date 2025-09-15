import { useState } from "react";
import { TemplateCanvas } from "@/components/template-creator/TemplateCanvas";
import { ToolbarSidebar } from "@/components/template-creator/ToolbarSidebar";
import { PropertiesPanel } from "@/components/template-creator/PropertiesPanel";
import { TemplateHeader } from "@/components/template-creator/TemplateHeader";
import { Button } from "@/components/ui/button";
import { Save, Download, Eye } from "lucide-react";

export default function TemplateCreate() {
  const [selectedTool, setSelectedTool] = useState<string>("select");
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <TemplateHeader />
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tools */}
        <ToolbarSidebar 
          selectedTool={selectedTool}
          onToolSelect={setSelectedTool}
        />
        
        {/* Canvas Area */}
        <div className="flex-1 flex flex-col bg-muted/30">
          {/* Canvas Controls */}
          <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Canvas Size:</span>
              <select 
                className="text-sm border rounded px-2 py-1"
                value={`${canvasSize.width}x${canvasSize.height}`}
                onChange={(e) => {
                  const [width, height] = e.target.value.split('x').map(Number);
                  setCanvasSize({ width, height });
                }}
              >
                <option value="800x600">800x600 (4:3)</option>
                <option value="1200x800">1200x800 (3:2)</option>
                <option value="1080x1080">1080x1080 (Square)</option>
                <option value="1200x630">1200x630 (Facebook)</option>
                <option value="1080x1920">1080x1920 (Instagram Story)</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>
          
          {/* Canvas */}
          <div className="flex-1 p-6 overflow-auto">
            <TemplateCanvas 
              selectedTool={selectedTool}
              onElementSelect={setSelectedElement}
              canvasSize={canvasSize}
            />
          </div>
        </div>
        
        {/* Right Sidebar - Properties */}
        <PropertiesPanel selectedElement={selectedElement} />
      </div>
    </div>
  );
}