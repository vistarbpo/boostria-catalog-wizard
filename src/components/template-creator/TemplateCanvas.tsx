import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Monitor, Smartphone, Tablet, ChevronDown } from "lucide-react";
import { CanvasElement } from "./CanvasElement";
import { useCanvasStore } from "../../hooks/useCanvasStore";
import html2canvas from "html2canvas";
import { toast } from "sonner";

interface TemplateCanvasProps {
  canvasStore: ReturnType<typeof useCanvasStore>;
}

export interface TemplateCanvasRef {
  exportAsJPG: () => Promise<void>;
}

export const TemplateCanvas = forwardRef<TemplateCanvasRef, TemplateCanvasProps>(({ canvasStore }, ref) => {
  const [selectedDevice, setSelectedDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [selectedSize, setSelectedSize] = useState("pinterest-pin-standard");
  const [zoomLevel, setZoomLevel] = useState<number | "fit">("fit");
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPanOffset, setLastPanOffset] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const canvasSizes = {
    // Meta (Facebook/Instagram)
    "facebook-feed": { width: 1200, height: 630, label: "Facebook Feed", platform: "Meta", color: "bg-blue-600" },
    "facebook-story": { width: 1080, height: 1920, label: "Facebook Story", platform: "Meta", color: "bg-blue-600" },
    "instagram-post-square": { width: 1080, height: 1080, label: "Instagram Post (Square)", platform: "Meta", color: "bg-gradient-to-br from-purple-500 to-pink-500" },
    "instagram-story": { width: 1080, height: 1920, label: "Instagram Story", platform: "Meta", color: "bg-gradient-to-br from-purple-500 to-pink-500" },
    
    // Google
    "google-display-banner": { width: 728, height: 90, label: "Display Banner", platform: "Google", color: "bg-red-500" },
    "youtube-thumbnail": { width: 1280, height: 720, label: "YouTube Thumbnail", platform: "Google", color: "bg-red-600" },
    
    // Pinterest
    "pinterest-pin-standard": { width: 1000, height: 1500, label: "Pinterest Pin (Standard)", platform: "Pinterest", color: "bg-red-600" },
    "pinterest-pin-square": { width: 1080, height: 1080, label: "Pinterest Pin (Square)", platform: "Pinterest", color: "bg-red-600" },
    
    // Custom
    "custom-square": { width: 800, height: 800, label: "Custom Square", platform: "Custom", color: "bg-gray-600" },
    "custom-landscape": { width: 1200, height: 800, label: "Custom Landscape", platform: "Custom", color: "bg-gray-600" },
    "custom-portrait": { width: 800, height: 1200, label: "Custom Portrait", platform: "Custom", color: "bg-gray-600" }
  };

  const devices = [
    { id: "desktop" as const, icon: Monitor, label: "Desktop" },
    { id: "tablet" as const, icon: Tablet, label: "Tablet" },
    { id: "mobile" as const, icon: Smartphone, label: "Mobile" }
  ];

  const zoomOptions = [
    { value: "fit", label: "Fit to Screen" },
    { value: 25, label: "25%" },
    { value: 50, label: "50%" },
    { value: 100, label: "100%" },
    { value: 200, label: "200%" },
    { value: 400, label: "400%" }
  ];

  const currentSize = canvasSizes[selectedSize as keyof typeof canvasSizes];
  
  // Update canvas store when size changes
  useEffect(() => {
    canvasStore.updateCanvasSize({ width: currentSize.width, height: currentSize.height });
  }, [currentSize.width, currentSize.height, canvasStore]);
  
  // Calculate fit to screen zoom
  const calculateFitToScreenZoom = useCallback(() => {
    if (!containerRef.current) return 50;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width - 120;
    const containerHeight = containerRect.height - 120;
    
    const scaleX = containerWidth / currentSize.width;
    const scaleY = containerHeight / currentSize.height;
    return Math.min(scaleX, scaleY, 1) * 100;
  }, [currentSize]);

  const getActualZoom = useCallback(() => {
    return zoomLevel === "fit" ? calculateFitToScreenZoom() : zoomLevel;
  }, [zoomLevel, calculateFitToScreenZoom]);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      
      const delta = e.deltaY;
      const currentZoom = getActualZoom();
      const zoomFactor = delta > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(10, Math.min(500, currentZoom * zoomFactor));
      
      setZoomLevel(Math.round(newZoom));
    }
  }, [getActualZoom]);

  // Handle mouse drag panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      canvasStore.clearSelection();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setLastPanOffset(panOffset);
    }
  }, [panOffset, canvasStore]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      setPanOffset({
        x: lastPanOffset.x + deltaX,
        y: lastPanOffset.y + deltaY
      });
    }
  }, [isDragging, dragStart, lastPanOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const actualZoom = getActualZoom();
  const scale = actualZoom / 100;

  // Export functionality
  const exportAsJPG = useCallback(async () => {
    if (!canvasRef.current) {
      toast.error("Canvas not ready for export");
      return;
    }

    try {
      toast.loading("Preparing export...");
      
      // Create a temporary canvas element for export
      const tempCanvas = document.createElement('div');
      tempCanvas.style.position = 'absolute';
      tempCanvas.style.left = '-9999px';
      tempCanvas.style.top = '-9999px';
      tempCanvas.style.width = `${currentSize.width}px`;
      tempCanvas.style.height = `${currentSize.height}px`;
      tempCanvas.style.backgroundColor = 'white';
      tempCanvas.innerHTML = canvasRef.current.innerHTML;
      
      document.body.appendChild(tempCanvas);

      const canvas = await html2canvas(tempCanvas, {
        width: currentSize.width,
        height: currentSize.height,
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        removeContainer: true
      });

      // Clean up temp element
      document.body.removeChild(tempCanvas);

      // Convert to JPG and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `template-${Date.now()}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success("Template exported successfully!");
        }
      }, 'image/jpeg', 0.9);

    } catch (error) {
      console.error('Export failed:', error);
      toast.error("Failed to export template");
    }
  }, [currentSize, canvasRef]);

  // Expose export function through ref
  useImperativeHandle(ref, () => ({
    exportAsJPG
  }), [exportAsJPG]);

  return (
    <div className="flex-1 bg-muted/20 p-4 flex flex-col overflow-hidden">
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Select value={selectedSize} onValueChange={setSelectedSize}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-96">
              <SelectItem value="pinterest-pin-standard">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span>Pinterest Pin (Standard)</span>
                  <span className="text-xs text-muted-foreground ml-auto">1000×1500</span>
                </div>
              </SelectItem>
              <SelectItem value="instagram-post-square">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded"></div>
                  <span>Instagram Post (Square)</span>
                  <span className="text-xs text-muted-foreground ml-auto">1080×1080</span>
                </div>
              </SelectItem>
              <SelectItem value="facebook-feed">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span>Facebook Feed</span>
                  <span className="text-xs text-muted-foreground ml-auto">1200×630</span>
                </div>
              </SelectItem>
              <SelectItem value="custom-square">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-600 rounded"></div>
                  <span>Custom Square</span>
                  <span className="text-xs text-muted-foreground ml-auto">800×800</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="text-sm text-muted-foreground">
            {currentSize.width} × {currentSize.height}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={zoomLevel.toString()} onValueChange={(value) => setZoomLevel(value === "fit" ? "fit" : Number(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {zoomOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden bg-muted/50 rounded-lg relative"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Canvas */}
        <div 
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
            transformOrigin: 'center center'
          }}
        >
          <div
            ref={canvasRef}
            className="relative bg-white shadow-lg"
            style={{
              width: currentSize.width,
              height: currentSize.height,
              minWidth: currentSize.width,
              minHeight: currentSize.height
            }}
          >
            {/* Canvas Elements */}
            {canvasStore.canvasState.elements.map((element) => (
              <CanvasElement
                key={element.id}
                element={element}
                isSelected={canvasStore.canvasState.selectedElementIds.includes(element.id)}
                scale={scale}
                onSelect={canvasStore.selectElement}
                onMove={canvasStore.moveElement}
                onResize={canvasStore.resizeElement}
                onRotate={canvasStore.rotateElement}
                onDoubleClick={(elementId) => {
                  // Handle double click for editing
                  console.log('Double clicked element:', elementId);
                }}
              />
            ))}
          </div>
        </div>

        {/* Canvas Info Overlay */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-sm">
          <div className="font-medium">{currentSize.label}</div>
          <div className="text-muted-foreground">{Math.round(actualZoom)}% zoom</div>
        </div>
      </div>
    </div>
  );
});