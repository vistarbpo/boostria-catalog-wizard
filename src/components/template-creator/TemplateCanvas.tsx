import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import { createRoot } from 'react-dom/client';
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Monitor, Smartphone, Tablet, ChevronDown } from "lucide-react";
import { CanvasElement } from "./CanvasElement";
import { useCanvasStore } from "../../hooks/useCanvasStore";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { ExportRenderer } from './ExportRenderer';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isBoxSelecting, setIsBoxSelecting] = useState(false);
  const [boxSelectStart, setBoxSelectStart] = useState({ x: 0, y: 0 });
  const [boxSelectEnd, setBoxSelectEnd] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
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

  const actualZoom = getActualZoom();
  const scale = actualZoom / 100;

  // Handle mouse drag panning or box selection
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      // Check if clicking on canvas background (not on an element)
      const target = e.target as HTMLElement;
      const isCanvasBackground = target === canvasRef.current || target.closest('[data-canvas-background]');
      
      if (isCanvasBackground) {
        // Clear selection if not holding Ctrl/Cmd
        if (!e.ctrlKey && !e.metaKey) {
          canvasStore.clearSelection();
        }
        
        // Start box selection
        if (!e.shiftKey) {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            const x = (e.clientX - rect.left - panOffset.x) / scale;
            const y = (e.clientY - rect.top - panOffset.y) / scale;
            setIsBoxSelecting(true);
            setBoxSelectStart({ x, y });
            setBoxSelectEnd({ x, y });
          }
        }
      } else {
        // Pan if shift key is held
        if (e.shiftKey) {
          setIsDragging(true);
          setDragStart({
            x: e.clientX,
            y: e.clientY
          });
          setLastPanOffset(panOffset);
        }
      }
    }
  }, [panOffset, canvasStore, scale]);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setPanOffset({
        x: lastPanOffset.x + deltaX,
        y: lastPanOffset.y + deltaY
      });
    } else if (isBoxSelecting) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - panOffset.x) / scale;
        const y = (e.clientY - rect.top - panOffset.y) / scale;
        setBoxSelectEnd({ x, y });
      }
    }
  }, [isDragging, dragStart, lastPanOffset, isBoxSelecting, panOffset, scale]);
  const handleMouseUp = useCallback(() => {
    if (isBoxSelecting) {
      // Calculate selection box bounds
      const minX = Math.min(boxSelectStart.x, boxSelectEnd.x);
      const maxX = Math.max(boxSelectStart.x, boxSelectEnd.x);
      const minY = Math.min(boxSelectStart.y, boxSelectEnd.y);
      const maxY = Math.max(boxSelectStart.y, boxSelectEnd.y);
      
      // Find elements within the box
      const selectedIds = canvasStore.canvasState.elements
        .filter(el => {
          const centerX = el.position.x + el.size.width / 2;
          const centerY = el.position.y + el.size.height / 2;
          return centerX >= minX && centerX <= maxX && centerY >= minY && centerY <= maxY;
        })
        .map(el => el.id);
      
      if (selectedIds.length > 0) {
        canvasStore.selectElements(selectedIds);
      }
      
      setIsBoxSelecting(false);
    }
    setIsDragging(false);
  }, [isBoxSelecting, boxSelectStart, boxSelectEnd, canvasStore]);

  // Export functionality
  const exportAsJPG = useCallback(async () => {
    try {
      const loadingToast = toast.loading("Preparing export...");

      // Clear selection to hide nodes/handles
      const originalSelection = [...canvasStore.canvasState.selectedElementIds];
      canvasStore.clearSelection();

      // Wait for re-render without selection
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get background color from canvas settings (default to white if not set)
      const bgColor = canvasStore.canvasState.backgroundColor || '#ffffff';

      // Create a temporary container for the export renderer
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = `${currentSize.width}px`;
      tempContainer.style.height = `${currentSize.height}px`;
      document.body.appendChild(tempContainer);

      // Render export view using React
      const root = createRoot(tempContainer);
      await new Promise<void>((resolve) => {
        root.render(
          <CurrencyProvider>
            <ExportRenderer
              elements={canvasStore.canvasState.elements}
              canvasWidth={currentSize.width}
              canvasHeight={currentSize.height}
              backgroundColor={bgColor}
              backgroundType={canvasStore.canvasState.backgroundType}
              backgroundImageUrl={canvasStore.canvasState.backgroundImageUrl}
              backgroundMode={canvasStore.canvasState.backgroundMode}
            />
          </CurrencyProvider>
        );
        // Wait for render to complete
        setTimeout(resolve, 200);
      });

      // Capture with html2canvas
      const exportElement = tempContainer.querySelector('#export-canvas') as HTMLElement;
      if (!exportElement) {
        throw new Error('Export canvas element not found');
      }
      
      const canvas = await html2canvas(exportElement, {
        width: currentSize.width,
        height: currentSize.height,
        backgroundColor: bgColor,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 0,
      });

      // Clean up
      root.unmount();
      document.body.removeChild(tempContainer);

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

  // Handle keyboard delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we're editing text
      if (editingElementId) return;
      
      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        canvasStore.undo();
        if (canvasStore.canUndo) {
          toast.success("Undone");
        }
      }
      
      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if (((e.ctrlKey || e.metaKey) && e.key === 'Z' && e.shiftKey) || 
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        canvasStore.redo();
        if (canvasStore.canRedo) {
          toast.success("Redone");
        }
      }
      
      // Group: Ctrl+G
      if ((e.ctrlKey || e.metaKey) && e.key === 'g' && !e.shiftKey) {
        e.preventDefault();
        const selectedElements = canvasStore.getSelectedElements();
        if (selectedElements.length >= 2) {
          canvasStore.groupSelectedElements();
          toast.success("Elements grouped");
        }
      }
      
      // Ungroup: Ctrl+Shift+G
      if ((e.ctrlKey || e.metaKey) && e.key === 'G' && e.shiftKey) {
        e.preventDefault();
        const selectedElements = canvasStore.getSelectedElements();
        if (selectedElements.length === 1 && selectedElements[0]?.type === 'group') {
          canvasStore.ungroupSelectedElement();
          toast.success("Elements ungrouped");
        }
      }
      
      // Check if Delete or Backspace was pressed
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Check if there's a selected element
        const selectedElements = canvasStore.getSelectedElements();
        if (selectedElements.length > 0) {
          e.preventDefault();
          setShowDeleteConfirm(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvasStore, editingElementId]);

  const handleConfirmDelete = () => {
    canvasStore.deleteSelected();
    setShowDeleteConfirm(false);
    toast.success("Element(s) deleted");
  };
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
          <div 
            ref={canvasRef} 
            data-canvas-background="true"
            className="relative shadow-lg overflow-hidden" 
            style={{
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
            }}
          >
            {/* Box Selection Rectangle */}
            {isBoxSelecting && (
              <div
                style={{
                  position: 'absolute',
                  left: Math.min(boxSelectStart.x, boxSelectEnd.x),
                  top: Math.min(boxSelectStart.y, boxSelectEnd.y),
                  width: Math.abs(boxSelectEnd.x - boxSelectStart.x),
                  height: Math.abs(boxSelectEnd.y - boxSelectStart.y),
                  border: '2px dashed hsl(var(--primary))',
                  backgroundColor: 'hsl(var(--primary) / 0.1)',
                  pointerEvents: 'none',
                  zIndex: 9999
                }}
              />
            )}
            
            {/* Canvas Elements */}
            {canvasStore.canvasState.elements.map(element => {
              const isEditing = editingElementId === element.id;
              
              return (
                <div key={element.id} className="relative">
                  {!isEditing && (
                    <CanvasElement 
                      element={element} 
                      isSelected={canvasStore.canvasState.selectedElementIds.includes(element.id)}
                      isMultiSelected={canvasStore.canvasState.selectedElementIds.length > 1 && canvasStore.canvasState.selectedElementIds.includes(element.id)}
                      scale={scale}
                      selectedElements={canvasStore.getSelectedElements()}
                      onSelect={canvasStore.selectElement}
                      onMove={canvasStore.moveElement}
                      onMoveMultiple={canvasStore.moveSelectedElements}
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
                        } else if (element.type === 'button') {
                          const buttonElement = element as any;
                          setEditingElementId(elementId);
                          setEditingText(buttonElement.content || '');
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
                        ref={editInputRef as any}
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
                  
                  {isEditing && element.type === 'button' && (
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
                      <input
                        ref={editInputRef as any}
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={() => {
                          canvasStore.updateElement(element.id, { content: editingText });
                          setEditingElementId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setEditingElementId(null);
                          } else if (e.key === 'Enter') {
                            canvasStore.updateElement(element.id, { content: editingText });
                            setEditingElementId(null);
                          }
                        }}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: '2px solid #3b82f6',
                          outline: 'none',
                          background: (element as any).backgroundColor,
                          color: (element as any).color,
                          fontSize: `${(element as any).fontSize}px`,
                          fontFamily: (element as any).fontFamily,
                          fontWeight: (element as any).fontWeight,
                          textAlign: (element as any).textAlign,
                          direction: (element as any).direction || 'ltr',
                          padding: `${(element as any).padding?.top || 0}px ${(element as any).padding?.right || 0}px ${(element as any).padding?.bottom || 0}px ${(element as any).padding?.left || 0}px`,
                          borderRadius: (element as any).cornerRadius ? `${(element as any).cornerRadius}px` : '0',
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Element(s)</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the selected element(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
});