import React, { useRef, useEffect } from "react";
import { TemplateHeader } from "@/components/template-creator/TemplateHeader";
import { ToolbarSidebar } from "@/components/template-creator/ToolbarSidebar";
import { TemplateCanvas, TemplateCanvasRef } from "@/components/template-creator/TemplateCanvas";
import { PropertiesPanel } from "@/components/template-creator/PropertiesPanel";
import { ProductProvider } from "@/contexts/ProductContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { useCanvasStore } from "@/hooks/useCanvasStore";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Debug wrapper to ensure ProductProvider is working
const TemplateCreateContent = () => {
  const canvasStore = useCanvasStore();
  const canvasRef = useRef<TemplateCanvasRef>(null);

  const handleExport = async () => {
    await canvasRef.current?.exportAsJPG();
  };

  // Keyboard shortcuts for layer ordering (Adobe-like)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Check if user is typing in an input field
      const isTyping = (e.target as HTMLElement)?.tagName === 'INPUT' || 
                       (e.target as HTMLElement)?.tagName === 'TEXTAREA' ||
                       (e.target as HTMLElement)?.contentEditable === 'true';
      
      if (isTyping) return;

      // Check if there are selected elements
      if (canvasStore.canvasState.selectedElementIds.length === 0) return;

      // Cmd/Ctrl + ] - Bring Forward
      if (cmdOrCtrl && e.code === 'BracketRight' && !e.shiftKey) {
        e.preventDefault();
        canvasStore.bringForward();
        console.log('Bring Forward triggered');
      }
      // Cmd/Ctrl + [ - Send Backward
      else if (cmdOrCtrl && e.code === 'BracketLeft' && !e.shiftKey) {
        e.preventDefault();
        canvasStore.sendBackward();
        console.log('Send Backward triggered');
      }
      // Cmd/Ctrl + Shift + ] - Bring to Front
      else if (cmdOrCtrl && e.shiftKey && e.code === 'BracketRight') {
        e.preventDefault();
        canvasStore.bringToFront();
        console.log('Bring to Front triggered');
      }
      // Cmd/Ctrl + Shift + [ - Send to Back
      else if (cmdOrCtrl && e.shiftKey && e.code === 'BracketLeft') {
        e.preventDefault();
        canvasStore.sendToBack();
        console.log('Send to Back triggered');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvasStore]);
  
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <TemplateHeader onExport={handleExport} canvasStore={canvasStore} />
      
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
      <CurrencyProvider>
        <ProductProvider>
          <TemplateCreateContent />
        </ProductProvider>
      </CurrencyProvider>
    </ErrorBoundary>
  );
}