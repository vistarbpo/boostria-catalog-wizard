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
export const TemplateCanvas = forwardRef<TemplateCanvasRef, TemplateCanvasProps>(({
  canvasStore
}, ref) => {
  const [selectedDevice, setSelectedDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [selectedSize, setSelectedSize] = useState("instagram-post");
  const [zoomLevel, setZoomLevel] = useState<number | "fit">("fit");
  const [panOffset, setPanOffset] = useState({
    x: 0,
    y: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0
  });
  const [lastPanOffset, setLastPanOffset] = useState({
    x: 0,
    y: 0
  });
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const canvasSizes = {
    // Instagram
    "instagram-post": {
      width: 1080,
      height: 1080,
      label: "Instagram Post",
      platform: "Instagram",
      color: "bg-gradient-to-br from-purple-500 to-pink-500"
    },
    "instagram-story": {
      width: 1080,
      height: 1920,
      label: "Instagram Story",
      platform: "Instagram",
      color: "bg-gradient-to-br from-purple-500 to-pink-500"
    },
    // Facebook
    "facebook-post": {
      width: 1200,
      height: 630,
      label: "Facebook Post",
      platform: "Facebook",
      color: "bg-blue-600"
    },
    "facebook-story": {
      width: 1080,
      height: 1920,
      label: "Facebook Story",
      platform: "Facebook",
      color: "bg-blue-600"
    },
    // Twitter/X
    "twitter-header": {
      width: 1500,
      height: 500,
      label: "Twitter Header",
      platform: "Twitter",
      color: "bg-black"
    },
    // LinkedIn
    "linkedin-post": {
      width: 1200,
      height: 627,
      label: "LinkedIn Post",
      platform: "LinkedIn",
      color: "bg-blue-700"
    },
    // YouTube
    "youtube-thumbnail": {
      width: 1280,
      height: 720,
      label: "YouTube Thumbnail",
      platform: "YouTube",
      color: "bg-red-600"
    },
    // Pinterest
    "pinterest-pin": {
      width: 1000,
      height: 1500,
      label: "Pinterest Pin",
      platform: "Pinterest",
      color: "bg-red-600"
    },
    // TikTok
    "tiktok-video": {
      width: 1080,
      height: 1920,
      label: "TikTok Video",
      platform: "TikTok",
      color: "bg-black"
    }
  };
  const devices = [{
    id: "desktop" as const,
    icon: Monitor,
    label: "Desktop"
  }, {
    id: "tablet" as const,
    icon: Tablet,
    label: "Tablet"
  }, {
    id: "mobile" as const,
    icon: Smartphone,
    label: "Mobile"
  }];
  const zoomOptions = [{
    value: "fit",
    label: "Fit to Screen"
  }, {
    value: 25,
    label: "25%"
  }, {
    value: 50,
    label: "50%"
  }, {
    value: 100,
    label: "100%"
  }, {
    value: 200,
    label: "200%"
  }, {
    value: 400,
    label: "400%"
  }];
  const currentSize = canvasSizes[selectedSize as keyof typeof canvasSizes];

  // Update canvas store when size changes
  useEffect(() => {
    canvasStore.updateCanvasSize({
      width: currentSize.width,
      height: currentSize.height
    });
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
      setDragStart({
        x: e.clientX,
        y: e.clientY
      });
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
      const loadingToast = toast.loading("Preparing export...");

      // Clear selection to hide nodes/handles
      const originalSelection = [...canvasStore.canvasState.selectedElementIds];
      canvasStore.clearSelection();

      // Wait for re-render without selection
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create a temporary canvas element for export
      const tempCanvas = document.createElement('div');
      tempCanvas.style.position = 'absolute';
      tempCanvas.style.left = '-9999px';
      tempCanvas.style.top = '-9999px';
      tempCanvas.style.width = `${currentSize.width}px`;
      tempCanvas.style.height = `${currentSize.height}px`;
      
      // Force solid background color
      const bgColor = canvasStore.canvasState.backgroundColor;
      tempCanvas.style.backgroundColor = bgColor;
      tempCanvas.style.opacity = '1';

      // Clone only the content without selection handles
      const canvasContent = canvasRef.current;
      const elementsOnly = canvasContent.cloneNode(true) as HTMLElement;

      // Force pure background on cloned element
      elementsOnly.style.backgroundColor = bgColor;
      elementsOnly.style.opacity = '1';
      elementsOnly.style.backgroundImage = 'none'; // Remove any background image for pure color
      
      // Apply background image only if specified
      if (canvasStore.canvasState.backgroundType === 'image' && canvasStore.canvasState.backgroundImageUrl) {
        elementsOnly.style.backgroundImage = `url(${canvasStore.canvasState.backgroundImageUrl})`;
        elementsOnly.style.backgroundSize = canvasStore.canvasState.backgroundMode === 'cover' ? 'cover' : canvasStore.canvasState.backgroundMode === 'contain' ? 'contain' : canvasStore.canvasState.backgroundMode === 'stretch' ? '100% 100%' : canvasStore.canvasState.backgroundMode === 'tile' ? 'auto' : 'auto';
        elementsOnly.style.backgroundRepeat = canvasStore.canvasState.backgroundMode === 'tile' ? 'repeat' : 'no-repeat';
        elementsOnly.style.backgroundPosition = 'center';
      }

      // Remove all selection handles and controls from the clone
      const controlsToRemove = elementsOnly.querySelectorAll('.resize-handle, .rotation-handle, .selection-outline, [class*="handle"], [class*="control"]');
      controlsToRemove.forEach(control => control.remove());
      
      tempCanvas.appendChild(elementsOnly);
      document.body.appendChild(tempCanvas);
      
      const canvas = await html2canvas(tempCanvas, {
        width: currentSize.width,
        height: currentSize.height,
        backgroundColor: bgColor,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        removeContainer: true,
        logging: false,
        imageTimeout: 0
      });

      // Clean up temp element
      document.body.removeChild(tempCanvas);

      // Restore original selection
      originalSelection.forEach(id => canvasStore.selectElement(id, true));

      // Convert to JPG and download
      canvas.toBlob(blob => {
        toast.dismiss(loadingToast);
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
  }, [currentSize, canvasRef, canvasStore]);

  // Expose export function through ref
  useImperativeHandle(ref, () => ({
    exportAsJPG
  }), [exportAsJPG]);
  return <div className="flex-1 bg-muted/20 p-4 flex flex-col overflow-hidden">
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Select value={selectedSize} onValueChange={setSelectedSize}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-96">
              {Object.entries(canvasSizes).map(([key, size]) => <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 ${size.color} rounded`}></div>
                    <span>{size.label}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{size.width}×{size.height}</span>
                  </div>
                </SelectItem>)}
            </SelectContent>
          </Select>

          
        </div>

        <div className="flex items-center gap-2">
          <Select value={zoomLevel.toString()} onValueChange={value => setZoomLevel(value === "fit" ? "fit" : Number(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {zoomOptions.map(option => <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Canvas Container */}
      <div ref={containerRef} className="flex-1 overflow-hidden bg-muted/50 rounded-lg relative" onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
        {/* Canvas */}
        <div className="absolute" style={{
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
        transformOrigin: 'center center'
      }}>
          <div ref={canvasRef} className="relative shadow-lg overflow-hidden" style={{
          width: currentSize.width,
          height: currentSize.height,
          minWidth: currentSize.width,
          minHeight: currentSize.height,
          backgroundColor: canvasStore.canvasState.backgroundColor,
          backgroundImage: canvasStore.canvasState.backgroundType === 'image' && canvasStore.canvasState.backgroundImageUrl ? `url(${canvasStore.canvasState.backgroundImageUrl})` : undefined,
          backgroundSize: canvasStore.canvasState.backgroundMode === 'cover' ? 'cover' : canvasStore.canvasState.backgroundMode === 'contain' ? 'contain' : canvasStore.canvasState.backgroundMode === 'stretch' ? '100% 100%' : canvasStore.canvasState.backgroundMode === 'tile' ? 'auto' : 'auto',
          backgroundRepeat: canvasStore.canvasState.backgroundMode === 'tile' ? 'repeat' : 'no-repeat',
          backgroundPosition: 'center',
          opacity: 1
        }}>
            {/* Canvas Elements */}
            {canvasStore.canvasState.elements.map(element => {
              const isEditing = editingElementId === element.id;
              
              return (
                <div key={element.id} className="relative">
                  {!isEditing && (
                    <CanvasElement 
                      element={element} 
                      isSelected={canvasStore.canvasState.selectedElementIds.includes(element.id)} 
                      scale={scale} 
                      onSelect={canvasStore.selectElement} 
                      onMove={canvasStore.moveElement} 
                      onResize={canvasStore.resizeElement} 
                      onRotate={canvasStore.rotateElement} 
                      onDoubleClick={elementId => {
                        if (element.type === 'text') {
                          const textElement = element as any;
                          setEditingElementId(elementId);
                          setEditingText(textElement.content || '');
                          // Focus the input after a brief delay to ensure it's rendered
                          setTimeout(() => {
                            editInputRef.current?.focus();
                            editInputRef.current?.select();
                          }, 0);
                        }
                      }} 
                    />
                  )}
                  
                  {isEditing && element.type === 'text' && (
                    <div
                      style={{
                        position: 'absolute',
                        left: element.position.x,
                        top: element.position.y,
                        width: element.size.width,
                        height: element.size.height,
                        transform: `rotate(${element.rotation}deg)`,
                        transformOrigin: 'top left',
                        zIndex: 1000,
                      }}
                    >
                      <textarea
                        ref={editInputRef}
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={() => {
                          canvasStore.updateElement(element.id, { content: editingText });
                          setEditingElementId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setEditingElementId(null);
                          } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            canvasStore.updateElement(element.id, { content: editingText });
                            setEditingElementId(null);
                          }
                        }}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: '2px solid #3b82f6',
                          outline: 'none',
                          resize: 'none',
                          background: 'rgba(255, 255, 255, 0.95)',
                          color: (element as any).color,
                          fontSize: `${(element as any).fontSize}px`,
                          fontFamily: (element as any).fontFamily,
                          fontWeight: (element as any).fontWeight,
                          textAlign: (element as any).textAlign,
                          direction: (element as any).direction || 'ltr',
                          padding: '4px',
                          overflow: 'auto',
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Canvas Info Overlay */}
        
      </div>
    </div>;
});