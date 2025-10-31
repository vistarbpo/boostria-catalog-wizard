import React, { useState, useRef, useCallback, memo, useEffect } from 'react';
import { CanvasElement as CanvasElementType, TextElement, ShapeElement, ImageElement, SVGElement, ButtonElement, Position } from '../../types/canvas';
import { RotateCw } from 'lucide-react';
import {
  getTextStyles,
  renderTextDecoration,
  getButtonStyles,
  getImageStyles,
  getShapeStyles,
  renderTriangleSVG,
} from './renderUtils';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
  processTemplatePlaceholders,
  formatDynamicValue,
  renderCurrencySymbol,
  renderTextWithCurrency,
  stripCurrencySymbols,
} from './currencyHelpers';

// Helper function to get border radius CSS value
const getBorderRadiusStyle = (element: ShapeElement | ImageElement) => {
  const shapeEl = element as ShapeElement;
  if (shapeEl.cornerRadii) {
    const { topLeft, topRight, bottomRight, bottomLeft } = shapeEl.cornerRadii;
    return `${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px`;
  }
  return shapeEl.cornerRadius || 0;
};

// Helper function to format dynamic text with modifiers and formatting
const formatDynamicText = (element: TextElement, parentGroup?: any, globalCurrencySymbol?: string, isSvgCurrency?: boolean): string => {
  // Handle rating widget text
  if (parentGroup?.widgetType === 'rating' && element.isDynamic && element.dynamicField === 'rating' && parentGroup.widgetData?.rating) {
    return parentGroup.widgetData.rating.toFixed(1);
  }
  
  // Handle template-based dynamic text with placeholders
  if ((element as any).isTemplate && element.isDynamic) {
    const result = processTemplatePlaceholders(element, globalCurrencySymbol || '$', isSvgCurrency || false);
    return result.content;
  }
  
  // Regular dynamic content (non-template)
  let content = element.isDynamic ? (element.dynamicContent || element.content) : element.content;
  
  // If not dynamic or no modifiers/formatting, return as is
  if (!element.isDynamic || (!element.modifiers?.length && !element.formatting)) {
    return content;
  }

  let text = content;

  // Apply modifiers
  if (element.modifiers) {
    // Clean the text of non-numeric characters before parsing
    let cleanedText = text.replace(/[^0-9.-]/g, '');
    let value = parseFloat(cleanedText) || 0;
    element.modifiers.forEach(mod => {
      switch (mod.type) {
        case 'uppercase':
          text = text.toUpperCase();
          break;
        case 'lowercase':
          text = text.toLowerCase();
          break;
        case 'titlecase':
          text = text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
          break;
        case 'numerical':
          text = text.replace(/[^0-9.]/g, '');
          value = parseFloat(text) || 0;
          break;
        case 'add':
          value = value + (mod.value || 0);
          text = value.toString();
          break;
        case 'subtract':
          value = value - (mod.value || 0);
          text = value.toString();
          break;
        case 'multiply':
          value = value * (mod.value || 1);
          text = value.toString();
          break;
        case 'divide':
          // Only divide if we have a valid, non-zero divisor
          if (typeof mod.value === 'number' && mod.value !== 0) {
            value = value / mod.value;
            text = value.toString();
          }
          break;
        case 'decimals':
          value = parseFloat(value.toFixed(mod.value || 2));
          text = value.toString();
          break;
      }
    });
  }

  // Apply formatting if text is numeric
  if (!isNaN(parseFloat(text)) && element.formatting) {
    const fmt = element.formatting;
    let value = parseFloat(text);
    let formatted = value.toFixed(fmt.decimals ?? 2);
    
    if (fmt.thousandsSeparator) {
      formatted = parseFloat(formatted).toLocaleString('en-US', {
        minimumFractionDigits: fmt.decimals ?? 2,
        maximumFractionDigits: fmt.decimals ?? 2,
      });
    }
    
    // Use global currency symbol for price fields
    const isPriceField = element.dynamicField === 'price' || element.dynamicField === 'sale_price' || element.dynamicField === 'compare_at_price';
    const symbolToUse = isPriceField && globalCurrencySymbol ? globalCurrencySymbol : (fmt.currencySymbol || fmt.prefix);
    
    if (symbolToUse) formatted = symbolToUse + formatted;
    if (!isPriceField && fmt.suffix) formatted = formatted + fmt.suffix;
    
    return formatted;
  }

  return text;
};


interface CanvasElementProps {
  element: CanvasElementType;
  isSelected: boolean;
  isMultiSelected: boolean;
  scale: number;
  selectedElements?: CanvasElementType[];
  onSelect: (elementId: string, multiSelect?: boolean) => void;
  onMove: (elementId: string, newPosition: Position) => void;
  onMoveMultiple?: (delta: Position) => void;
  onResize: (elementId: string, newSize: { width: number; height: number }) => void;
  onRotate?: (elementId: string, rotation: number) => void;
  onDoubleClick?: (elementId: string) => void;
}

