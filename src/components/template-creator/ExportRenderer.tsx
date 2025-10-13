import React from 'react';
import { CanvasElement, TextElement, ImageElement, ButtonElement, ShapeElement } from '@/types/canvas';

interface ExportRendererProps {
  elements: CanvasElement[];
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  backgroundType?: 'solid' | 'image';
  backgroundImageUrl?: string;
  backgroundMode?: 'cover' | 'contain' | 'stretch' | 'tile' | 'center';
}

export const ExportRenderer: React.FC<ExportRendererProps> = ({
  elements,
  canvasWidth,
  canvasHeight,
  backgroundColor,
  backgroundType,
  backgroundImageUrl,
  backgroundMode,
}) => {
  const getBorderRadiusStyle = (shapeElement: ShapeElement) => {
    if (shapeElement.cornerRadii) {
      return `${shapeElement.cornerRadii.topLeft}px ${shapeElement.cornerRadii.topRight}px ${shapeElement.cornerRadii.bottomRight}px ${shapeElement.cornerRadii.bottomLeft}px`;
    }
    return shapeElement.cornerRadius || 0;
  };

  const renderElement = (element: CanvasElement) => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${element.position.x}px`,
      top: `${element.position.y}px`,
      width: `${element.size.width}px`,
      height: `${element.size.height}px`,
      transform: `rotate(${element.rotation}deg)`,
      opacity: element.opacity / 100,
      zIndex: element.zIndex,
      pointerEvents: 'none',
    };

    switch (element.type) {
      case 'text': {
        const textElement = element as TextElement;
        const textContent = textElement.content;
        const hasDecoration = textElement.textDecoration && textElement.textDecoration !== 'none';
        
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              color: textElement.color,
              fontSize: `${textElement.fontSize}px`,
              fontFamily: textElement.fontFamily,
              fontWeight: textElement.fontWeight,
              textAlign: textElement.textAlign,
              lineHeight: textElement.lineHeight,
              letterSpacing: `${textElement.letterSpacing}px`,
              direction: textElement.direction || 'ltr',
              textTransform: textElement.textTransform || 'none',
              backgroundColor: textElement.backgroundColor,
              border: textElement.strokeWidth > 0 ? `${textElement.strokeWidth}px solid ${textElement.strokeColor}` : undefined,
              padding: `${textElement.padding.top}px ${textElement.padding.right}px ${textElement.padding.bottom}px ${textElement.padding.left}px`,
              whiteSpace: textElement.textWrapping ? 'normal' : 'nowrap',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: textElement.textAlign === 'center' ? 'center' : textElement.textAlign === 'right' ? 'flex-end' : 'flex-start',
              boxSizing: 'border-box',
            }}
          >
            <span style={{
              position: 'relative',
              display: 'inline-block',
            }}>
              {textContent}
              {hasDecoration && textElement.textDecoration === 'underline' && (
                <span style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: '0.1em',
                  height: '0.1em',
                  backgroundColor: textElement.color,
                }} />
              )}
              {hasDecoration && textElement.textDecoration === 'line-through' && (
                <span style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: '50%',
                  height: '0.1em',
                  backgroundColor: textElement.color,
                  transform: 'translateY(-50%)',
                }} />
              )}
            </span>
          </div>
        );
      }

      case 'image': {
        const imageElement = element as ImageElement;
        const borderRadius = imageElement.cornerRadii
          ? `${imageElement.cornerRadii.topLeft}px ${imageElement.cornerRadii.topRight}px ${imageElement.cornerRadii.bottomRight}px ${imageElement.cornerRadii.bottomLeft}px`
          : imageElement.cornerRadius || 0;
        
        // Use dynamic image URL if fillType is 'dynamic' and fillImageUrl is set
        const imageSrc = imageElement.fillType === 'dynamic' && imageElement.fillImageUrl 
          ? imageElement.fillImageUrl 
          : imageElement.src;
        
        const imageStyle: React.CSSProperties = {
          ...baseStyle,
          overflow: 'hidden',
          borderRadius,
        };

        // Determine objectFit - prioritize objectFit property
        let objectFit: React.CSSProperties['objectFit'] = imageElement.objectFit || 'cover';
        
        // Only override if using dynamic fill with explicit fillMode
        if (imageElement.fillType === 'dynamic' && imageElement.fillImageUrl && imageElement.fillMode) {
          if (imageElement.fillMode === 'tile') {
            // Return div with background for tiling
            return (
              <div
                key={element.id}
                style={{
                  ...imageStyle,
                  backgroundImage: `url(${imageElement.fillImageUrl})`,
                  backgroundRepeat: 'repeat',
                  backgroundSize: 'auto',
                  backgroundPosition: 'center',
                }}
              />
            );
          }
          
          // Map fillMode to objectFit
          objectFit = 
            imageElement.fillMode === 'cover' ? 'cover' :
            imageElement.fillMode === 'contain' ? 'contain' :
            imageElement.fillMode === 'stretch' ? 'fill' :
            imageElement.fillMode === 'center' ? 'none' :
            'cover';
        }
          
        return (
          <div
            key={element.id}
            style={imageStyle}
          >
            <img
              src={imageSrc}
              alt={imageElement.alt || ''}
              style={{
                width: '100%',
                height: '100%',
                objectFit,
                display: 'block',
              }}
              crossOrigin="anonymous"
            />
          </div>
        );
      }

      case 'button': {
        const buttonElement = element as ButtonElement;
        const borderRadius = buttonElement.cornerRadii
          ? `${buttonElement.cornerRadii.topLeft}px ${buttonElement.cornerRadii.topRight}px ${buttonElement.cornerRadii.bottomRight}px ${buttonElement.cornerRadii.bottomLeft}px`
          : buttonElement.cornerRadius || 0;

        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              backgroundColor: buttonElement.backgroundColor,
              borderRadius,
              border: buttonElement.borderWidth > 0
                ? `${buttonElement.borderWidth}px solid ${buttonElement.borderColor}`
                : 'none',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: `${buttonElement.padding.top}px`,
              paddingRight: `${buttonElement.padding.right}px`,
              paddingBottom: `${buttonElement.padding.bottom}px`,
              paddingLeft: `${buttonElement.padding.left}px`,
            }}
          >
            <span
              style={{
                color: buttonElement.color,
                fontSize: `${buttonElement.fontSize}px`,
                fontFamily: buttonElement.fontFamily,
                fontWeight: buttonElement.fontWeight,
                direction: buttonElement.direction || 'ltr',
                whiteSpace: 'nowrap',
                userSelect: 'none',
                lineHeight: '1',
                display: 'block',
              }}
            >
              {buttonElement.content}
            </span>
          </div>
        );
      }

      case 'shape': {
        const shapeElement = element as ShapeElement;
        
        const shapeBaseStyle: React.CSSProperties = {
          ...baseStyle,
          border: shapeElement.strokeWidth > 0 
            ? `${shapeElement.strokeWidth}px solid ${shapeElement.strokeColor}` 
            : undefined,
        };

        // Handle image fill
        if (shapeElement.fillType === 'image' && shapeElement.fillImageUrl) {
          shapeBaseStyle.backgroundImage = `url(${shapeElement.fillImageUrl})`;
          shapeBaseStyle.backgroundSize = 
            shapeElement.fillMode === 'cover' ? 'cover' :
            shapeElement.fillMode === 'contain' ? 'contain' :
            shapeElement.fillMode === 'stretch' ? '100% 100%' :
            shapeElement.fillMode === 'tile' ? 'auto' : 'cover';
          shapeBaseStyle.backgroundRepeat = shapeElement.fillMode === 'tile' ? 'repeat' : 'no-repeat';
          shapeBaseStyle.backgroundPosition = 'center';
        } else {
          shapeBaseStyle.backgroundColor = shapeElement.fillColor;
        }

        switch (shapeElement.shapeType) {
          case 'rectangle':
            return (
              <div
                key={element.id}
                style={{
                  ...shapeBaseStyle,
                  borderRadius: getBorderRadiusStyle(shapeElement),
                  boxSizing: 'border-box',
                }}
              />
            );
          
          case 'circle':
            return (
              <div
                key={element.id}
                style={{
                  ...shapeBaseStyle,
                  borderRadius: '50%',
                  boxSizing: 'border-box',
                }}
              />
            );
          
          case 'triangle':
            return (
              <div
                key={element.id}
                style={{
                  ...baseStyle,
                  boxSizing: 'border-box',
                }}
              >
                <svg 
                  width="100%" 
                  height="100%" 
                  viewBox="0 0 100 100"
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
                    points="50,10 90,90 10,90" 
                    fill={shapeElement.fillType === 'image' ? `url(#pattern-${shapeElement.id})` : shapeElement.fillColor}
                    stroke={shapeElement.strokeColor}
                    strokeWidth={shapeElement.strokeWidth}
                  />
                </svg>
              </div>
            );
          
          default:
            return (
              <div
                key={element.id}
                style={{
                  ...shapeBaseStyle,
                  borderRadius: getBorderRadiusStyle(shapeElement),
                  boxSizing: 'border-box',
                }}
              />
            );
        }
      }

      default:
        return null;
    }
  };

  const backgroundStyle: React.CSSProperties = {
    backgroundColor,
  };

  if (backgroundType === 'image' && backgroundImageUrl) {
    backgroundStyle.backgroundImage = `url(${backgroundImageUrl})`;
    backgroundStyle.backgroundSize =
      backgroundMode === 'cover'
        ? 'cover'
        : backgroundMode === 'contain'
        ? 'contain'
        : backgroundMode === 'stretch'
        ? '100% 100%'
        : backgroundMode === 'tile'
        ? 'auto'
        : 'auto';
    backgroundStyle.backgroundRepeat = backgroundMode === 'tile' ? 'repeat' : 'no-repeat';
    backgroundStyle.backgroundPosition = 'center';
  }

  return (
    <div
      style={{
        position: 'relative',
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        ...backgroundStyle,
      }}
    >
      {elements
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((element) => renderElement(element))}
    </div>
  );
};
