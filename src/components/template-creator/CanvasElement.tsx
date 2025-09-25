import React, { useState, useRef, useCallback, memo } from 'react';
import { CanvasElement as CanvasElementType, TextElement, ShapeElement, ImageElement, SVGElement, Position } from '../../types/canvas';

interface CanvasElementProps {
  element: CanvasElementType;
  isSelected: boolean;
  scale: number;
  onSelect: (elementId: string, multiSelect?: boolean) => void;
  onMove: (elementId: string, newPosition: Position) => void;
  onResize: (elementId: string, newSize: { width: number; height: number }) => void;
  onDoubleClick?: (elementId: string) => void;
}

const CanvasElementComponent = function CanvasElement({ 
  element, 
  isSelected, 
  scale,
  onSelect, 
  onMove, 
  onResize,
  onDoubleClick
}: CanvasElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: 0, elementY: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (element.locked) return;
    
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const isMultiSelect = e.ctrlKey || e.metaKey;
    onSelect(element.id, isMultiSelect);

    if (e.target instanceof HTMLElement && e.target.classList.contains('resize-handle')) {
      setIsResizing(true);
      setResizeHandle(e.target.dataset.handle || '');
    } else {
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        elementX: element.position.x,
        elementY: element.position.y
      });
    }
  }, [element.id, element.locked, element.position, onSelect]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (element.locked) return;

    if (isDragging) {
      const deltaX = (e.clientX - dragStart.x) / scale;
      const deltaY = (e.clientY - dragStart.y) / scale;
      
      onMove(element.id, {
        x: Math.max(0, dragStart.elementX + deltaX),
        y: Math.max(0, dragStart.elementY + deltaY)
      });
    } else if (isResizing) {
      const deltaX = (e.clientX - dragStart.x) / scale;
      const deltaY = (e.clientY - dragStart.y) / scale;
      
      let newWidth = element.size.width;
      let newHeight = element.size.height;
      
      if (resizeHandle.includes('e')) newWidth = Math.max(20, element.size.width + deltaX);
      if (resizeHandle.includes('w')) newWidth = Math.max(20, element.size.width - deltaX);
      if (resizeHandle.includes('s')) newHeight = Math.max(20, element.size.height + deltaY);
      if (resizeHandle.includes('n')) newHeight = Math.max(20, element.size.height - deltaY);
      
      onResize(element.id, { width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, resizeHandle, dragStart, element.id, element.size, scale, onMove, onResize, element.locked]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  }, []);

  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (element.locked) return;
    e.stopPropagation();
    onDoubleClick?.(element.id);
  }, [element.id, element.locked, onDoubleClick]);

  const renderElement = () => {
    const baseStyle: React.CSSProperties = {
      width: element.size.width,
      height: element.size.height,
      transform: `rotate(${element.rotation}deg)`,
      opacity: element.opacity / 100,
      visibility: element.visible ? 'visible' : 'hidden',
    };

    switch (element.type) {
      case 'text': {
        const textElement = element as TextElement;
        return (
          <div
            style={{
              ...baseStyle,
              color: textElement.color,
              fontSize: textElement.fontSize,
              fontFamily: textElement.fontFamily,
              fontWeight: textElement.fontWeight,
              textAlign: textElement.textAlign,
              letterSpacing: textElement.letterSpacing,
              lineHeight: textElement.lineHeight,
              backgroundColor: textElement.backgroundColor,
              border: textElement.strokeWidth > 0 ? `${textElement.strokeWidth}px solid ${textElement.strokeColor}` : undefined,
              padding: `${textElement.padding.top}px ${textElement.padding.right}px ${textElement.padding.bottom}px ${textElement.padding.left}px`,
              whiteSpace: textElement.textWrapping ? 'normal' : 'nowrap',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: textElement.textAlign === 'center' ? 'center' : textElement.textAlign === 'right' ? 'flex-end' : 'flex-start'
            }}
            onDoubleClick={handleDoubleClick}
          >
            {textElement.isDynamic ? textElement.dynamicContent || textElement.content : textElement.content}
          </div>
        );
      }

      case 'shape': {
        const shapeElement = element as ShapeElement;
        const shapeStyle: React.CSSProperties = {
          ...baseStyle,
          backgroundColor: shapeElement.fillColor,
          border: shapeElement.strokeWidth > 0 ? `${shapeElement.strokeWidth}px solid ${shapeElement.strokeColor}` : undefined,
        };

        switch (shapeElement.shapeType) {
          case 'rectangle':
            return (
              <div
                style={{
                  ...shapeStyle,
                  borderRadius: shapeElement.cornerRadius || 0,
                }}
              />
            );
          case 'circle':
            return (
              <div
                style={{
                  ...shapeStyle,
                  borderRadius: '50%',
                }}
              />
            );
          default:
            return <div style={shapeStyle} />;
        }
      }

      case 'image': {
        const imageElement = element as ImageElement;
        return (
          <img
            src={imageElement.src}
            alt={imageElement.alt || ''}
            style={{
              ...baseStyle,
              objectFit: imageElement.objectFit,
              borderRadius: imageElement.cornerRadius || 0,
            }}
            draggable={false}
          />
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

      default:
        return <div style={baseStyle}>Unknown element</div>;
    }
  };

  const resizeHandles = [
    { position: 'nw', cursor: 'nw-resize', style: { top: -4, left: -4 } },
    { position: 'n', cursor: 'n-resize', style: { top: -4, left: '50%', transform: 'translateX(-50%)' } },
    { position: 'ne', cursor: 'ne-resize', style: { top: -4, right: -4 } },
    { position: 'e', cursor: 'e-resize', style: { top: '50%', right: -4, transform: 'translateY(-50%)' } },
    { position: 'se', cursor: 'se-resize', style: { bottom: -4, right: -4 } },
    { position: 's', cursor: 's-resize', style: { bottom: -4, left: '50%', transform: 'translateX(-50%)' } },
    { position: 'sw', cursor: 'sw-resize', style: { bottom: -4, left: -4 } },
    { position: 'w', cursor: 'w-resize', style: { top: '50%', left: -4, transform: 'translateY(-50%)' } },
  ];

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500' : ''} ${element.locked ? 'cursor-not-allowed opacity-50' : ''}`}
      style={{
        left: element.position.x,
        top: element.position.y,
        zIndex: element.zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      {renderElement()}
      
      {isSelected && !element.locked && (
        <>
          {resizeHandles.map((handle) => (
            <div
              key={handle.position}
              className="resize-handle absolute w-2 h-2 bg-blue-500 border border-white"
              data-handle={handle.position}
              style={{
                ...handle.style,
                cursor: handle.cursor,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export const CanvasElement = memo(CanvasElementComponent);