const CanvasElementComponent = function CanvasElement({ 
  element, 
  isSelected,
  isMultiSelected,
  scale,
  selectedElements = [],
  onSelect, 
  onMove,
  onMoveMultiple,
  onResize,
  onRotate,
  onDoubleClick
}: CanvasElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  
  const { currencySymbol, currencySvgPath, isSvgSymbol } = useCurrency();
  
  const elementRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const isRotatingRef = useRef(false);
  const dragDataRef = useRef<any>({});
  const animationFrameRef = useRef<number>();
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout>();

  // Optimized DOM manipulation for 60fps performance
  const updateElementStyle = useCallback((pos: Position, size: { width: number; height: number }, rotation: number) => {
    if (elementRef.current) {
      // Use GPU-accelerated transforms
      elementRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${rotation}deg)`;
      elementRef.current.style.width = `${size.width}px`;
      elementRef.current.style.height = `${size.height}px`;
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (element.locked) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Handle double-click detection for text elements
    if (element.type === 'text' && !(e.target instanceof HTMLElement && (e.target.classList.contains('resize-handle') || e.target.classList.contains('rotation-handle')))) {
      clickCountRef.current++;
      
      if (clickCountRef.current === 1) {
        // First click - start timer
        clickTimerRef.current = setTimeout(() => {
          clickCountRef.current = 0;
        }, 300);
      } else if (clickCountRef.current === 2) {
        // Double click detected
        clickCountRef.current = 0;
        if (clickTimerRef.current) {
          clearTimeout(clickTimerRef.current);
        }
        onDoubleClick?.(element.id);
        return; // Don't start dragging
      }
    }
    
    // Multi-select with Ctrl/Cmd/Shift
    const isMultiSelectKey = e.ctrlKey || e.metaKey || e.shiftKey;
    
    // If clicking an already selected element without multi-select key, maintain selection
    // Otherwise, handle selection as normal
    if (!isSelected || isMultiSelectKey) {
      onSelect(element.id, isMultiSelectKey);
    }

    if (!(e.target instanceof HTMLElement)) return;

    const startX = e.clientX;
    const startY = e.clientY;

    if (e.target.classList.contains('resize-handle')) {
      // Resize mode
      setIsResizing(true);
      isResizingRef.current = true;
      
      dragDataRef.current = {
        startX,
        startY,
        handle: e.target.dataset.handle,
        startWidth: element.size.width,
        startHeight: element.size.height,
        startLeft: element.position.x,
        startTop: element.position.y
      };
    } else if (e.target.classList.contains('rotation-handle')) {
      // Rotation mode
      setIsRotating(true);
      isRotatingRef.current = true;
      
      const elementCenter = {
        x: element.position.x + element.size.width / 2,
        y: element.position.y + element.size.height / 2
      };
      
      const startAngle = Math.atan2(startY - elementCenter.y, startX - elementCenter.x) * (180 / Math.PI);
      
      dragDataRef.current = {
        startAngle,
        startRotation: element.rotation,
        centerX: elementCenter.x,
        centerY: elementCenter.y
      };
    } else {
      // Move mode - only for non-text or when not double-clicking
      setIsDragging(true);
      isDraggingRef.current = true;
      
      dragDataRef.current = {
        startX,
        startY,
        startLeft: element.position.x,
        startTop: element.position.y
      };
    }
  }, [element, isSelected, onSelect, onDoubleClick]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current && !isResizingRef.current && !isRotatingRef.current) return;
    
    e.preventDefault();
    
    // Use requestAnimationFrame for smooth 60fps updates
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      const currentX = e.clientX;
      const currentY = e.clientY;
      
      if (isDraggingRef.current) {
        // Smooth drag - allow negative positions for left/up movement
        const deltaX = (currentX - dragDataRef.current.startX) / scale;
        const deltaY = (currentY - dragDataRef.current.startY) / scale;
        
        const newX = dragDataRef.current.startLeft + deltaX;
        const newY = dragDataRef.current.startTop + deltaY;
        
        // Store delta for multi-element move
        dragDataRef.current.lastDeltaX = deltaX;
        dragDataRef.current.lastDeltaY = deltaY;
        
        // Update current element
        updateElementStyle(
          { x: newX, y: newY },
          element.size,
          element.rotation
        );
        
        // If multi-selected, update all other selected elements visually
        if (isMultiSelected && selectedElements.length > 1) {
          selectedElements.forEach(el => {
            if (el.id !== element.id) {
              const otherElement = document.querySelector(`[data-element-id="${el.id}"]`) as HTMLElement;
              if (otherElement) {
                const newOtherX = el.position.x + deltaX;
                const newOtherY = el.position.y + deltaY;
                otherElement.style.transform = `translate3d(${newOtherX}px, ${newOtherY}px, 0) rotate(${el.rotation}deg)`;
              }
            }
          });
        }
      } else if (isResizingRef.current) {
        // Smooth resize
        const deltaX = (currentX - dragDataRef.current.startX) / scale;
        const deltaY = (currentY - dragDataRef.current.startY) / scale;
        const handle = dragDataRef.current.handle;
        
        let newWidth = dragDataRef.current.startWidth;
        let newHeight = dragDataRef.current.startHeight;
        let newX = element.position.x;
        let newY = element.position.y;
        
        // Handle proportional resize with Shift (or always for groups)
        const isProportional = e.shiftKey || element.type === 'group';
        const aspectRatio = dragDataRef.current.startWidth / dragDataRef.current.startHeight;
        
        if (handle.includes('e')) {
          newWidth = Math.max(20, dragDataRef.current.startWidth + deltaX);
          if (isProportional) newHeight = newWidth / aspectRatio;
        }
        if (handle.includes('w')) {
          newWidth = Math.max(20, dragDataRef.current.startWidth - deltaX);
          if (isProportional) newHeight = newWidth / aspectRatio;
          newX = dragDataRef.current.startLeft + (dragDataRef.current.startWidth - newWidth);
        }
        if (handle.includes('s')) {
          newHeight = Math.max(20, dragDataRef.current.startHeight + deltaY);
          if (isProportional) newWidth = newHeight * aspectRatio;
        }
        if (handle.includes('n')) {
          newHeight = Math.max(20, dragDataRef.current.startHeight - deltaY);
          if (isProportional) newWidth = newHeight * aspectRatio;
          newY = dragDataRef.current.startTop + (dragDataRef.current.startHeight - newHeight);
        }
        
        updateElementStyle(
          { x: newX, y: newY },
          { width: newWidth, height: newHeight },
          element.rotation
        );
      } else if (isRotatingRef.current && onRotate) {
        // Smooth rotation
        const centerX = dragDataRef.current.centerX;
        const centerY = dragDataRef.current.centerY;
        
        const currentAngle = Math.atan2(currentY - centerY, currentX - centerX) * (180 / Math.PI);
        const deltaAngle = currentAngle - dragDataRef.current.startAngle;
        let newRotation = dragDataRef.current.startRotation + deltaAngle;
        
        // Snap to 15-degree increments when holding Shift
        if (e.shiftKey) {
          newRotation = Math.round(newRotation / 15) * 15;
        }
        
        // Normalize rotation
        newRotation = ((newRotation % 360) + 360) % 360;
        
        updateElementStyle(
          element.position,
          element.size,
          newRotation
        );
      }
    });
  }, [element, scale, updateElementStyle, onRotate, selectedElements, isMultiSelected]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Apply final state to React state - allow negative positions
    if (isDraggingRef.current) {
      const deltaX = (e.clientX - dragDataRef.current.startX) / scale;
      const deltaY = (e.clientY - dragDataRef.current.startY) / scale;
      
      const newX = dragDataRef.current.startLeft + deltaX;
      const newY = dragDataRef.current.startTop + deltaY;
      
      console.log('Mouse up - isMultiSelected:', isMultiSelected, 'deltaX:', deltaX, 'deltaY:', deltaY);
      
      // If multiple elements are selected and this is one of them, move all
      if (isMultiSelected && onMoveMultiple) {
        console.log('Calling onMoveMultiple with delta:', { x: deltaX, y: deltaY });
        onMoveMultiple({ x: deltaX, y: deltaY });
      } else {
        console.log('Calling onMove for single element');
        onMove(element.id, { x: newX, y: newY });
      }
    } else if (isResizingRef.current) {
      const deltaX = (e.clientX - dragDataRef.current.startX) / scale;
      const deltaY = (e.clientY - dragDataRef.current.startY) / scale;
      const handle = dragDataRef.current.handle;
      
      let newWidth = dragDataRef.current.startWidth;
      let newHeight = dragDataRef.current.startHeight;
      
      // Lock aspect ratio when aspectRatioLocked is true or when Shift is pressed
      const isProportional = e.shiftKey || element.aspectRatioLocked;
      const aspectRatio = dragDataRef.current.startWidth / dragDataRef.current.startHeight;
      
      if (handle.includes('e')) {
        newWidth = Math.max(20, dragDataRef.current.startWidth + deltaX);
        if (isProportional) newHeight = newWidth / aspectRatio;
      }
      if (handle.includes('w')) {
        newWidth = Math.max(20, dragDataRef.current.startWidth - deltaX);
        if (isProportional) newHeight = newWidth / aspectRatio;
      }
      if (handle.includes('s')) {
        newHeight = Math.max(20, dragDataRef.current.startHeight + deltaY);
        if (isProportional) newWidth = newHeight * aspectRatio;
      }
      if (handle.includes('n')) {
        newHeight = Math.max(20, dragDataRef.current.startHeight - deltaY);
        if (isProportional) newWidth = newHeight * aspectRatio;
      }
      
      onResize(element.id, { width: newWidth, height: newHeight });
    } else if (isRotatingRef.current && onRotate) {
      const centerX = dragDataRef.current.centerX;
      const centerY = dragDataRef.current.centerY;
      
      const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      const deltaAngle = currentAngle - dragDataRef.current.startAngle;
      let newRotation = dragDataRef.current.startRotation + deltaAngle;
      
      if (e.shiftKey) {
        newRotation = Math.round(newRotation / 15) * 15;
      }
      
      newRotation = ((newRotation % 360) + 360) % 360;
      onRotate(element.id, newRotation);
    }
    
    // Reset states
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    isDraggingRef.current = false;
    isResizingRef.current = false;
    isRotatingRef.current = false;
    dragDataRef.current = {};
  }, [element.id, element.aspectRatioLocked, isMultiSelected, scale, onMove, onMoveMultiple, onResize, onRotate]);

  useEffect(() => {
    if (isDragging || isResizing || isRotating) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp, { passive: false });
      document.body.style.userSelect = 'none';
      document.body.style.pointerEvents = 'none';
      if (elementRef.current) elementRef.current.style.pointerEvents = 'auto';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.pointerEvents = '';
      };
    }
  }, [isDragging, isResizing, isRotating, handleMouseMove, handleMouseUp]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, []);

  const renderElement = () => {
    const baseStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      opacity: element.opacity / 100,
      visibility: element.visible ? 'visible' : 'hidden',
    };

    switch (element.type) {
      case 'text': {
        const textElement = element as TextElement;
        const textContent = formatDynamicText(textElement, undefined, currencySymbol, isSvgSymbol);
        const textStyles = getTextStyles(textElement, baseStyle);
        
        // Check if this is a price field with SVG symbol
        const isPriceField = textElement.isDynamic && 
          (textElement.dynamicField === 'price' || 
           textElement.dynamicField === 'sale_price' || 
           textElement.dynamicField === 'compare_at_price');
        
        const currencyOptions = {
          currencySymbol,
          currencySvgPath,
          isSvgSymbol,
          textColor: textElement.color,
          fontSize: textElement.fontSize,
        };
        
        // Handle template text with inline currency placeholder
        if (textContent.includes('[CURRENCY_SVG]')) {
          const contentNode = renderTextWithCurrency(textContent, currencyOptions);
          return (
            <div
              style={{
                ...textStyles,
                cursor: element.locked ? 'not-allowed' : 'text',
                visibility: element.visible ? 'visible' : 'hidden',
                display: 'inline-flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {renderTextDecoration(textElement, contentNode as any)}
            </div>
          );
        }
        
        // Handle price fields with prefix currency symbol
        const showSvgSymbol = isPriceField && isSvgSymbol && currencySvgPath;
        const finalText = showSvgSymbol ? stripCurrencySymbols(textContent) : textContent;
        
        return (
          <div
            style={{
              ...textStyles,
              cursor: element.locked ? 'not-allowed' : 'text',
              visibility: element.visible ? 'visible' : 'hidden',
              display: 'inline-flex',
              alignItems: 'center',
              gap: showSvgSymbol ? '4px' : '0',
              whiteSpace: 'nowrap',
            }}
          >
            {showSvgSymbol && renderCurrencySymbol(currencyOptions)}
            {renderTextDecoration(textElement, finalText)}
          </div>
        );
      }

      case 'button': {
        const buttonElement = element as ButtonElement;
        const buttonStyles = getButtonStyles(buttonElement, baseStyle);
        
        // Create a hidden span to measure text width for auto-layout
        const textMeasureRef = useRef<HTMLSpanElement>(null);
        
        useEffect(() => {
          if (textMeasureRef.current && onResize) {
            const textWidth = textMeasureRef.current.offsetWidth;
            const textHeight = textMeasureRef.current.offsetHeight;
            const horizontalPadding = buttonElement.padding.left + buttonElement.padding.right;
            const verticalPadding = buttonElement.padding.top + buttonElement.padding.bottom;
            const borderWidth = (buttonElement.borderWidth || 0) * 2;
            const newWidth = textWidth + horizontalPadding + borderWidth + 4;
            const newHeight = textHeight + verticalPadding + borderWidth + 4;
            
            // Only update if size changed significantly (avoid infinite loops)
            if (Math.abs(newWidth - element.size.width) > 2 || Math.abs(newHeight - element.size.height) > 2) {
              onResize(element.id, { width: newWidth, height: newHeight });
            }
          }
        }, [buttonElement.content, buttonElement.fontSize, buttonElement.fontFamily, buttonElement.fontWeight, buttonElement.padding, buttonElement.borderWidth]);
        
        return (
          <>
            {/* Hidden span for measuring text width - only show in editor, not during export */}
            <span
              ref={textMeasureRef}
              data-measurement-element="true"
              style={{
                position: 'absolute',
                visibility: 'hidden',
                whiteSpace: 'nowrap',
                fontSize: `${buttonElement.fontSize}px`,
                fontFamily: buttonElement.fontFamily,
                fontWeight: buttonElement.fontWeight,
                pointerEvents: 'none',
                left: '-9999px',
              }}
            >
              {buttonElement.content}
            </span>
            
            <div
              data-button-element="true"
              style={{
                ...buttonStyles.container,
                cursor: element.locked ? 'not-allowed' : 'pointer',
                width: '100%',
                height: '100%',
                visibility: element.visible ? 'visible' : 'hidden',
              }}
            >
              <span style={buttonStyles.text}>
                {buttonElement.content}
              </span>
            </div>
          </>
        );
      }

      case 'shape': {
        const shapeElement = element as ShapeElement;
        const shapeStyles = getShapeStyles(shapeElement, baseStyle);

        switch (shapeStyles.shapeType) {
          case 'rectangle':
            return (
              <div
                style={{
                  ...shapeStyles.base,
                  borderRadius: shapeStyles.borderRadius,
                }}
              />
            );
          case 'circle':
            return (
              <div
                style={{
                  ...shapeStyles.base,
                  borderRadius: '50%',
                }}
              />
            );
          case 'triangle':
            return (
              <div style={baseStyle}>
                {renderTriangleSVG(shapeElement)}
              </div>
            );
          case 'star':
            return (
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 100 100" 
                style={baseStyle}
              >
                <defs>
                  {shapeElement.fillType === 'image' && shapeElement.fillImageUrl && (
                    <pattern id={`pattern-${shapeElement.id}`} patternUnits="objectBoundingBox" width="1" height="1">
                      <image 
                        href={shapeElement.fillImageUrl} 
                        x="0" y="0" 
                        width="100" height="100" 
                        preserveAspectRatio={
                          shapeElement.fillMode === 'cover' ? 'xMidYMid slice' :
                          shapeElement.fillMode === 'contain' ? 'xMidYMid meet' :
                          'none'
                        }
                      />
                    </pattern>
                  )}
                </defs>
                <polygon 
                  points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" 
                  fill={shapeElement.fillType === 'image' ? `url(#pattern-${shapeElement.id})` : shapeElement.fillColor}
                  stroke={shapeElement.strokeColor}
                  strokeWidth={shapeElement.strokeWidth}
                />
              </svg>
            );
          case 'heart':
            return (
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 100 100" 
                style={baseStyle}
              >
                <defs>
                  {shapeElement.fillType === 'image' && shapeElement.fillImageUrl && (
                    <pattern id={`pattern-${shapeElement.id}`} patternUnits="objectBoundingBox" width="1" height="1">
                      <image 
                        href={shapeElement.fillImageUrl} 
                        x="0" y="0" 
                        width="100" height="100" 
                        preserveAspectRatio={
                          shapeElement.fillMode === 'cover' ? 'xMidYMid slice' :
                          shapeElement.fillMode === 'contain' ? 'xMidYMid meet' :
                          'none'
                        }
                      />
                    </pattern>
                  )}
                </defs>
                <path 
                  d="M50,25 C50,25 25,0 0,25 C0,50 50,100 50,100 C50,100 100,50 100,25 C75,0 50,25 50,25 Z" 
                  fill={shapeElement.fillType === 'image' ? `url(#pattern-${shapeElement.id})` : shapeElement.fillColor}
                  stroke={shapeElement.strokeColor}
                  strokeWidth={shapeElement.strokeWidth}
                />
              </svg>
            );
          case 'plus':
            return (
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 100 100" 
                style={baseStyle}
              >
                <defs>
                  {shapeElement.fillType === 'image' && shapeElement.fillImageUrl && (
                    <pattern id={`pattern-${shapeElement.id}`} patternUnits="objectBoundingBox" width="1" height="1">
                      <image 
                        href={shapeElement.fillImageUrl} 
                        x="0" y="0" 
                        width="100" height="100" 
                        preserveAspectRatio={
                          shapeElement.fillMode === 'cover' ? 'xMidYMid slice' :
                          shapeElement.fillMode === 'contain' ? 'xMidYMid meet' :
                          'none'
                        }
                      />
                    </pattern>
                  )}
                </defs>
                <polygon 
                  points="40,0 60,0 60,40 100,40 100,60 60,60 60,100 40,100 40,60 0,60 0,40 40,40" 
                  fill={shapeElement.fillType === 'image' ? `url(#pattern-${shapeElement.id})` : shapeElement.fillColor}
                  stroke={shapeElement.strokeColor}
                  strokeWidth={shapeElement.strokeWidth}
                />
              </svg>
            );
          case 'diamond':
            return (
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 100 100" 
                style={baseStyle}
              >
                <defs>
                  {shapeElement.fillType === 'image' && shapeElement.fillImageUrl && (
                    <pattern id={`pattern-${shapeElement.id}`} patternUnits="objectBoundingBox" width="1" height="1">
                      <image 
                        href={shapeElement.fillImageUrl} 
                        x="0" y="0" 
                        width="100" height="100" 
                        preserveAspectRatio={
                          shapeElement.fillMode === 'cover' ? 'xMidYMid slice' :
                          shapeElement.fillMode === 'contain' ? 'xMidYMid meet' :
                          'none'
                        }
                      />
                    </pattern>
                  )}
                </defs>
                <polygon 
                  points="50,0 100,50 50,100 0,50" 
                  fill={shapeElement.fillType === 'image' ? `url(#pattern-${shapeElement.id})` : shapeElement.fillColor}
                  stroke={shapeElement.strokeColor}
                  strokeWidth={shapeElement.strokeWidth}
                />
              </svg>
            );
          case 'arrow':
            return (
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 100 100" 
                style={baseStyle}
              >
                <defs>
                  {shapeElement.fillType === 'image' && shapeElement.fillImageUrl && (
                    <pattern id={`pattern-${shapeElement.id}`} patternUnits="objectBoundingBox" width="1" height="1">
                      <image 
                        href={shapeElement.fillImageUrl} 
                        x="0" y="0" 
                        width="100" height="100" 
                        preserveAspectRatio={
                          shapeElement.fillMode === 'cover' ? 'xMidYMid slice' :
                          shapeElement.fillMode === 'contain' ? 'xMidYMid meet' :
                          'none'
                        }
                      />
                    </pattern>
                  )}
                </defs>
                <polygon 
                  points="0,20 60,20 60,0 100,50 60,100 60,80 0,80" 
                  fill={shapeElement.fillType === 'image' ? `url(#pattern-${shapeElement.id})` : shapeElement.fillColor}
                  stroke={shapeElement.strokeColor}
                  strokeWidth={shapeElement.strokeWidth}
                />
              </svg>
            );
          case 'line':
            return (
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 100 100" 
                preserveAspectRatio="none"
                style={baseStyle}
              >
                <line 
                  x1="0" 
                  y1="50" 
                  x2="100" 
                  y2="50" 
                  stroke={shapeElement.strokeColor || shapeElement.fillColor}
                  strokeWidth={shapeElement.strokeWidth || 2}
                />
              </svg>
            );
        }
      }

      case 'image': {
        const imageElement = element as ImageElement;
        const imageStyles = getImageStyles(imageElement, baseStyle);
        
        return (
          <div style={imageStyles.container} />
        );
      }

      case 'svg': {
        const svgElement = element as SVGElement;
        return (
          <div
            style={baseStyle}
            dangerouslySetInnerHTML={{ __html: svgElement.svgContent }}
          />
        );
      }

      case 'group': {
        const groupElement = element as any;
        return (
          <div
            style={{
              ...baseStyle,
              position: 'relative',
              border: isSelected ? '1px dashed rgba(59, 130, 246, 0.5)' : 'none',
              pointerEvents: element.locked ? 'none' : 'auto',
            }}
          >
            {groupElement.children?.map((child: CanvasElementType) => (
              <div
                key={child.id}
                style={{
                  position: 'absolute',
                  left: child.position.x,
                  top: child.position.y,
                  width: child.size.width,
                  height: child.size.height,
                  transform: `rotate(${child.rotation}deg)`,
                  transformOrigin: 'top left',
                  opacity: child.opacity / 100,
                  visibility: child.visible ? 'visible' : 'hidden',
                  pointerEvents: 'none',
                }}
              >
                {renderChildElement(child, groupElement)}
              </div>
            ))}
          </div>
        );
      }

      default:
        return <div style={baseStyle}>Unknown element</div>;
    }
  };

  // Helper function to render individual child elements within a group
  const renderChildElement = (childElement: CanvasElementType, parentGroup?: any) => {
    const childBaseStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    switch (childElement.type) {
      case 'text':
        const textEl = childElement as TextElement;
        const textContent = formatDynamicText(textEl, parentGroup, currencySymbol, isSvgSymbol);
        
        // Check if this is a price field with SVG symbol
        const isPriceField = textEl.isDynamic && 
          (textEl.dynamicField === 'price' || 
           textEl.dynamicField === 'sale_price' || 
           textEl.dynamicField === 'compare_at_price');
        
        const currencyOptions = {
          currencySymbol,
          currencySvgPath,
          isSvgSymbol,
          textColor: textEl.color,
          fontSize: textEl.fontSize,
        };
        
        // Handle template text with inline currency placeholder
        if (textContent.includes('[CURRENCY_SVG]')) {
          const contentNode = renderTextWithCurrency(textContent, currencyOptions);
          return (
            <div
              style={{
                ...childBaseStyle,
                color: textEl.color,
                fontSize: `${textEl.fontSize}px`,
                fontWeight: textEl.fontWeight,
                fontFamily: textEl.fontFamily,
                textAlign: textEl.textAlign,
                direction: textEl.direction || 'ltr',
                letterSpacing: `${textEl.letterSpacing}px`,
                lineHeight: textEl.lineHeight,
                whiteSpace: 'nowrap',
                wordBreak: 'normal',
                overflow: 'hidden',
                padding: `${textEl.padding.top}px ${textEl.padding.right}px ${textEl.padding.bottom}px ${textEl.padding.left}px`,
                justifyContent: textEl.textAlign === 'left' ? 'flex-start' : textEl.textAlign === 'right' ? 'flex-end' : 'center',
                alignItems: 'flex-start',
                display: 'inline-flex',
              }}
            >
              {contentNode}
            </div>
          );
        }
        
        // Handle price fields with prefix currency symbol
        const showSvgSymbol = isPriceField && isSvgSymbol && currencySvgPath;
        const displayText = showSvgSymbol ? stripCurrencySymbols(textContent) : textContent;
        
        return (
          <div
            style={{
              ...childBaseStyle,
              color: textEl.color,
              fontSize: `${textEl.fontSize}px`,
              fontWeight: textEl.fontWeight,
              fontFamily: textEl.fontFamily,
              textAlign: textEl.textAlign,
              direction: textEl.direction || 'ltr',
              letterSpacing: `${textEl.letterSpacing}px`,
              lineHeight: textEl.lineHeight,
              whiteSpace: showSvgSymbol ? 'nowrap' : (textEl.textWrapping ? 'pre-wrap' : 'nowrap'),
              wordBreak: textEl.textWrapping ? 'break-word' : 'normal',
              overflow: 'hidden',
              padding: `${textEl.padding.top}px ${textEl.padding.right}px ${textEl.padding.bottom}px ${textEl.padding.left}px`,
              justifyContent: textEl.textAlign === 'left' ? 'flex-start' : textEl.textAlign === 'right' ? 'flex-end' : 'center',
              alignItems: 'flex-start',
              gap: showSvgSymbol ? '4px' : '0',
              display: showSvgSymbol ? 'inline-flex' : undefined,
            }}
          >
            {showSvgSymbol && renderCurrencySymbol(currencyOptions)}
            {displayText}
          </div>
        );
      case 'shape':
        const shapeEl = childElement as ShapeElement;
        const shapeStyle: React.CSSProperties = {
          ...childBaseStyle,
          border: shapeEl.strokeWidth > 0 ? `${shapeEl.strokeWidth}px solid ${shapeEl.strokeColor}` : undefined,
        };

        if (shapeEl.fillType === 'image' && shapeEl.fillImageUrl) {
          shapeStyle.backgroundImage = `url(${shapeEl.fillImageUrl})`;
          shapeStyle.backgroundSize = 
            shapeEl.fillMode === 'cover' ? 'cover' :
            shapeEl.fillMode === 'contain' ? 'contain' :
            shapeEl.fillMode === 'stretch' ? '100% 100%' :
            shapeEl.fillMode === 'tile' ? 'auto' : 'cover';
          shapeStyle.backgroundRepeat = shapeEl.fillMode === 'tile' ? 'repeat' : 'no-repeat';
          shapeStyle.backgroundPosition = 'center';
        } else {
          shapeStyle.backgroundColor = shapeEl.fillColor;
        }

        // Render based on shape type
        if (shapeEl.shapeType === 'rectangle') {
          return (
            <div
              style={{
                ...shapeStyle,
                borderRadius: getBorderRadiusStyle(shapeEl),
              }}
            />
          );
        } else if (shapeEl.shapeType === 'circle') {
          return (
            <div
              style={{
                ...shapeStyle,
                borderRadius: '50%',
              }}
            />
          );
        } else if (shapeEl.shapeType === 'triangle') {
          return (
            <svg width="100%" height="100%" viewBox="0 0 100 100" style={childBaseStyle}>
              <polygon 
                points="50,10 90,90 10,90" 
                fill={shapeEl.fillType === 'image' ? `url(#pattern-${shapeEl.id})` : shapeEl.fillColor}
                stroke={shapeEl.strokeColor}
                strokeWidth={shapeEl.strokeWidth}
              />
            </svg>
          );
        } else if (shapeEl.shapeType === 'star') {
          // Check if this star is part of a rating widget
          const widgetRating = parentGroup?.widgetData?.rating;
          const isRatingWidget = parentGroup?.widgetType === 'rating' && widgetRating !== undefined;
          
          let starFill = shapeEl.fillType === 'image' ? `url(#pattern-${shapeEl.id})` : shapeEl.fillColor;
          
          if (isRatingWidget && parentGroup?.children) {
            // Find the index of this star in the group
            const starIndex = parentGroup.children.findIndex((c: any) => c.id === shapeEl.id);
            
            if (starIndex !== -1) {
              const filledStars = Math.floor(widgetRating);
              const fractionalPart = widgetRating % 1;
              const filledColor = parentGroup.widgetData.starFilledColor || '#E4A709';
              const unfilledColor = parentGroup.widgetData.starUnfilledColor || '#D1D5DB';
              
              if (starIndex < filledStars) {
                // Fully filled star
                starFill = filledColor;
              } else if (starIndex === filledStars && fractionalPart > 0) {
                // Partially filled star - use gradient
                const fillPercentage = fractionalPart * 100;
                return (
                  <svg width="100%" height="100%" viewBox="0 0 100 100" style={childBaseStyle}>
                    <defs>
                      <linearGradient id={`half-fill-preview-${shapeEl.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset={`${fillPercentage}%`} stopColor={filledColor} />
                        <stop offset={`${fillPercentage}%`} stopColor={unfilledColor} />
                      </linearGradient>
                    </defs>
                    <polygon 
                      points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" 
                      fill={`url(#half-fill-preview-${shapeEl.id})`}
                      stroke={shapeEl.strokeColor}
                      strokeWidth={shapeEl.strokeWidth}
                    />
                  </svg>
                );
              } else {
                // Unfilled star
                starFill = unfilledColor;
              }
            }
          }
          
          return (
            <svg width="100%" height="100%" viewBox="0 0 100 100" style={childBaseStyle}>
              <polygon 
                points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" 
                fill={starFill}
                stroke={shapeEl.strokeColor}
                strokeWidth={shapeEl.strokeWidth}
              />
            </svg>
          );
        } else if (shapeEl.shapeType === 'heart') {
          return (
            <svg width="100%" height="100%" viewBox="0 0 100 100" style={childBaseStyle}>
              <path 
                d="M50,90 C50,90 10,65 10,40 C10,25 20,15 30,15 C40,15 50,25 50,25 C50,25 60,15 70,15 C80,15 90,25 90,40 C90,65 50,90 50,90 Z"
                fill={shapeEl.fillType === 'image' ? `url(#pattern-${shapeEl.id})` : shapeEl.fillColor}
                stroke={shapeEl.strokeColor}
                strokeWidth={shapeEl.strokeWidth}
              />
            </svg>
          );
        } else if (shapeEl.shapeType === 'diamond') {
          return (
            <svg width="100%" height="100%" viewBox="0 0 100 100" style={childBaseStyle}>
              <polygon 
                points="50,10 90,50 50,90 10,50" 
                fill={shapeEl.fillType === 'image' ? `url(#pattern-${shapeEl.id})` : shapeEl.fillColor}
                stroke={shapeEl.strokeColor}
                strokeWidth={shapeEl.strokeWidth}
              />
            </svg>
          );
        } else if (shapeEl.shapeType === 'plus') {
          return (
            <svg width="100%" height="100%" viewBox="0 0 100 100" style={childBaseStyle}>
              <path 
                d="M40,0 L60,0 L60,40 L100,40 L100,60 L60,60 L60,100 L40,100 L40,60 L0,60 L0,40 L40,40 Z"
                fill={shapeEl.fillType === 'image' ? `url(#pattern-${shapeEl.id})` : shapeEl.fillColor}
                stroke={shapeEl.strokeColor}
                strokeWidth={shapeEl.strokeWidth}
              />
            </svg>
          );
        } else if (shapeEl.shapeType === 'arrow') {
          return (
            <svg width="100%" height="100%" viewBox="0 0 100 100" style={childBaseStyle}>
              <path 
                d="M10,40 L60,40 L60,20 L90,50 L60,80 L60,60 L10,60 Z"
                fill={shapeEl.fillType === 'image' ? `url(#pattern-${shapeEl.id})` : shapeEl.fillColor}
                stroke={shapeEl.strokeColor}
                strokeWidth={shapeEl.strokeWidth}
              />
            </svg>
          );
        } else {
          // Fallback to rectangle
          return (
            <div
              style={{
                ...shapeStyle,
                borderRadius: getBorderRadiusStyle(shapeEl),
              }}
            />
          );
        }
      case 'image':
        const imgEl = childElement as ImageElement;
        return (
          <div
            style={{
              ...childBaseStyle,
              overflow: 'hidden',
              borderRadius: getBorderRadiusStyle(imgEl as any),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={imgEl.fillType === 'dynamic' && imgEl.fillImageUrl ? imgEl.fillImageUrl : imgEl.src}
              alt={imgEl.alt || 'Canvas image'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            />
          </div>
        );
      case 'svg':
        const svgEl = childElement as SVGElement;
        return (
          <div
            style={childBaseStyle}
            dangerouslySetInnerHTML={{ __html: svgEl.svgContent }}
          />
        );
      default:
        return <div style={childBaseStyle}>Unknown element</div>;
    }
  };

  const resizeHandles = [
    { position: 'nw', cursor: 'nw-resize', style: { top: -8, left: -8 } },
    { position: 'n', cursor: 'n-resize', style: { top: -8, left: 'calc(50% - 8px)' } },
    { position: 'ne', cursor: 'ne-resize', style: { top: -8, right: -8 } },
    { position: 'e', cursor: 'e-resize', style: { top: 'calc(50% - 8px)', right: -8 } },
    { position: 'se', cursor: 'se-resize', style: { bottom: -8, right: -8 } },
    { position: 's', cursor: 's-resize', style: { bottom: -8, left: 'calc(50% - 8px)' } },
    { position: 'sw', cursor: 'sw-resize', style: { bottom: -8, left: -8 } },
    { position: 'w', cursor: 'w-resize', style: { top: 'calc(50% - 8px)', left: -8 } },
  ];

  return (
    <div
      ref={elementRef}
      data-element-id={element.id}
      className={`absolute select-none will-change-transform transition-shadow duration-200 ${
        isSelected 
          ? 'ring-2 ring-blue-500 ring-opacity-60 shadow-lg z-10' 
          : 'hover:ring-1 hover:ring-blue-300 hover:ring-opacity-40 hover:shadow-md'
      } ${element.locked ? 'cursor-not-allowed opacity-50' : 'cursor-move'}`}
      style={{
        left: 0,
        top: 0,
        width: element.size.width,
        height: element.size.height,
        zIndex: element.zIndex,
        transform: `translate3d(${element.position.x}px, ${element.position.y}px, 0) rotate(${element.rotation}deg)`,
        transformOrigin: 'center center',
      }}
      onMouseDown={handleMouseDown}
    >
      {renderElement()}
      
      {isSelected && !element.locked && (
        <div className="absolute inset-0" style={{ transform: `rotate(-${element.rotation}deg)` }}>
          {/* Resize Handles */}
          {resizeHandles.map((handle) => (
            <div
              key={handle.position}
              className="resize-handle absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-sm shadow-lg hover:bg-blue-50 hover:scale-110 transition-all duration-150 will-change-transform"
              data-handle={handle.position}
              style={{
                ...handle.style,
                cursor: handle.cursor,
              }}
            />
          ))}
          
          {/* Rotation Handle */}
          <div
            className="rotation-handle absolute w-8 h-8 bg-white border-2 border-blue-500 rounded-full shadow-lg hover:bg-blue-50 hover:scale-110 transition-all duration-150 flex items-center justify-center cursor-grab active:cursor-grabbing will-change-transform"
            style={{
              top: -48,
              left: 'calc(50% - 16px)',
            }}
          >
            <RotateCw className="w-4 h-4 text-blue-600" />
          </div>
          
          {/* Rotation Line */}
          <div
            className="absolute w-px h-12 bg-blue-400 pointer-events-none"
            style={{
              top: -40,
              left: 'calc(50% - 0.5px)',
            }}
          />
        </div>
      )}
    </div>
  );
};

export const CanvasElement = memo(CanvasElementComponent);