import React, { useState, useRef, useCallback, memo } from 'react';
import { CanvasElement as CanvasElementType, TextElement, ShapeElement, ImageElement, SVGElement, Position } from '../types/canvas';

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
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [originalPosition, setOriginalPosition] = useState(element.position);
  const [originalSize, setOriginalSize] = useState(element.size);
  const elementRef = useRef<HTMLDivElement>(null);
  const handleMouseMoveRef = useRef<(e: MouseEvent) => void>(() => {});
  const handleMouseUpRef = useRef<() => void>(() => {});

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const isMultiSelect = e.ctrlKey || e.metaKey;
    onSelect(element.id, isMultiSelect);

    if (e.detail === 2) { // Double click
      onDoubleClick?.(element.id);
      return;
    }

    const isResizeHandle = (e.target as HTMLElement).classList.contains('resize-handle');
    
    if (isResizeHandle) {
      setIsResizing(true);
      setOriginalSize(element.size);
    } else {
      setIsDragging(true);
      setOriginalPosition(element.position);
    }
    
    setDragStart({
      x: e.clientX,
      y: e.clientY
    });
  }, [element.id, element.position, element.size, onSelect, onDoubleClick]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging && !isResizing) return;

    const deltaX = (e.clientX - dragStart.x) / scale;
    const deltaY = (e.clientY - dragStart.y) / scale;

    if (isDragging) {
      onMove(element.id, {
        x: originalPosition.x + deltaX,
        y: originalPosition.y + deltaY
      });
    }

    if (isResizing) {
      const newWidth = Math.max(20, originalSize.width + deltaX);
      const newHeight = Math.max(20, originalSize.height + deltaY);
      onResize(element.id, { width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, dragStart, originalPosition, originalSize, scale, element.id, onMove, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Update refs when callbacks change
  handleMouseMoveRef.current = handleMouseMove;
  handleMouseUpRef.current = handleMouseUp;

  React.useEffect(() => {
    if (isDragging || isResizing) {
      const moveHandler = (e: MouseEvent) => handleMouseMoveRef.current(e);
      const upHandler = () => handleMouseUpRef.current();
      
      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', upHandler);
      return () => {
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
      };
    }
  }, [isDragging, isResizing]);

  const renderElement = () => {
    const baseStyle: React.CSSProperties = {
      opacity: element.opacity / 100,
      transform: `rotate(${element.rotation}deg)`,
      visibility: element.visible ? 'visible' : 'hidden'
    };

    switch (element.type) {
      case 'text':
        const textEl = element as TextElement;
        
        // Get the content to display - dynamic or static
        const displayContent = textEl.isDynamic && textEl.dynamicContent 
          ? textEl.dynamicContent 
          : textEl.content;
        
        return (
          <div
            style={{
              ...baseStyle,
              fontFamily: textEl.fontFamily,
              fontSize: `${textEl.fontSize}px`,
              fontWeight: textEl.fontWeight,
              color: textEl.color,
              textAlign: textEl.textAlign,
              letterSpacing: `${textEl.letterSpacing}px`,
              lineHeight: textEl.lineHeight,
              padding: `${textEl.padding.top}px ${textEl.padding.right}px ${textEl.padding.bottom}px ${textEl.padding.left}px`,
              backgroundColor: textEl.backgroundColor,
              border: textEl.strokeWidth ? `${textEl.strokeWidth}px solid ${textEl.strokeColor}` : undefined,
              whiteSpace: textEl.textWrapping ? 'normal' : 'nowrap',
              overflow: 'visible',
              cursor: isDragging ? 'grabbing' : 'grab',
              wordBreak: textEl.textWrapping ? 'break-word' : 'normal',
              // Auto-resize height for text elements
              minHeight: textEl.autoSize ? 'auto' : `${textEl.fontSize * textEl.lineHeight}px`,
              width: '100%',
              height: textEl.autoSize ? 'auto' : '100%',
              display: 'flex',
              alignItems: textEl.textAlign === 'center' ? 'center' : 'flex-start',
              justifyContent: textEl.textAlign === 'center' ? 'center' : textEl.textAlign === 'right' ? 'flex-end' : 'flex-start'
            }}
            className={`select-none ${textEl.isDynamic ? 'text-blue-600' : ''}`}
          >
            {displayContent || 'Text'}
          </div>
        );

      case 'shape':
        const shapeEl = element as ShapeElement;
        const shapeStyle: React.CSSProperties = {
          ...baseStyle,
          cursor: isDragging ? 'grabbing' : 'grab'
        };

        const renderSVGShape = () => {
          const svgStyle: React.CSSProperties = {
            width: '100%',
            height: '100%',
            ...shapeStyle
          };

          // Helper function to get fill based on fillType
          const getFill = () => {
            if (shapeEl.fillType === 'image' && shapeEl.fillImageUrl) {
              return `url(#pattern-${element.id})`;
            }
            return shapeEl.fillColor;
          };

          // Helper function to create pattern definition for image fills
          const createImagePattern = () => {
            if (shapeEl.fillType === 'image' && shapeEl.fillImageUrl) {
              const fillMode = shapeEl.fillMode || 'cover';
              let preserveAspectRatio = 'xMidYMid slice'; // Default for cover
              let patternWidth = '100%';
              let patternHeight = '100%';
              
              switch (fillMode) {
                case 'contain':
                  preserveAspectRatio = 'xMidYMid meet';
                  break;
                case 'stretch':
                  preserveAspectRatio = 'none';
                  break;
                case 'center':
                  preserveAspectRatio = 'xMidYMid meet';
                  break;
                case 'tile':
                  patternWidth = '25%';
                  patternHeight = '25%';
                  preserveAspectRatio = 'xMidYMid slice';
                  break;
                case 'cover':
                default:
                  preserveAspectRatio = 'xMidYMid slice';
                  break;
              }

              return (
                <defs>
                  <pattern
                    id={`pattern-${element.id}`}
                    patternUnits="objectBoundingBox"
                    width={fillMode === 'tile' ? '0.25' : '1'}
                    height={fillMode === 'tile' ? '0.25' : '1'}
                  >
                    <image
                      href={shapeEl.fillImageUrl}
                      x="0"
                      y="0"
                      width="100%"
                      height="100%"
                      preserveAspectRatio={preserveAspectRatio}
                    />
                  </pattern>
                </defs>
              );
            }
            return null;
          };

          switch (shapeEl.shapeType) {
            case 'circle':
              return (
                <svg style={svgStyle} viewBox="0 0 100 100">
                  {createImagePattern()}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill={getFill()}
                    stroke={shapeEl.strokeColor}
                    strokeWidth={shapeEl.strokeWidth || 0}
                  />
                </svg>
              );
            
            case 'rectangle':
              if (shapeEl.fillType === 'image' && shapeEl.fillImageUrl) {
                const fillMode = shapeEl.fillMode || 'cover';
                let backgroundSize = 'cover';
                let backgroundRepeat = 'no-repeat';
                let backgroundPosition = 'center';
                
                switch (fillMode) {
                  case 'contain':
                    backgroundSize = 'contain';
                    break;
                  case 'stretch':
                    backgroundSize = '100% 100%';
                    break;
                  case 'center':
                    backgroundSize = 'auto';
                    break;
                  case 'tile':
                    backgroundSize = '25% 25%';
                    backgroundRepeat = 'repeat';
                    break;
                  case 'cover':
                  default:
                    backgroundSize = 'cover';
                    break;
                }

                return (
                  <div style={{
                    ...shapeStyle,
                    backgroundImage: `url(${shapeEl.fillImageUrl})`,
                    backgroundSize,
                    backgroundPosition,
                    backgroundRepeat,
                    border: shapeEl.strokeWidth ? `${shapeEl.strokeWidth}px solid ${shapeEl.strokeColor}` : undefined,
                    borderRadius: `${shapeEl.cornerRadius || 0}px`,
                    width: '100%',
                    height: '100%'
                  }} />
                );
              }
              return (
                <div style={{
                  ...shapeStyle,
                  backgroundColor: shapeEl.fillColor,
                  border: shapeEl.strokeWidth ? `${shapeEl.strokeWidth}px solid ${shapeEl.strokeColor}` : undefined,
                  borderRadius: `${shapeEl.cornerRadius || 0}px`,
                  width: '100%',
                  height: '100%'
                }} />
              );
            
            case 'triangle':
              return (
                <svg style={svgStyle} viewBox="0 0 100 100">
                  {createImagePattern()}
                  <polygon
                    points="50,10 90,90 10,90"
                    fill={getFill()}
                    stroke={shapeEl.strokeColor}
                    strokeWidth={shapeEl.strokeWidth || 0}
                  />
                </svg>
              );
            
            case 'star':
              return (
                <svg style={svgStyle} viewBox="0 0 100 100">
                  {createImagePattern()}
                  <polygon
                    points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35"
                    fill={getFill()}
                    stroke={shapeEl.strokeColor}
                    strokeWidth={shapeEl.strokeWidth || 0}
                  />
                </svg>
              );
            
            case 'heart':
              return (
                <svg style={svgStyle} viewBox="0 0 100 100">
                  {createImagePattern()}
                  <path
                    d="M50,90 C50,90 15,60 15,35 C15,20 25,10 40,10 C45,10 50,15 50,15 C50,15 55,10 60,10 C75,10 85,20 85,35 C85,60 50,90 50,90 Z"
                    fill={getFill()}
                    stroke={shapeEl.strokeColor}
                    strokeWidth={shapeEl.strokeWidth || 0}
                  />
                </svg>
              );
            
            case 'polygon':
              return (
                <svg style={svgStyle} viewBox="0 0 100 100">
                  {createImagePattern()}
                  <polygon
                    points="50,5 80,25 80,75 50,95 20,75 20,25"
                    fill={getFill()}
                    stroke={shapeEl.strokeColor}
                    strokeWidth={shapeEl.strokeWidth || 0}
                  />
                </svg>
              );
            
            default:
              if (shapeEl.fillType === 'image' && shapeEl.fillImageUrl) {
                return (
                  <div style={{
                    ...shapeStyle,
                    backgroundImage: `url(${shapeEl.fillImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: shapeEl.strokeWidth ? `${shapeEl.strokeWidth}px solid ${shapeEl.strokeColor}` : undefined,
                    width: '100%',
                    height: '100%'
                  }} />
                );
              }
              return (
                <div style={{
                  ...shapeStyle,
                  backgroundColor: shapeEl.fillColor,
                  border: shapeEl.strokeWidth ? `${shapeEl.strokeWidth}px solid ${shapeEl.strokeColor}` : undefined,
                  width: '100%',
                  height: '100%'
                }} />
              );
          }
        };

        return renderSVGShape();

      case 'image':
        const imageEl = element as ImageElement;
        const imageSrc = imageEl.fillType === 'dynamic' && imageEl.fillImageUrl ? imageEl.fillImageUrl : imageEl.src;
        return (
          <img
            src={imageSrc}
            alt={imageEl.alt}
            style={{
              ...baseStyle,
              width: '100%',
              height: '100%',
              objectFit: imageEl.objectFit,
              borderRadius: imageEl.cornerRadius ? `${imageEl.cornerRadius}px` : undefined,
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            className="select-none"
            draggable={false}
          />
        );

      case 'svg':
        const svgEl = element as SVGElement;
        
        // Create SVG content with dynamic fills
        const renderSVGWithFill = () => {
          let svgContent = svgEl.svgContent;
          
          if (svgEl.fillType === 'image' && svgEl.fillImageUrl) {
            // Create a unique pattern ID for this element
            const patternId = `pattern-${element.id}`;
            
            // Add pattern definition and apply it
            const patternDef = `
              <defs>
                <pattern id="${patternId}" patternUnits="objectBoundingBox" width="1" height="1">
                  <image href="${svgEl.fillImageUrl}" x="0" y="0" width="1" height="1" preserveAspectRatio="${
                    svgEl.fillMode === 'contain' ? 'xMidYMid meet' :
                    svgEl.fillMode === 'cover' ? 'xMidYMid slice' :
                    svgEl.fillMode === 'stretch' ? 'none' :
                    svgEl.fillMode === 'center' ? 'xMidYMid meet' :
                    'none'
                  }" />
                </pattern>
              </defs>`;
            
            // Insert pattern definition and apply fill
            svgContent = svgContent.replace('<svg', `<svg`);
            svgContent = svgContent.replace(/(<svg[^>]*>)/, `$1${patternDef}`);
            svgContent = svgContent.replace(/fill="[^"]*"/g, `fill="url(#${patternId})"`);
          } else {
            // Apply color fills
            svgContent = svgContent
              .replace(/fill="[^"]*"/g, svgEl.fillColor ? `fill="${svgEl.fillColor}"` : '')
              .replace(/stroke="[^"]*"/g, svgEl.strokeColor ? `stroke="${svgEl.strokeColor}"` : '')
              .replace(/stroke-width="[^"]*"/g, svgEl.strokeWidth ? `stroke-width="${svgEl.strokeWidth}"` : '');
          }
          
          return svgContent;
        };

        return (
          <div
            style={{
              ...baseStyle,
              width: '100%',
              height: '100%',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            className="select-none"
            dangerouslySetInnerHTML={{
              __html: renderSVGWithFill()
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={elementRef}
      style={{
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.size.width}px`,
        height: `${element.size.height}px`,
        zIndex: element.zIndex,
        outline: isSelected ? '2px solid #3b82f6' : 'none',
        outlineOffset: '2px'
      }}
      onMouseDown={handleMouseDown}
      className="group"
    >
      {renderElement()}
      
      {/* Selection handles */}
      {isSelected && (
        <>
          {/* Corner resize handles */}
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded cursor-nw-resize resize-handle shadow-sm hover:bg-blue-600 transition-colors" />
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded cursor-ne-resize resize-handle shadow-sm hover:bg-blue-600 transition-colors" />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded cursor-sw-resize resize-handle shadow-sm hover:bg-blue-600 transition-colors" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded cursor-se-resize resize-handle shadow-sm hover:bg-blue-600 transition-colors" />
          
          {/* Edge resize handles - show for all elements, but with different behavior for text */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded cursor-n-resize resize-handle shadow-sm hover:bg-blue-600 transition-colors" />
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded cursor-s-resize resize-handle shadow-sm hover:bg-blue-600 transition-colors" />
          <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded cursor-w-resize resize-handle shadow-sm hover:bg-blue-600 transition-colors" />
          <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded cursor-e-resize resize-handle shadow-sm hover:bg-blue-600 transition-colors" />
          
          {/* Text-specific handles: For text elements, show text resize indicators */}
          {element.type === 'text' && (
            <>
              {/* Text width adjustment handles */}
              <div className="absolute -left-2 -top-6 w-6 h-3 bg-blue-500/20 border border-blue-500 rounded-sm flex items-center justify-center cursor-ew-resize resize-handle shadow-sm hover:bg-blue-500/30 transition-colors">
                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
              </div>
              <div className="absolute -right-2 -top-6 w-6 h-3 bg-blue-500/20 border border-blue-500 rounded-sm flex items-center justify-center cursor-ew-resize resize-handle shadow-sm hover:bg-blue-500/30 transition-colors">
                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export const CanvasElement = memo(CanvasElementComponent);