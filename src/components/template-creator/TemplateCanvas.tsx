import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Circle, Rect, Textbox, FabricImage, Polygon, Line } from "fabric";

interface TemplateCanvasProps {
  selectedTool: string;
  onElementSelect: (element: any) => void;
  canvasSize: { width: number; height: number };
  onCanvasReady?: (canvas: any) => void;
}

export function TemplateCanvas({ selectedTool, onElementSelect, canvasSize, onCanvasReady }: TemplateCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: canvasSize.width,
      height: canvasSize.height,
      backgroundColor: "#ffffff",
    });

    // Enable selection and manipulation
    canvas.selection = true;
    canvas.preserveObjectStacking = true;

    // Handle object selection
    canvas.on('selection:created', (e) => {
      onElementSelect(e.selected?.[0]);
    });

    canvas.on('selection:updated', (e) => {
      onElementSelect(e.selected?.[0]);
    });

    canvas.on('selection:cleared', () => {
      onElementSelect(null);
    });

    setFabricCanvas(canvas);
    onCanvasReady?.(canvas);

    return () => {
      canvas.dispose();
    };
  }, [onElementSelect]);

  // Update canvas size when canvasSize changes
  useEffect(() => {
    if (fabricCanvas) {
      fabricCanvas.setWidth(canvasSize.width);
      fabricCanvas.setHeight(canvasSize.height);
      fabricCanvas.renderAll();
    }
  }, [canvasSize, fabricCanvas]);

  // Handle tool selection
  useEffect(() => {
    if (!fabricCanvas) return;

    switch (selectedTool) {
      case "text":
        addText();
        break;
      case "rectangle":
        addRectangle();
        break;
      case "circle":
        addCircle();
        break;
      case "triangle":
        addTriangle();
        break;
      case "star":
        addStar();
        break;
      case "line":
        addLine();
        break;
      case "custom-shape":
        addCustomShape();
        break;
    }
  }, [selectedTool, fabricCanvas]);

  const addText = () => {
    const text = new Textbox("Click to edit text", {
      left: 50,
      top: 50,
      fontFamily: "Arial",
      fontSize: 20,
      fill: "#000000",
      width: 200,
    });
    fabricCanvas?.add(text);
    fabricCanvas?.setActiveObject(text);
  };

  const addRectangle = () => {
    const rect = new Rect({
      left: 50,
      top: 50,
      width: 100,
      height: 100,
      fill: "#3b82f6",
      stroke: "",
      strokeWidth: 0,
    });
    fabricCanvas?.add(rect);
    fabricCanvas?.setActiveObject(rect);
  };

  const addCircle = () => {
    const circle = new Circle({
      left: 50,
      top: 50,
      radius: 50,
      fill: "#ef4444",
      stroke: "",
      strokeWidth: 0,
    });
    fabricCanvas?.add(circle);
    fabricCanvas?.setActiveObject(circle);
  };

  const addTriangle = () => {
    const triangle = new Polygon([
      { x: 50, y: 0 },
      { x: 0, y: 100 },
      { x: 100, y: 100 }
    ], {
      left: 50,
      top: 50,
      fill: "#10b981",
      stroke: "",
      strokeWidth: 0,
    });
    fabricCanvas?.add(triangle);
    fabricCanvas?.setActiveObject(triangle);
  };

  const addStar = () => {
    const star = new Polygon([
      { x: 50, y: 0 },
      { x: 61, y: 35 },
      { x: 98, y: 35 },
      { x: 68, y: 57 },
      { x: 79, y: 91 },
      { x: 50, y: 70 },
      { x: 21, y: 91 },
      { x: 32, y: 57 },
      { x: 2, y: 35 },
      { x: 39, y: 35 }
    ], {
      left: 50,
      top: 50,
      fill: "#f59e0b",
      stroke: "",
      strokeWidth: 0,
    });
    fabricCanvas?.add(star);
    fabricCanvas?.setActiveObject(star);
  };

  const addLine = () => {
    const line = new Line([50, 50, 150, 50], {
      stroke: "#6b7280",
      strokeWidth: 3,
    });
    fabricCanvas?.add(line);
    fabricCanvas?.setActiveObject(line);
  };

  const addCustomShape = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.svg';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imgUrl = event.target?.result as string;
          FabricImage.fromURL(imgUrl).then((img) => {
            img.set({
              left: 50,
              top: 50,
              scaleX: 0.5,
              scaleY: 0.5,
            });
            fabricCanvas?.add(img);
            fabricCanvas?.setActiveObject(img);
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="flex justify-center items-center min-h-0 w-full">
      <div 
        className="border-2 border-dashed border-border bg-white shadow-lg max-w-full"
        style={{ 
          width: Math.min(canvasSize.width + 40, window.innerWidth - 100), 
          height: Math.min(canvasSize.height + 40, window.innerHeight - 200),
          padding: 20
        }}
      >
        <canvas 
          ref={canvasRef}
          className="border border-border max-w-full max-h-full"
          style={{
            width: '100%',
            height: 'auto',
            maxWidth: canvasSize.width,
            maxHeight: canvasSize.height
          }}
        />
      </div>
    </div>
  );
}