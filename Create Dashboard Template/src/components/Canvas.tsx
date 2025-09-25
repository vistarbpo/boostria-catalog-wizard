import { useState, useRef, useCallback, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Monitor, Smartphone, Tablet, ChevronDown } from "lucide-react";
import { CanvasElement } from "./CanvasElement";
import { useCanvasStore } from "../hooks/useCanvasStore";

interface CanvasProps {
  canvasStore: ReturnType<typeof useCanvasStore>;
}

export function Canvas({ canvasStore }: CanvasProps) {
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
    "facebook-cover": { width: 1640, height: 859, label: "Facebook Cover", platform: "Meta", color: "bg-blue-600" },
    "instagram-post-square": { width: 1080, height: 1080, label: "Instagram Post (Square)", platform: "Meta", color: "bg-gradient-to-br from-purple-500 to-pink-500" },
    "instagram-post-portrait": { width: 1080, height: 1350, label: "Instagram Post (Portrait)", platform: "Meta", color: "bg-gradient-to-br from-purple-500 to-pink-500" },
    "instagram-story": { width: 1080, height: 1920, label: "Instagram Story", platform: "Meta", color: "bg-gradient-to-br from-purple-500 to-pink-500" },
    "instagram-reels": { width: 1080, height: 1920, label: "Instagram Reels", platform: "Meta", color: "bg-gradient-to-br from-purple-500 to-pink-500" },
    
    // Google
    "google-display-banner": { width: 728, height: 90, label: "Display Banner", platform: "Google", color: "bg-red-500" },
    "google-display-medium": { width: 300, height: 250, label: "Medium Rectangle", platform: "Google", color: "bg-red-500" },
    "google-display-large": { width: 336, height: 280, label: "Large Rectangle", platform: "Google", color: "bg-red-500" },
    "google-display-skyscraper": { width: 160, height: 600, label: "Skyscraper", platform: "Google", color: "bg-red-500" },
    "youtube-video": { width: 1920, height: 1080, label: "YouTube Video", platform: "Google", color: "bg-red-600" },
    "youtube-thumbnail": { width: 1280, height: 720, label: "YouTube Thumbnail", platform: "Google", color: "bg-red-600" },
    "youtube-short": { width: 1080, height: 1920, label: "YouTube Short", platform: "Google", color: "bg-red-600" },
    
    // TikTok
    "tiktok-video": { width: 1080, height: 1920, label: "TikTok Video", platform: "TikTok", color: "bg-black" },
    "tiktok-spark": { width: 1080, height: 1920, label: "Spark Ads", platform: "TikTok", color: "bg-black" },
    
    // Snapchat
    "snapchat-ad": { width: 1080, height: 1920, label: "Snap Ad", platform: "Snapchat", color: "bg-yellow-400" },
    "snapchat-collection": { width: 1080, height: 1920, label: "Collection Ad", platform: "Snapchat", color: "bg-yellow-400" },
    
    // Pinterest
    "pinterest-pin-standard": { width: 1000, height: 1500, label: "Pinterest Pin (Standard)", platform: "Pinterest", color: "bg-red-600" },
    "pinterest-pin-square": { width: 1080, height: 1080, label: "Pinterest Pin (Square)", platform: "Pinterest", color: "bg-red-600" },
    "pinterest-story": { width: 1080, height: 1920, label: "Pinterest Story Pin", platform: "Pinterest", color: "bg-red-600" },
    
    // WhatsApp
    "whatsapp-status": { width: 1080, height: 1920, label: "WhatsApp Status", platform: "WhatsApp", color: "bg-green-500" },
    "whatsapp-business": { width: 1200, height: 630, label: "WhatsApp Business", platform: "WhatsApp", color: "bg-green-500" },
    
    // X (Twitter)
    "x-post": { width: 1200, height: 675, label: "X Post", platform: "X", color: "bg-black" },
    "x-header": { width: 1500, height: 500, label: "X Header", platform: "X", color: "bg-black" },
    "x-card": { width: 1200, height: 628, label: "X Card", platform: "X", color: "bg-black" }
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
  }, [currentSize.width, currentSize.height]);
  
  // Calculate fit to screen zoom
  const calculateFitToScreenZoom = useCallback(() => {
    if (!containerRef.current) return 50;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width - 120; // Increased padding for better spacing
    const containerHeight = containerRect.height - 120; // Increased padding for better spacing
    
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
    if (e.button === 0) { // Left mouse button
      // Clear selection when clicking on empty canvas
      canvasStore.clearSelection();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setLastPanOffset(panOffset);
    }
  }, [panOffset, canvasStore.clearSelection]);

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

  // Global mouse events for drag continuation outside container
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        
        setPanOffset({
          x: lastPanOffset.x + deltaX,
          y: lastPanOffset.y + deltaY
        });
      };

      const handleGlobalMouseUp = () => {
        setIsDragging(false);
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragStart, lastPanOffset]);

  // Update fit zoom when container size changes
  useEffect(() => {
    if (zoomLevel === "fit") {
      const handleResize = () => {
        // Force re-render to recalculate fit zoom
        setZoomLevel("fit");
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [zoomLevel]);

  // Reset pan offset when switching to fit zoom to center the canvas
  useEffect(() => {
    if (zoomLevel === "fit") {
      setPanOffset({ x: 0, y: 0 });
    }
  }, [zoomLevel]);

  const actualZoom = getActualZoom();
  const scale = actualZoom / 100;

  return (
    <div className="flex-1 bg-muted/20 p-4 flex flex-col overflow-hidden">
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-4">
        {/* Canvas Size Selection */}
        <div className="flex items-center gap-4">
          <Select value={selectedSize} onValueChange={setSelectedSize}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-96">
              {/* Meta Platform */}
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50">
                Meta
              </div>
              <SelectItem value="facebook-feed">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span>Facebook Feed</span>
                  <span className="text-xs text-muted-foreground ml-auto">1200×630</span>
                </div>
              </SelectItem>
              <SelectItem value="facebook-story">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span>Facebook Story</span>
                  <span className="text-xs text-muted-foreground ml-auto">1080×1920</span>
                </div>
              </SelectItem>
              <SelectItem value="facebook-cover">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span>Facebook Cover</span>
                  <span className="text-xs text-muted-foreground ml-auto">1640×859</span>
                </div>
              </SelectItem>
              <SelectItem value="instagram-post-square">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded"></div>
                  <span>Instagram Post (Square)</span>
                  <span className="text-xs text-muted-foreground ml-auto">1080×1080</span>
                </div>
              </SelectItem>
              <SelectItem value="instagram-post-portrait">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded"></div>
                  <span>Instagram Post (Portrait)</span>
                  <span className="text-xs text-muted-foreground ml-auto">1080×1350</span>
                </div>
              </SelectItem>
              <SelectItem value="instagram-story">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                  <span>Instagram Story</span>
                  <span className="text-xs text-muted-foreground ml-auto">1080×1920</span>
                </div>
              </SelectItem>
              <SelectItem value="instagram-reels">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded"></div>
                  <span>Instagram Reels</span>
                  <span className="text-xs text-muted-foreground ml-auto">1080×1920</span>
                </div>
              </SelectItem>

              {/* Google Platform */}
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50 border-t mt-1">
                Google
              </div>
              <SelectItem value="google-display-banner">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Display Banner</span>
                  <span className="text-xs text-muted-foreground ml-auto">728×90</span>
                </div>
              </SelectItem>
              <SelectItem value="google-display-medium">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Medium Rectangle</span>
                  <span className="text-xs text-muted-foreground ml-auto">300×250</span>
                </div>
              </SelectItem>
              <SelectItem value="google-display-large">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Large Rectangle</span>
                  <span className="text-xs text-muted-foreground ml-auto">336×280</span>
                </div>
              </SelectItem>
              <SelectItem value="google-display-skyscraper">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Skyscraper</span>
                  <span className="text-xs text-muted-foreground ml-auto">160×600</span>
                </div>
              </SelectItem>
              <SelectItem value="youtube-video">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span>YouTube Video</span>
                  <span className="text-xs text-muted-foreground ml-auto">1920×1080</span>
                </div>
              </SelectItem>
              <SelectItem value="youtube-thumbnail">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span>YouTube Thumbnail</span>
                  <span className="text-xs text-muted-foreground ml-auto">1280×720</span>
                </div>
              </SelectItem>
              <SelectItem value="youtube-short">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span>YouTube Short</span>
                  <span className="text-xs text-muted-foreground ml-auto">1080×1920</span>
                </div>
              </SelectItem>

              {/* TikTok Platform */}
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50 border-t mt-1">
                TikTok
              </div>
              <SelectItem value="tiktok-video">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-black rounded"></div>
                  <span>TikTok Video</span>
                  <span className="text-xs text-muted-foreground ml-auto">1080×1920</span>
                </div>
              </SelectItem>
              <SelectItem value="tiktok-spark">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-black rounded"></div>
                  <span>Spark Ads</span>
                  <span className="text-xs text-muted-foreground ml-auto">1080×1920</span>
                </div>
              </SelectItem>

              {/* Snapchat Platform */}
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50 border-t mt-1">
                Snapchat
              </div>
              <SelectItem value="snapchat-ad">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                  <span>Snap Ad</span>
                  <span className="text-xs text-muted-foreground ml-auto">1080×1920</span>
                </div>
              </SelectItem>
              <SelectItem value="snapchat-collection">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                  <span>Collection Ad</span>
                  <span className="text-xs text-muted-foreground ml-auto">1080×1920</span>
                </div>
              </SelectItem>

              {/* Pinterest Platform */}
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50 border-t mt-1">
                Pinterest
              </div>
              <SelectItem value="pinterest-pin-standard">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span>Pinterest Pin (Standard)</span>
                  <span className="text-xs text-muted-foreground ml-auto">1000×1500</span>
                </div>
              </SelectItem>
              <SelectItem value="pinterest-pin-square">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span>Pinterest Pin (Square)</span>
                  <span className="text-xs text-muted-foreground ml-auto">1080×1080</span>
                </div>
              </SelectItem>
              <SelectItem value="pinterest-story">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span>Pinterest Story Pin</span>
                  <span className="text-xs text-muted-foreground ml-auto">1080×1920</span>
                </div>
              </SelectItem>

              {/* WhatsApp Platform */}
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50 border-t mt-1">
                WhatsApp
              </div>
              <SelectItem value="whatsapp-status">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>WhatsApp Status</span>
                  <span className="text-xs text-muted-foreground ml-auto">1080×1920</span>
                </div>
              </SelectItem>
              <SelectItem value="whatsapp-business">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>WhatsApp Business</span>
                  <span className="text-xs text-muted-foreground ml-auto">1200×630</span>
                </div>
              </SelectItem>

              {/* X Platform */}
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50 border-t mt-1">
                X
              </div>
              <SelectItem value="x-post">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-black rounded"></div>
                  <span>X Post</span>
                  <span className="text-xs text-muted-foreground ml-auto">1200×675</span>
                </div>
              </SelectItem>
              <SelectItem value="x-header">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-black rounded"></div>
                  <span>X Header</span>
                  <span className="text-xs text-muted-foreground ml-auto">1500×500</span>
                </div>
              </SelectItem>
              <SelectItem value="x-card">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-black rounded"></div>
                  <span>X Card</span>
                  <span className="text-xs text-muted-foreground ml-auto">1200×628</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>


      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden bg-muted/10 select-none"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ 
          cursor: isDragging ? "grabbing" : "grab"
        }}
      >
        <div 
          className="relative flex items-center justify-center"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* Canvas */}
          <div
            ref={canvasRef}
            className="relative"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center center",
            }}
          >
            <Card 
              className="bg-white shadow-lg relative overflow-hidden border-2 border-gray-200"
              style={{
                width: `${currentSize.width}px`,
                height: `${currentSize.height}px`,
              }}
            >
              {/* Canvas Elements */}
              <div className="w-full h-full bg-white relative">
                {canvasStore.canvasState.elements.map((element) => (
                  <CanvasElement
                    key={element.id}
                    element={element}
                    isSelected={canvasStore.canvasState.selectedElementIds.includes(element.id)}
                    scale={scale}
                    onSelect={canvasStore.selectElement}
                    onMove={canvasStore.moveElement}
                    onResize={canvasStore.resizeElement}
                  />
                ))}
                
                {/* Empty state message */}
                {canvasStore.canvasState.elements.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="text-lg mb-2">Empty Canvas</div>
                      <div className="text-sm">Add shapes, text, or images from the left panel</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Canvas Info Badge */}
          <Badge variant="secondary" className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 pointer-events-none">
            {currentSize.width} × {currentSize.height} • {Math.round(actualZoom)}%
          </Badge>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="flex justify-center mt-4">
        <div className="flex items-center gap-1 bg-card rounded-lg p-1 border">
          {zoomOptions.map((option) => (
            <Button
              key={option.value}
              variant={zoomLevel === option.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setZoomLevel(option.value)}
              className="min-w-[80px]"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}