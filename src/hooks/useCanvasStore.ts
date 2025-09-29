import { useState, useCallback } from 'react';
import { CanvasElement, CanvasState, TextElement, ShapeElement, ImageElement, SVGElement, Position } from '../types/canvas';

const generateId = () => Math.random().toString(36).substr(2, 9);

export function useCanvasStore() {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    elements: [],
    selectedElementIds: [],
    canvasSize: { width: 1000, height: 1500 },
    zoom: 100,
    panOffset: { x: 0, y: 0 },
    backgroundColor: '#ffffff',
    backgroundType: 'solid'
  });

  const addTextElement = useCallback((position: Position, initialContent?: string) => {
    setCanvasState(prev => {
      const newElement: TextElement = {
        id: generateId(),
        type: 'text',
        position,
        size: { width: 200, height: 100 },
        rotation: 0,
        opacity: 100,
        visible: true,
        locked: false,
        zIndex: prev.elements.length + 1,
        content: initialContent || 'Text',
        fontFamily: 'Inter',
        fontSize: 32,
        fontWeight: '400',
        color: '#000000',
        textAlign: 'left',
        direction: 'ltr',
        letterSpacing: 0,
        lineHeight: 1.2,
        autoSize: false,
        textWrapping: true,
        strokeColor: undefined,
        strokeWidth: 0,
        padding: { top: 8, right: 8, bottom: 8, left: 8 }
      };

      return {
        ...prev,
        elements: [...prev.elements, newElement],
        selectedElementIds: [newElement.id]
      };
    });
  }, []);

  const addShapeElement = useCallback((shapeType: ShapeElement['shapeType'], position: Position) => {
    setCanvasState(prev => {
      const size = shapeType === 'circle' ? { width: 100, height: 100 } : { width: 120, height: 80 };
      
      const newElement: ShapeElement = {
        id: generateId(),
        type: 'shape',
        position,
        size,
        rotation: 0,
        opacity: 100,
        visible: true,
        locked: false,
        zIndex: prev.elements.length + 1,
        shapeType,
        fillColor: '#000000',
        fillType: 'solid',
        fillSource: undefined,
        fillImageUrl: undefined,
        fillMode: 'cover',
        strokeColor: undefined,
        strokeWidth: 0,
        cornerRadius: shapeType === 'rectangle' ? 8 : undefined
      };

      return {
        ...prev,
        elements: [...prev.elements, newElement],
        selectedElementIds: [newElement.id]
      };
    });
  }, []);

  const addImageElement = useCallback((src: string, position?: Position) => {
    // Create a temporary image to get natural dimensions
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img;
      
      // Scale down if image is too large (max 800px on longest side)
      const maxSize = 800;
      let width = naturalWidth;
      let height = naturalHeight;
      
      if (width > maxSize || height > maxSize) {
        const aspectRatio = width / height;
        if (width > height) {
          width = maxSize;
          height = maxSize / aspectRatio;
        } else {
          height = maxSize;
          width = maxSize * aspectRatio;
        }
      }
      
      setCanvasState(prev => {
        // Calculate center position if not provided
        const finalPosition = position || {
          x: (prev.canvasSize.width - Math.round(width)) / 2,
          y: (prev.canvasSize.height - Math.round(height)) / 2
        };
        
        const newElement: ImageElement = {
          id: generateId(),
          type: 'image',
          position: finalPosition,
          size: { width: Math.round(width), height: Math.round(height) },
          rotation: 0,
          opacity: 100,
          visible: true,
          locked: false,
          zIndex: prev.elements.length + 1,
          src,
          objectFit: 'cover',
          fillType: 'original',
          fillMode: 'cover'
        };

        return {
          ...prev,
          elements: [...prev.elements, newElement],
          selectedElementIds: [newElement.id]
        };
      });
    };
    
    img.onerror = () => {
      // Fallback to default size if image fails to load
      setCanvasState(prev => {
        // Calculate center position if not provided
        const finalPosition = position || {
          x: (prev.canvasSize.width - 200) / 2,
          y: (prev.canvasSize.height - 200) / 2
        };
        
        const newElement: ImageElement = {
          id: generateId(),
          type: 'image',
          position: finalPosition,
          size: { width: 200, height: 200 },
          rotation: 0,
          opacity: 100,
          visible: true,
          locked: false,
          zIndex: prev.elements.length + 1,
          src,
          objectFit: 'cover',
          fillType: 'original',
          fillMode: 'cover'
        };

        return {
          ...prev,
          elements: [...prev.elements, newElement],
          selectedElementIds: [newElement.id]
        };
      });
    };
    
    img.src = src;
  }, []);

  const addSVGElement = useCallback((svgContent: string, position: Position) => {
    setCanvasState(prev => {
      const newElement: SVGElement = {
        id: generateId(),
        type: 'svg',
        position,
        size: { width: 120, height: 120 },
        rotation: 0,
        opacity: 100,
        visible: true,
        locked: false,
        zIndex: prev.elements.length + 1,
        svgContent,
        preserveAspectRatio: 'xMidYMid meet',
        fillColor: undefined,
        strokeColor: undefined,
        strokeWidth: 0,
        fillType: 'color',
        fillMode: 'cover'
      };

      return {
        ...prev,
        elements: [...prev.elements, newElement],
        selectedElementIds: [newElement.id]
      };
    });
  }, []);

  const updateElement = useCallback((elementId: string, updates: Partial<CanvasElement>) => {
    setCanvasState(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === elementId ? { ...el, ...updates } as CanvasElement : el
      )
    }));
  }, []);

  const rotateElement = useCallback((elementId: string, rotation: number) => {
    updateElement(elementId, { rotation });
  }, [updateElement]);

  const selectElement = useCallback((elementId: string, multiSelect = false) => {
    setCanvasState(prev => ({
      ...prev,
      selectedElementIds: multiSelect 
        ? prev.selectedElementIds.includes(elementId)
          ? prev.selectedElementIds.filter(id => id !== elementId)
          : [...prev.selectedElementIds, elementId]
        : [elementId]
    }));
  }, []);

  const selectElements = useCallback((elementIds: string[]) => {
    setCanvasState(prev => ({
      ...prev,
      selectedElementIds: elementIds
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      selectedElementIds: []
    }));
  }, []);

  const deleteElement = useCallback((elementId: string) => {
    setCanvasState(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== elementId),
      selectedElementIds: prev.selectedElementIds.filter(id => id !== elementId)
    }));
  }, []);

  const deleteSelected = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      elements: prev.elements.filter(el => !prev.selectedElementIds.includes(el.id)),
      selectedElementIds: []
    }));
  }, []);

  const moveElement = useCallback((elementId: string, newPosition: Position) => {
    updateElement(elementId, { position: newPosition });
  }, [updateElement]);

  const resizeElement = useCallback((elementId: string, newSize: { width: number; height: number }) => {
    updateElement(elementId, { size: newSize });
  }, [updateElement]);

  const updateCanvasSize = useCallback((newSize: { width: number; height: number }) => {
    setCanvasState(prev => ({
      ...prev,
      canvasSize: newSize
    }));
  }, []);

  const updateZoom = useCallback((zoom: number) => {
    setCanvasState(prev => ({
      ...prev,
      zoom
    }));
  }, []);

  const updatePanOffset = useCallback((panOffset: Position) => {
    setCanvasState(prev => ({
      ...prev,
      panOffset
    }));
  }, []);

  const updateCanvasBackground = useCallback((backgroundColor: string, backgroundType: 'solid' | 'image' = 'solid', backgroundImageUrl?: string, backgroundMode?: 'cover' | 'contain' | 'stretch' | 'center' | 'tile') => {
    setCanvasState(prev => ({
      ...prev,
      backgroundColor,
      backgroundType,
      backgroundImageUrl,
      backgroundMode
    }));
  }, []);

  const uploadCustomSVG = useCallback((file: File, position?: Position) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const svgContent = e.target?.result as string;
      const finalPosition = position || {
        x: (canvasState.canvasSize.width - 120) / 2,
        y: (canvasState.canvasSize.height - 120) / 2
      };
      addSVGElement(svgContent, finalPosition);
    };
    reader.readAsText(file);
  }, [canvasState.canvasSize, addSVGElement]);

  const getSelectedElement = useCallback(() => {
    if (canvasState.selectedElementIds.length === 1) {
      return canvasState.elements.find(el => el.id === canvasState.selectedElementIds[0]);
    }
    return undefined;
  }, [canvasState.elements, canvasState.selectedElementIds]);

  const getSelectedElements = useCallback(() => {
    return canvasState.elements.filter(el => canvasState.selectedElementIds.includes(el.id));
  }, [canvasState.elements, canvasState.selectedElementIds]);

  return {
    canvasState,
    addTextElement,
    addShapeElement,
    addImageElement,
    addSVGElement,
    updateElement,
    rotateElement,
    selectElement,
    selectElements,
    clearSelection,
    deleteElement,
    deleteSelected,
    moveElement,
    resizeElement,
    updateCanvasSize,
    updateZoom,
    updatePanOffset,
    updateCanvasBackground,
    uploadCustomSVG,
    getSelectedElement,
    getSelectedElements
  };
}