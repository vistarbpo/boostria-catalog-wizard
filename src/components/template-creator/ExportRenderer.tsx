import React from 'react';
import { CanvasElement, TextElement, ImageElement, ButtonElement, ShapeElement } from '@/types/canvas';
import {
  getTextStyles,
  renderTextDecoration,
  getButtonStyles,
  getImageStyles,
  getShapeStyles,
  renderTriangleSVG,
} from './renderUtils';

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
        const textStyles = getTextStyles(textElement, baseStyle);
        
        // Custom export-specific text decoration rendering
        const renderExportTextDecoration = () => {
          if (textElement.textDecoration === 'underline') {
            return (
              <span style={{
                textDecoration: 'underline',
                textDecorationColor: textElement.color,
                textDecorationThickness: '1.5px',
                textUnderlineOffset: '2px',
              }}>
                {textElement.content}
              </span>
            );
          } else if (textElement.textDecoration === 'line-through') {
            return (
              <span style={{ 
                position: 'relative',
                display: 'inline-block',
              }}>
                {textElement.content}
                <span style={{
                  position: 'absolute',
                  left: '0',
                  right: '0',
                  top: '72%',
                  height: '2px',
                  backgroundColor: textElement.color,
                  pointerEvents: 'none',
                }} />
              </span>
            );
          }
          return <span>{textElement.content}</span>;
        };
        
        return (
          <div key={element.id} style={textStyles}>
            {renderExportTextDecoration()}
          </div>
        );
      }

      case 'image': {
        const imageElement = element as ImageElement;
        const imageStyles = getImageStyles(imageElement, baseStyle);
        const borderRadius = imageElement.cornerRadii
          ? `${imageElement.cornerRadii.topLeft}px ${imageElement.cornerRadii.topRight}px ${imageElement.cornerRadii.bottomRight}px ${imageElement.cornerRadii.bottomLeft}px`
          : imageElement.cornerRadius || 0;
        
        const objectFit = 
          imageStyles.fillMode === 'cover' ? 'cover' :
          imageStyles.fillMode === 'contain' ? 'contain' :
          imageStyles.fillMode === 'stretch' || imageStyles.fillMode === 'fill' ? 'fill' :
          (imageStyles.fillMode === 'center' || imageStyles.fillMode === 'tile') ? 'none' : 'cover';
        
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              overflow: 'hidden',
              borderRadius,
            }}
          >
            <img
              src={imageStyles.imageSrc}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit,
                objectPosition: 'center',
                display: 'block',
              }}
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
              position: 'absolute',
              left: `${element.position.x}px`,
              top: `${element.position.y}px`,
              width: `${element.size.width}px`,
              height: `${element.size.height}px`,
              transform: `rotate(${element.rotation}deg)`,
              opacity: element.opacity / 100,
              zIndex: element.zIndex,
              backgroundColor: buttonElement.backgroundColor,
              borderRadius,
              border: buttonElement.borderWidth > 0
                ? `${buttonElement.borderWidth}px solid ${buttonElement.borderColor}`
                : 'none',
              pointerEvents: 'none',
              overflow: 'hidden',
            }}
          >
            <span style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -75%)',
              color: buttonElement.color,
              fontSize: `${buttonElement.fontSize}px`,
              fontFamily: buttonElement.fontFamily,
              fontWeight: buttonElement.fontWeight,
              direction: buttonElement.direction || 'ltr',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            } as React.CSSProperties}>
              {buttonElement.content}
            </span>
          </div>
        );
      }

      case 'shape': {
        const shapeElement = element as ShapeElement;
        const shapeStyles = getShapeStyles(shapeElement, baseStyle);

        switch (shapeStyles.shapeType) {
          case 'rectangle':
            return (
              <div
                key={element.id}
                style={{
                  ...shapeStyles.base,
                  borderRadius: shapeStyles.borderRadius,
                  boxSizing: 'border-box',
                }}
              />
            );
          
          case 'circle':
            return (
              <div
                key={element.id}
                style={{
                  ...shapeStyles.base,
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
                {renderTriangleSVG(shapeElement)}
              </div>
            );
          
          case 'star':
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
                    points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" 
                    fill={shapeElement.fillType === 'image' ? `url(#pattern-${shapeElement.id})` : shapeElement.fillColor}
                    stroke={shapeElement.strokeColor}
                    strokeWidth={shapeElement.strokeWidth}
                  />
                </svg>
              </div>
            );
          
          case 'heart':
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
                  <path 
                    d="M50,25 C50,25 25,0 0,25 C0,50 50,100 50,100 C50,100 100,50 100,25 C75,0 50,25 50,25 Z" 
                    fill={shapeElement.fillType === 'image' ? `url(#pattern-${shapeElement.id})` : shapeElement.fillColor}
                    stroke={shapeElement.strokeColor}
                    strokeWidth={shapeElement.strokeWidth}
                  />
                </svg>
              </div>
            );
          
          case 'plus':
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
                    points="40,0 60,0 60,40 100,40 100,60 60,60 60,100 40,100 40,60 0,60 0,40 40,40" 
                    fill={shapeElement.fillType === 'image' ? `url(#pattern-${shapeElement.id})` : shapeElement.fillColor}
                    stroke={shapeElement.strokeColor}
                    strokeWidth={shapeElement.strokeWidth}
                  />
                </svg>
              </div>
            );
          
          case 'diamond':
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
                    points="50,0 100,50 50,100 0,50" 
                    fill={shapeElement.fillType === 'image' ? `url(#pattern-${shapeElement.id})` : shapeElement.fillColor}
                    stroke={shapeElement.strokeColor}
                    strokeWidth={shapeElement.strokeWidth}
                  />
                </svg>
              </div>
            );
          
          case 'arrow':
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
                    points="0,20 60,20 60,0 100,50 60,100 60,80 0,80" 
                    fill={shapeElement.fillType === 'image' ? `url(#pattern-${shapeElement.id})` : shapeElement.fillColor}
                    stroke={shapeElement.strokeColor}
                    strokeWidth={shapeElement.strokeWidth}
                  />
                </svg>
              </div>
            );
          
          case 'line':
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
                  preserveAspectRatio="none"
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
              </div>
            );
          
          default:
            return (
              <div
                key={element.id}
                style={{
                  ...shapeStyles.base,
                  borderRadius: shapeStyles.borderRadius,
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
