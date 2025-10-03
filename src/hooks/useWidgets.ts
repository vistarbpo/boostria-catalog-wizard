import { useState, useEffect, useCallback } from 'react';
import { CanvasElement } from '@/types/canvas';

export interface SavedWidget {
  id: string;
  name: string;
  thumbnail?: string;
  elements: CanvasElement[];
  createdAt: number;
}

const WIDGETS_STORAGE_KEY = 'canvas_widgets';

export function useWidgets() {
  const [widgets, setWidgets] = useState<SavedWidget[]>([]);

  // Load widgets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WIDGETS_STORAGE_KEY);
      console.log('useWidgets - Loading from localStorage:', stored);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('useWidgets - Parsed widgets:', parsed);
        setWidgets(parsed);
      }
    } catch (error) {
      console.error('Failed to load widgets:', error);
    }
  }, []);

  // Save widgets to localStorage whenever they change
  const saveToStorage = useCallback((newWidgets: SavedWidget[]) => {
    try {
      const stringified = JSON.stringify(newWidgets);
      console.log('useWidgets - Saving to localStorage:', stringified);
      localStorage.setItem(WIDGETS_STORAGE_KEY, stringified);
      console.log('useWidgets - Saved successfully');
    } catch (error) {
      console.error('Failed to save widgets:', error);
    }
  }, []);

  const addWidget = useCallback((name: string, elements: CanvasElement[]) => {
    const newWidget: SavedWidget = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      elements,
      createdAt: Date.now()
    };

    console.log('useWidgets - Adding new widget:', newWidget);

    setWidgets(prev => {
      const updated = [...prev, newWidget];
      console.log('useWidgets - Updated widgets array:', updated);
      saveToStorage(updated);
      return updated;
    });

    return newWidget;
  }, [saveToStorage]);

  const deleteWidget = useCallback((widgetId: string) => {
    setWidgets(prev => {
      const updated = prev.filter(w => w.id !== widgetId);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const renameWidget = useCallback((widgetId: string, newName: string) => {
    setWidgets(prev => {
      const updated = prev.map(w => 
        w.id === widgetId ? { ...w, name: newName } : w
      );
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  return {
    widgets,
    addWidget,
    deleteWidget,
    renameWidget
  };
}
