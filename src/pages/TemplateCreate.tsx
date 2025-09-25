import React, { useRef } from "react";
import { TemplateHeader } from "@/components/template-creator/TemplateHeader";
import { ToolbarSidebar } from "@/components/template-creator/ToolbarSidebar";
import { TemplateCanvas, TemplateCanvasRef } from "@/components/template-creator/TemplateCanvas";
import { PropertiesPanel } from "@/components/template-creator/PropertiesPanel";
import { ProductProvider } from "@/contexts/ProductContext";
import { useCanvasStore } from "@/hooks/useCanvasStore";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Debug wrapper to ensure ProductProvider is working
const TemplateCreateContent = () => {
  const canvasStore = useCanvasStore();
  const canvasRef = useRef<TemplateCanvasRef>(null);

  const handleExport = async () => {
    await canvasRef.current?.exportAsJPG();
  };
  
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <TemplateHeader onExport={handleExport} />
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tools */}
        <ErrorBoundary>
          <ToolbarSidebar canvasStore={canvasStore} />
        </ErrorBoundary>
        
        {/* Canvas Area */}
        <ErrorBoundary>
          <TemplateCanvas ref={canvasRef} canvasStore={canvasStore} />
        </ErrorBoundary>
        
        {/* Right Sidebar - Properties */}
        <ErrorBoundary>
          <PropertiesPanel canvasStore={canvasStore} />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default function TemplateCreate() {
  return (
    <ErrorBoundary>
      <ProductProvider>
        <TemplateCreateContent />
      </ProductProvider>
    </ErrorBoundary>
  );
}