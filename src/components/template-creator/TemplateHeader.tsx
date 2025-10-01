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
  ArrowLeft,
  Group,
  Ungroup
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCanvasStore } from "../../hooks/useCanvasStore";

interface TemplateHeaderProps {
  onExport?: () => Promise<void>;
  canvasStore: ReturnType<typeof useCanvasStore>;
}

export function TemplateHeader({ onExport, canvasStore }: TemplateHeaderProps) {
  const navigate = useNavigate();
  const selectedElements = canvasStore.getSelectedElements();
  const canGroup = selectedElements.length >= 2;
  const canUngroup = selectedElements.length === 1 && selectedElements[0]?.type === 'group';

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

        {/* Group/Ungroup Buttons */}
        <div className="flex items-center gap-1 border-l pl-2 ml-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={canvasStore.groupSelectedElements}
            disabled={!canGroup}
            title="Group elements (Ctrl+G)"
          >
            <Group className="w-4 h-4 mr-2" />
            Group
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={canvasStore.ungroupSelectedElement}
            disabled={!canUngroup}
            title="Ungroup elements (Ctrl+Shift+G)"
          >
            <Ungroup className="w-4 h-4 mr-2" />
            Ungroup
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
        <Button variant="outline" size="sm" onClick={onExport} disabled={!onExport}>
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