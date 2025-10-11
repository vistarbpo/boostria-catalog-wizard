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
  const renderElement = (element: CanvasElement) => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${element.position.x}px`,
      top: `${element.position.y}px`,
      width: `${element.size.width}px`,
      height: `${element.size.height}px`,
      transform: `rotate(${element.rotation}deg)`,
      opacity: element.opacity,
      zIndex: element.zIndex,
      pointerEvents: 'none',
    };

    switch (element.type) {
      case 'text': {
        const textElement = element as TextElement;
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
              letterSpacing: textElement.letterSpacing ? `${textElement.letterSpacing}px` : undefined,
              direction: textElement.direction || 'ltr',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflow: 'hidden',
            }}
          >
            {textElement.content}
          </div>
        );
      }

      case 'image': {
        const imageElement = element as ImageElement;
        const borderRadius = imageElement.cornerRadii
          ? `${imageElement.cornerRadii.topLeft}px ${imageElement.cornerRadii.topRight}px ${imageElement.cornerRadii.bottomRight}px ${imageElement.cornerRadii.bottomLeft}px`
          : imageElement.cornerRadius || 0;
          
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
              src={imageElement.fillType === 'dynamic' ? imageElement.fillImageUrl : imageElement.src}
              alt={imageElement.alt || ''}
              style={{
                width: '100%',
                height: '100%',
                objectFit: imageElement.objectFit || 'cover',
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
          <button
            key={element.id}
            style={{
              ...baseStyle,
              color: buttonElement.color,
              backgroundColor: buttonElement.backgroundColor,
              fontSize: `${buttonElement.fontSize}px`,
              fontFamily: buttonElement.fontFamily,
              fontWeight: buttonElement.fontWeight,
              textAlign: buttonElement.textAlign,
              direction: buttonElement.direction || 'ltr',
              paddingTop: `${buttonElement.padding.top}px`,
              paddingRight: `${buttonElement.padding.right}px`,
              paddingBottom: `${buttonElement.padding.bottom}px`,
              paddingLeft: `${buttonElement.padding.left}px`,
              borderRadius,
              border: buttonElement.borderWidth > 0
                ? `${buttonElement.borderWidth}px solid ${buttonElement.borderColor}`
                : 'none',
              display: 'inline-block',
              cursor: 'default',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              boxSizing: 'border-box',
              outline: 'none',
              width: `${element.size.width}px`,
              height: `${element.size.height}px`,
            }}
          >
            {buttonElement.content}
          </button>
        );
      }

      case 'shape': {
        const shapeElement = element as ShapeElement;
        const borderRadius = shapeElement.cornerRadii
          ? `${shapeElement.cornerRadii.topLeft}px ${shapeElement.cornerRadii.topRight}px ${shapeElement.cornerRadii.bottomRight}px ${shapeElement.cornerRadii.bottomLeft}px`
          : shapeElement.cornerRadius || 0;

        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              backgroundColor: shapeElement.fillColor,
              borderRadius,
              border: shapeElement.strokeWidth > 0
                ? `${shapeElement.strokeWidth}px solid ${shapeElement.strokeColor}`
                : 'none',
              boxSizing: 'border-box',
            }}
          />
        );
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
