import * as React from "react";
import { HexColorPicker, RgbaColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Input } from "./input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
import { Label } from "./label";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

const PRESET_COLORS = [
  "#000000", "#ffffff", "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#84cc16", "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
];

// Convert hex to rgba object
function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 1,
      }
    : { r: 0, g: 0, b: 0, a: 1 };
}

// Convert rgba object to hex
function rgbaToHex(rgba: { r: number; g: number; b: number; a: number }): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`;
}

// Convert rgba object to css string
function rgbaToCss(rgba: { r: number; g: number; b: number; a: number }): string {
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [format, setFormat] = React.useState<"hex" | "rgba">("hex");
  const [color, setColor] = React.useState(value);
  const [rgbaColor, setRgbaColor] = React.useState(hexToRgba(value));
  const [recentColors, setRecentColors] = React.useState<string[]>(() => {
    const saved = localStorage.getItem("recent-colors");
    return saved ? JSON.parse(saved) : [];
  });

  // Update color when value prop changes
  React.useEffect(() => {
    setColor(value);
    setRgbaColor(hexToRgba(value));
  }, [value]);

  const handleColorChange = (newColor: string | { r: number; g: number; b: number; a: number }) => {
    if (typeof newColor === "string") {
      // HEX format
      setColor(newColor);
      setRgbaColor(hexToRgba(newColor));
      onChange(newColor);
      addToRecent(newColor);
    } else {
      // RGBA format
      setRgbaColor(newColor);
      const hexColor = rgbaToHex(newColor);
      setColor(hexColor);
      onChange(hexColor);
      addToRecent(hexColor);
    }
  };

  const addToRecent = (color: string) => {
    setRecentColors((prev) => {
      const newRecent = [color, ...prev.filter((c) => c !== color)].slice(0, 10);
      localStorage.setItem("recent-colors", JSON.stringify(newRecent));
      return newRecent;
    });
  };

  const handleManualInput = (input: string) => {
    // Try to parse as hex
    if (/^#[0-9A-F]{6}$/i.test(input)) {
      handleColorChange(input);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("h-8 justify-start gap-2", className)}
        >
          <div
            className="w-5 h-5 rounded border border-border"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs font-mono">{color.toUpperCase()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 z-50 bg-popover" align="start">
        <Tabs value={format} onValueChange={(v) => setFormat(v as "hex" | "rgba")}>
          <TabsList className="grid w-full grid-cols-2 mb-3">
            <TabsTrigger value="hex" className="text-xs">HEX</TabsTrigger>
            <TabsTrigger value="rgba" className="text-xs">RGBA</TabsTrigger>
          </TabsList>

          <TabsContent value="hex" className="space-y-3 mt-0">
            <HexColorPicker color={color} onChange={handleColorChange} className="!w-full" />
            
            <div>
              <Label className="text-xs mb-1 block">Hex Value</Label>
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                onBlur={(e) => handleManualInput(e.target.value)}
                className="h-8 font-mono text-xs"
              />
            </div>
          </TabsContent>

          <TabsContent value="rgba" className="space-y-3 mt-0">
            <RgbaColorPicker color={rgbaColor} onChange={handleColorChange} className="!w-full" />
            
            <div className="grid grid-cols-4 gap-1">
              <div>
                <Label className="text-xs">R</Label>
                <Input
                  type="number"
                  min="0"
                  max="255"
                  value={rgbaColor.r}
                  onChange={(e) =>
                    handleColorChange({ ...rgbaColor, r: parseInt(e.target.value) || 0 })
                  }
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">G</Label>
                <Input
                  type="number"
                  min="0"
                  max="255"
                  value={rgbaColor.g}
                  onChange={(e) =>
                    handleColorChange({ ...rgbaColor, g: parseInt(e.target.value) || 0 })
                  }
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">B</Label>
                <Input
                  type="number"
                  min="0"
                  max="255"
                  value={rgbaColor.b}
                  onChange={(e) =>
                    handleColorChange({ ...rgbaColor, b: parseInt(e.target.value) || 0 })
                  }
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">A</Label>
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={rgbaColor.a}
                  onChange={(e) =>
                    handleColorChange({ ...rgbaColor, a: parseFloat(e.target.value) || 0 })
                  }
                  className="h-7 text-xs"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Presets */}
        <div className="mt-3">
          <Label className="text-xs mb-2 block">Presets</Label>
          <div className="grid grid-cols-9 gap-1">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: presetColor }}
                onClick={() => handleColorChange(presetColor)}
                title={presetColor}
              />
            ))}
          </div>
        </div>

        {/* Recent Colors */}
        {recentColors.length > 0 && (
          <div className="mt-3">
            <Label className="text-xs mb-2 block">Recent</Label>
            <div className="flex gap-1 flex-wrap">
              {recentColors.map((recentColor, idx) => (
                <button
                  key={idx}
                  className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: recentColor }}
                  onClick={() => handleColorChange(recentColor)}
                  title={recentColor}
                />
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
