import React, { useState, useRef, useCallback, memo } from 'react';
import { CanvasElement as CanvasElementType, TextElement, ShapeElement, ImageElement, SVGElement, Position } from '../../types/canvas';
import { RotateCw } from 'lucide-react';

interface CanvasElementProps {
  element: CanvasElementType;
  isSelected: boolean;
  scale: number;
  onSelect: (elementId: string, multiSelect?: boolean) => void;
  onMove: (elementId: string, newPosition: Position) => void;
  onResize: (elementId: string, newSize: { width: number; height: number }) => void;
  onRotate?: (elementId: string, rotation: number) => void;
  onDoubleClick?: (elementId: string) => void;
}

const CanvasElementComponent = function CanvasElement({ 
  element, 
  isSelected, 
  scale,
  onSelect, 
  onMove, 
  onResize,
  onRotate,
  onDoubleClick
}: CanvasElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: 0, elementY: 0 });
  const [rotationStart, setRotationStart] = useState({ angle: 0, startAngle: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (element.locked) return;
    
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const isMultiSelect = e.ctrlKey || e.metaKey;
    onSelect(element.id, isMultiSelect);

    if (e.target instanceof HTMLElement) {
      if (e.target.classList.contains('resize-handle')) {
        setIsResizing(true);
        setResizeHandle(e.target.dataset.handle || '');
        setDragStart({
          x: e.clientX,
          y: e.clientY,
          elementX: element.position.x,
          elementY: element.position.y
        });
      } else if (e.target.classList.contains('rotation-handle')) {
        setIsRotating(true);
        const elementCenter = {
          x: element.position.x + element.size.width / 2,
          y: element.position.y + element.size.height / 2
        };
        const angle = Math.atan2(e.clientY - elementCenter.y, e.clientX - elementCenter.x) * (180 / Math.PI);
        setRotationStart({
          angle: element.rotation,
          startAngle: angle
        });
      } else {
        setIsDragging(true);
        setDragStart({
          x: e.clientX,
          y: e.clientY,
          elementX: element.position.x,
          elementY: element.position.y
        });
      }
    }
  }, [element.id, element.locked, element.position, element.rotation, element.size, onSelect]);

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
    } else if (isRotating && onRotate) {
      const elementCenter = {
        x: element.position.x + element.size.width / 2,
        y: element.position.y + element.size.height / 2
      };
      const currentAngle = Math.atan2(e.clientY - elementCenter.y, e.clientX - elementCenter.x) * (180 / Math.PI);
      const deltaAngle = currentAngle - rotationStart.startAngle;
      let newRotation = rotationStart.angle + deltaAngle;
      
      // Snap to 15-degree increments when holding Shift
      if (e.shiftKey) {
        newRotation = Math.round(newRotation / 15) * 15;
      }
      
      // Normalize rotation to 0-360 degrees
      newRotation = ((newRotation % 360) + 360) % 360;
      
      onRotate(element.id, newRotation);
    }
  }, [isDragging, isResizing, isRotating, resizeHandle, dragStart, rotationStart, element, scale, onMove, onResize, onRotate]);

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
    { position: 'nw', cursor: 'nw-resize', style: { top: -6, left: -6 } },
    { position: 'n', cursor: 'n-resize', style: { top: -6, left: '50%', transform: 'translateX(-50%)' } },
    { position: 'ne', cursor: 'ne-resize', style: { top: -6, right: -6 } },
    { position: 'e', cursor: 'e-resize', style: { top: '50%', right: -6, transform: 'translateY(-50%)' } },
    { position: 'se', cursor: 'se-resize', style: { bottom: -6, right: -6 } },
    { position: 's', cursor: 's-resize', style: { bottom: -6, left: '50%', transform: 'translateX(-50%)' } },
    { position: 'sw', cursor: 'sw-resize', style: { bottom: -6, left: -6 } },
    { position: 'w', cursor: 'w-resize', style: { top: '50%', left: -6, transform: 'translateY(-50%)' } },
  ];

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-move transition-all duration-150 ${
        isSelected 
          ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-lg' 
          : 'hover:ring-1 hover:ring-blue-300 hover:ring-opacity-30'
      } ${element.locked ? 'cursor-not-allowed opacity-50' : ''}`}
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
          {/* Resize Handles */}
          {resizeHandles.map((handle) => (
            <div
              key={handle.position}
              className="resize-handle absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-sm shadow-sm hover:bg-blue-50 transition-colors duration-150"
              data-handle={handle.position}
              style={{
                ...handle.style,
                cursor: handle.cursor,
              }}
            />
          ))}
          
          {/* Rotation Handle */}
          <div
            className="rotation-handle absolute w-6 h-6 bg-white border-2 border-blue-500 rounded-full shadow-sm hover:bg-blue-50 transition-all duration-150 flex items-center justify-center cursor-grab active:cursor-grabbing"
            style={{
              top: -24,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <RotateCw className="w-3 h-3 text-blue-600" />
          </div>
          
          {/* Rotation Line */}
          <div
            className="absolute w-px h-4 bg-blue-400 pointer-events-none"
            style={{
              top: -20,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </>
      )}
    </div>
  );
};

export const CanvasElement = memo(CanvasElementComponent);