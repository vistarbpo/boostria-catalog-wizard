import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Share2, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface TemplateHeaderProps {
  fabricCanvas?: any;
}

export function TemplateHeader({ fabricCanvas }: TemplateHeaderProps) {
  const navigate = useNavigate();
  
  const handleExport = () => {
    if (!fabricCanvas) {
      toast.error("Canvas not ready for export");
      return;
    }
    
    // Export as PNG
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2, // For higher resolution
    });
    
    // Create download link
    const link = document.createElement('a');
    link.download = 'template-preview.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Template exported successfully!");
  };
  
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Input 
          defaultValue="Untitled Template"
          className="w-64 bg-background"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>
    </header>
  );
}