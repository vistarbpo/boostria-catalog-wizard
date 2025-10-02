import { useState, useCallback, useRef } from 'react';
import { CanvasElement, CanvasState, TextElement, ShapeElement, ImageElement, SVGElement, Position } from '../types/canvas';

const generateId = () => Math.random().toString(36).substr(2, 9);

export function useCanvasStore() {
  const initialState: CanvasState = {
    elements: [],
    selectedElementIds: [],
    canvasSize: { width: 1000, height: 1500 },
    zoom: 100,
    panOffset: { x: 0, y: 0 },
    backgroundColor: '#ffffff',
    backgroundType: 'solid'
  };

  const [canvasState, setCanvasState] = useState<CanvasState>(initialState);
  
  // Use refs for history management to avoid closure issues
  const historyRef = useRef<CanvasState[]>([initialState]);
  const historyIndexRef = useRef(0);
  const [, forceUpdate] = useState({});

  // Wrapper for setState that saves to history
  const setCanvasStateWithHistory = useCallback((updater: (prev: CanvasState) => CanvasState) => {
    setCanvasState(prev => {
      const newState = updater(prev);
      
      // Trim history after current index (discard redo history)
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      
      // Add new state
      historyRef.current.push(newState);
      
      // Limit history to 50 states
      if (historyRef.current.length > 50) {
        historyRef.current.shift();
      } else {
        historyIndexRef.current++;
      }
      
      forceUpdate({});
      return newState;
    });
  }, []);

  const addTextElement = useCallback((position: Position, initialContent?: string, overrides?: Partial<TextElement>) => {
    setCanvasStateWithHistory(prev => {
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
        padding: { top: 8, right: 8, bottom: 8, left: 8 },
        ...overrides
      };

      return {
        ...prev,
        elements: [...prev.elements, newElement],
        selectedElementIds: [newElement.id]
      };
    });
  }, [setCanvasStateWithHistory]);

  const addShapeElement = useCallback((shapeType: ShapeElement['shapeType'], position: Position) => {
    setCanvasStateWithHistory(prev => {
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
      
      setCanvasStateWithHistory(prev => {
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
      setCanvasStateWithHistory(prev => {
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
  }, [setCanvasStateWithHistory]);

  const addSVGElement = useCallback((svgContent: string, position: Position) => {
    setCanvasStateWithHistory(prev => {
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
  }, [setCanvasStateWithHistory]);

  const updateElement = useCallback((elementId: string, updates: Partial<CanvasElement>) => {
    setCanvasStateWithHistory(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === elementId ? { ...el, ...updates } as CanvasElement : el
      )
    }));
  }, [setCanvasStateWithHistory]);

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
    setCanvasStateWithHistory(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== elementId),
      selectedElementIds: prev.selectedElementIds.filter(id => id !== elementId)
    }));
  }, [setCanvasStateWithHistory]);

  const deleteSelected = useCallback(() => {
    setCanvasStateWithHistory(prev => ({
      ...prev,
      elements: prev.elements.filter(el => !prev.selectedElementIds.includes(el.id)),
      selectedElementIds: []
    }));
  }, [setCanvasStateWithHistory]);

  const moveElement = useCallback((elementId: string, newPosition: Position) => {
    updateElement(elementId, { position: newPosition });
  }, [updateElement]);

  const resizeElement = useCallback((elementId: string, newSize: { width: number; height: number }) => {
    updateElement(elementId, { size: newSize });
  }, [updateElement]);

  const updateCanvasSize = useCallback((newSize: { width: number; height: number }) => {
    setCanvasStateWithHistory(prev => ({
      ...prev,
      canvasSize: newSize
    }));
  }, [setCanvasStateWithHistory]);

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
    setCanvasStateWithHistory(prev => ({
      ...prev,
      backgroundColor,
      backgroundType,
      backgroundImageUrl,
      backgroundMode
    }));
  }, [setCanvasStateWithHistory]);

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

  const groupSelectedElements = useCallback(() => {
    const selectedElements = canvasState.elements.filter(el => 
      canvasState.selectedElementIds.includes(el.id)
    );

    if (selectedElements.length < 2) return;

    // Calculate bounding box for the group
    const bounds = selectedElements.reduce((acc, el) => {
      return {
        minX: Math.min(acc.minX, el.position.x),
        minY: Math.min(acc.minY, el.position.y),
        maxX: Math.max(acc.maxX, el.position.x + el.size.width),
        maxY: Math.max(acc.maxY, el.position.y + el.size.height)
      };
    }, {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity
    });

    const groupPosition = { x: bounds.minX, y: bounds.minY };
    const groupSize = {
      width: bounds.maxX - bounds.minX,
      height: bounds.maxY - bounds.minY
    };

    // Adjust children positions relative to group
    const children = selectedElements.map(el => ({
      ...el,
      position: {
        x: el.position.x - groupPosition.x,
        y: el.position.y - groupPosition.y
      }
    }));

    const groupElement: any = {
      id: generateId(),
      type: 'group',
      position: groupPosition,
      size: groupSize,
      rotation: 0,
      opacity: 100,
      visible: true,
      locked: false,
      zIndex: Math.max(...selectedElements.map(el => el.zIndex)),
      name: 'Group',
      children
    };

    setCanvasStateWithHistory(prev => ({
      ...prev,
      elements: [
        ...prev.elements.filter(el => !prev.selectedElementIds.includes(el.id)),
        groupElement
      ],
      selectedElementIds: [groupElement.id]
    }));
  }, [canvasState.elements, canvasState.selectedElementIds]);

  const ungroupSelectedElement = useCallback(() => {
    const selectedElement = canvasState.elements.find(el => 
      el.id === canvasState.selectedElementIds[0]
    );

    if (!selectedElement || selectedElement.type !== 'group') return;

    const groupEl = selectedElement as any;
    const ungroupedChildren = groupEl.children.map((child: any) => ({
      ...child,
      position: {
        x: child.position.x + groupEl.position.x,
        y: child.position.y + groupEl.position.y
      },
      zIndex: groupEl.zIndex + 1
    }));

    setCanvasStateWithHistory(prev => ({
      ...prev,
      elements: [
        ...prev.elements.filter(el => el.id !== groupEl.id),
        ...ungroupedChildren
      ],
      selectedElementIds: ungroupedChildren.map((c: any) => c.id)
    }));
  }, [canvasState.elements, canvasState.selectedElementIds]);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      setCanvasState(historyRef.current[historyIndexRef.current]);
      forceUpdate({});
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      setCanvasState(historyRef.current[historyIndexRef.current]);
      forceUpdate({});
    }
  }, []);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

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
    getSelectedElements,
    groupSelectedElements,
    ungroupSelectedElement,
    undo,
    redo,
    canUndo,
    canRedo
  };
}