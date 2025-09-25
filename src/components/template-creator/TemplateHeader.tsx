import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { 
  Save, 
  Download, 
  Share, 
  Undo, 
  Redo,
  Settings,
  User,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function TemplateHeader() {
  const navigate = useNavigate();

  return (
    <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/templates")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Templates
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Redo className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Center Section */}
      <div className="flex items-center gap-2">
        <Input 
          placeholder="Untitled Template" 
          className="w-48 h-8 text-center"
          defaultValue="My Template"
        />
        <Badge variant="secondary">Draft</Badge>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Share className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <Button size="sm">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
        
        <div className="ml-2 flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <User className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}