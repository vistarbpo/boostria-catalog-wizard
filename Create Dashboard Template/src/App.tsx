import { Header } from "./components/Header";
import { LeftSidebar } from "./components/LeftSidebar";
import { Canvas } from "./components/Canvas";
import { RightSidebar } from "./components/RightSidebar";
import { useCanvasStore } from "./hooks/useCanvasStore";
import { ProductProvider } from "./contexts/ProductContext";

export default function App() {
  const canvasStore = useCanvasStore();

  return (
    <ProductProvider>
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <Header />
        
        {/* Main Dashboard Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <LeftSidebar canvasStore={canvasStore} />
          
          {/* Canvas Area */}
          <Canvas canvasStore={canvasStore} />
          
          {/* Right Sidebar */}
          <RightSidebar canvasStore={canvasStore} />
        </div>
      </div>
    </ProductProvider>
  );
}