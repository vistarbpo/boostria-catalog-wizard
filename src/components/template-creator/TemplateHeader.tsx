import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function TemplateHeader() {
  const navigate = useNavigate();
  
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
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>
    </header>
  );
}