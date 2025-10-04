import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { X, Plus, Trash2 } from "lucide-react";
import { TextElement } from "../../types/canvas";

interface DynamicFieldSettingsProps {
  element: TextElement;
  open: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<TextElement>) => void;
}

type ModifierType = 'add' | 'subtract' | 'multiply' | 'divide' | 'decimals';

const modifierDescriptions: Record<ModifierType, string> = {
  add: 'Outputs the addition of column data by an additional number or feed column',
  subtract: 'Outputs the subtraction of column data by an additional number or feed column',
  multiply: 'Outputs the multiplication of column data by an additional number or feed column',
  divide: 'Outputs the dividend of column data by an additional number or feed column',
  decimals: 'Format numbers to a specific number of decimal places with rounding options',
};

export function DynamicFieldSettings({ element, open, onClose, onUpdate }: DynamicFieldSettingsProps) {
  const [modifiers, setModifiers] = useState(element.modifiers || []);
  const [formatting, setFormatting] = useState(element.formatting || {});

  const addModifier = () => {
    const newModifier = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'add' as ModifierType,
      value: 0,
    };
    setModifiers([...modifiers, newModifier]);
  };

  const updateModifier = (id: string, updates: Partial<{ type: ModifierType; value: number }>) => {
    setModifiers(modifiers.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const removeModifier = (id: string) => {
    setModifiers(modifiers.filter(m => m.id !== id));
  };

  const handleSave = () => {
    onUpdate({
      modifiers,
      formatting,
    });
    onClose();
  };

  // Calculate preview value
  const getPreview = () => {
    let value = 87.99; // Sample value
    
    // Apply modifiers
    modifiers.forEach(mod => {
      switch (mod.type) {
        case 'add':
          value += mod.value;
          break;
        case 'subtract':
          value -= mod.value;
          break;
        case 'multiply':
          value *= mod.value;
          break;
        case 'divide':
          value = mod.value !== 0 ? value / mod.value : value;
          break;
        case 'decimals':
          value = parseFloat(value.toFixed(mod.value));
          break;
      }
    });

    // Apply formatting
    let formatted = value.toFixed(formatting.decimals ?? 2);
    if (formatting.thousandsSeparator) {
      formatted = parseFloat(formatted).toLocaleString('en-US', {
        minimumFractionDigits: formatting.decimals ?? 2,
        maximumFractionDigits: formatting.decimals ?? 2,
      });
    }
    if (formatting.prefix) formatted = formatting.prefix + formatted;
    if (formatting.suffix) formatted = formatted + formatting.suffix;
    if (formatting.currencySymbol) formatted = formatting.currencySymbol + formatted;

    return formatted;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Dynamic Layer Settings</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Select a column from your source feed. The selected column will determine which product data fills this layer.
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Field Selection and Formatting Preview */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Choose a Field</Label>
              <div className="bg-muted/50 rounded-md p-3 flex items-center">
                <span className="text-sm font-medium">{element.dynamicField || 'No field selected'}</span>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Formatting</Label>
              <div className="bg-muted/50 rounded-md p-3 flex items-center">
                <span className="text-sm font-medium">{getPreview()}</span>
              </div>
            </div>
          </div>

          {/* Formatting Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Formatting Options</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Currency Symbol</Label>
                <Input
                  placeholder="$"
                  value={formatting.currencySymbol || ''}
                  onChange={e => setFormatting({ ...formatting, currencySymbol: e.target.value })}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">Decimals</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={formatting.decimals ?? 2}
                  onChange={e => setFormatting({ ...formatting, decimals: parseInt(e.target.value) || 0 })}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">Prefix</Label>
                <Input
                  placeholder="Before value"
                  value={formatting.prefix || ''}
                  onChange={e => setFormatting({ ...formatting, prefix: e.target.value })}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">Suffix</Label>
                <Input
                  placeholder="After value"
                  value={formatting.suffix || ''}
                  onChange={e => setFormatting({ ...formatting, suffix: e.target.value })}
                  className="h-8"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="thousands"
                checked={formatting.thousandsSeparator || false}
                onChange={e => setFormatting({ ...formatting, thousandsSeparator: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="thousands" className="text-xs cursor-pointer">Use thousands separator</Label>
            </div>
          </div>

          {/* Modifiers Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Field Modifier(s)</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addModifier}
                className="h-8"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Modifier
              </Button>
            </div>

            {modifiers.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-md">
                No modifiers added yet
              </div>
            )}

            {modifiers.map((modifier, index) => (
              <div key={modifier.id} className="bg-muted/30 rounded-md p-4 space-y-3">
                <div className="grid grid-cols-[1fr_auto] gap-3 items-start">
                  <div className="space-y-2">
                    <Select
                      value={modifier.type}
                      onValueChange={(value: ModifierType) => updateModifier(modifier.id, { type: value })}
                    >
                      <SelectTrigger className="h-9 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="add">
                          <div>
                            <div className="font-medium">Add</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {modifierDescriptions.add}
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="subtract">
                          <div>
                            <div className="font-medium">Subtract</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {modifierDescriptions.subtract}
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="multiply">
                          <div>
                            <div className="font-medium">Multiply</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {modifierDescriptions.multiply}
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="divide">
                          <div>
                            <div className="font-medium">Divide</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {modifierDescriptions.divide}
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="decimals">
                          <div>
                            <div className="font-medium">Decimals</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {modifierDescriptions.decimals}
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {modifierDescriptions[modifier.type]}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={modifier.value}
                      onChange={e => updateModifier(modifier.id, { value: parseFloat(e.target.value) || 0 })}
                      className="h-9 w-24"
                      step="0.01"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeModifier(modifier.id)}
                      className="h-9 w-9"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
