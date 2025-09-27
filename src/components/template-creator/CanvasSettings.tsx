import { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Upload } from "lucide-react";
import { useCanvasStore } from "../../hooks/useCanvasStore";
import { useProduct } from "../../contexts/ProductContext";
import { toast } from "sonner";

interface CanvasSettingsProps {
  canvasStore: ReturnType<typeof useCanvasStore>;
}

export const CanvasSettings = ({ canvasStore }: CanvasSettingsProps) => {
  const [colorInput, setColorInput] = useState(canvasStore.canvasState.backgroundColor);
  const { currentProduct } = useProduct();

  const handleColorChange = (color: string) => {
    setColorInput(color);
    canvasStore.updateCanvasBackground(color, 'solid');
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string;
          canvasStore.updateCanvasBackground(
            canvasStore.canvasState.backgroundColor, 
            'image', 
            imageUrl, 
            'cover'
          );
          toast.success('Background image uploaded successfully!');
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  const handleImageFromFeed = (imageUrl: string) => {
    canvasStore.updateCanvasBackground(
      canvasStore.canvasState.backgroundColor, 
      'image', 
      imageUrl, 
      'cover'
    );
    toast.success('Background updated from product image!');
  };

  const presetColors = [
    '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6',
    '#000000', '#212529', '#343a40', '#495057',
    '#dc3545', '#fd7e14', '#ffc107', '#28a745',
    '#007bff', '#6610f2', '#e83e8c', '#20c997'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Canvas Background</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={canvasStore.canvasState.backgroundType} onValueChange={(value) => {
          if (value === 'solid') {
            canvasStore.updateCanvasBackground(colorInput, 'solid');
          }
        }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="solid">Solid Color</TabsTrigger>
            <TabsTrigger value="image">Image</TabsTrigger>
          </TabsList>
          
          <TabsContent value="solid" className="space-y-3">
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={colorInput}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-12 h-8 p-0 border-0"
                />
                <Input
                  type="text"
                  value={colorInput}
                  onChange={(e) => handleColorChange(e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Preset Colors</Label>
              <div className="grid grid-cols-8 gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border-2 hover:border-primary transition-colors"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="image" className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleImageUpload}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Background Image
            </Button>
            
            {canvasStore.canvasState.backgroundType === 'image' && (
              <div className="space-y-2">
                <Label>Fill Mode</Label>
                <Select 
                  value={canvasStore.canvasState.backgroundMode || 'cover'} 
                  onValueChange={(value: 'cover' | 'contain' | 'stretch' | 'center' | 'tile') => {
                    canvasStore.updateCanvasBackground(
                      canvasStore.canvasState.backgroundColor,
                      'image',
                      canvasStore.canvasState.backgroundImageUrl,
                      value
                    );
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cover">Cover</SelectItem>
                    <SelectItem value="contain">Contain</SelectItem>
                    <SelectItem value="stretch">Stretch</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="tile">Tile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {Object.keys(currentProduct.media).length > 0 && (
              <div className="space-y-2">
                <Label>From Product Images</Label>
                <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                  {Object.entries(currentProduct.media).slice(0, 12).map(([key, media]) => (
                    <img
                      key={key}
                      src={media.url}
                      alt={media.name}
                      className="w-12 h-12 rounded border object-cover cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleImageFromFeed(media.url)}
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};