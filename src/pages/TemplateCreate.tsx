import { TemplateHeader } from "@/components/template-creator/TemplateHeader";
import { ToolbarSidebar } from "@/components/template-creator/ToolbarSidebar";
import { TemplateCanvas } from "@/components/template-creator/TemplateCanvas";
import { PropertiesPanel } from "@/components/template-creator/PropertiesPanel";
import { ProductProvider } from "@/contexts/ProductContext";
import { useCanvasStore } from "@/hooks/useCanvasStore";

export default function TemplateCreate() {
  const canvasStore = useCanvasStore();

  return (
    <ProductProvider>
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <TemplateHeader />
        
        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Tools */}
          <ToolbarSidebar canvasStore={canvasStore} />
          
          {/* Canvas Area */}
          <TemplateCanvas canvasStore={canvasStore} />
          
          {/* Right Sidebar - Properties */}
          <PropertiesPanel canvasStore={canvasStore} />
        </div>
      </div>
    </ProductProvider>
  );
}