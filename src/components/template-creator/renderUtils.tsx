import React from 'react';
import { TextElement, ButtonElement, ImageElement, ShapeElement } from '@/types/canvas';

/**
 * Shared rendering utilities to ensure 100% consistency between preview and export
 */

export const getTextStyles = (textElement: TextElement, baseStyle: React.CSSProperties): React.CSSProperties => {
  return {
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
    whiteSpace: textElement.textWrapping ? 'pre-wrap' : 'nowrap',
    wordWrap: (textElement.textWrapping ? 'break-word' : 'normal') as 'break-word' | 'normal',
    overflowWrap: (textElement.textWrapping ? 'break-word' : 'normal') as 'break-word' | 'normal',
    overflow: 'visible',
    display: 'flex',
    alignItems: 'center',
    justifyContent: textElement.textAlign === 'center' ? 'center' : textElement.textAlign === 'right' ? 'flex-end' : 'flex-start',
    boxSizing: 'border-box' as const,
  };
};

export const renderTextDecoration = (textElement: TextElement, content: string) => {
  if (textElement.textDecoration === 'underline') {
    return (
      <span style={{
        textDecoration: 'underline',
        textDecorationColor: textElement.color,
        textDecorationThickness: '1.5px',
        textUnderlineOffset: '2px',
      }}>
        {content}
      </span>
    );
  } else if (textElement.textDecoration === 'line-through') {
    // Custom positioned strike-through for precise control
    return (
      <span style={{ 
        position: 'relative',
        display: 'inline-block',
      }}>
        {content}
        <span style={{
          position: 'absolute',
          left: '0',
          right: '0',
          top: '50%',
          height: '2px',
          backgroundColor: textElement.color,
          pointerEvents: 'none',
        }} />
      </span>
    );
  }
  
  return <span>{content}</span>;
};

export const getButtonStyles = (buttonElement: ButtonElement, baseStyle: React.CSSProperties) => {
  const borderRadius = buttonElement.cornerRadii
    ? `${buttonElement.cornerRadii.topLeft}px ${buttonElement.cornerRadii.topRight}px ${buttonElement.cornerRadii.bottomRight}px ${buttonElement.cornerRadii.bottomLeft}px`
    : buttonElement.cornerRadius || 0;

  return {
    container: {
      ...baseStyle,
      backgroundColor: buttonElement.backgroundColor,
      borderRadius,
      border: buttonElement.borderWidth > 0
        ? `${buttonElement.borderWidth}px solid ${buttonElement.borderColor}`
        : 'none',
      boxSizing: 'border-box' as const,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: `${buttonElement.padding.top}px ${buttonElement.padding.right}px ${buttonElement.padding.bottom}px ${buttonElement.padding.left}px`,
    },
    text: {
      color: buttonElement.color,
      fontSize: `${buttonElement.fontSize}px`,
      fontFamily: buttonElement.fontFamily,
      fontWeight: buttonElement.fontWeight,
      direction: buttonElement.direction || 'ltr',
      whiteSpace: 'nowrap' as const,
      userSelect: 'none' as const,
      textAlign: 'center' as const,
      lineHeight: '1',
      alignSelf: 'center',
    },
  };
};

export const getImageStyles = (imageElement: ImageElement, baseStyle: React.CSSProperties) => {
  const borderRadius = imageElement.cornerRadii
    ? `${imageElement.cornerRadii.topLeft}px ${imageElement.cornerRadii.topRight}px ${imageElement.cornerRadii.bottomRight}px ${imageElement.cornerRadii.bottomLeft}px`
    : imageElement.cornerRadius || 0;

  // Determine image source
  const imageSrc = imageElement.fillType === 'dynamic' && imageElement.fillImageUrl
    ? imageElement.fillImageUrl
    : imageElement.src;

  // Determine fill mode (same priority as shapes)
  const fillMode = imageElement.fillType === 'dynamic' 
    ? (imageElement.fillMode || 'cover')
    : (imageElement.fillMode || imageElement.objectFit || 'cover');

  // Use background image approach (same as shapes) for consistency
  const containerStyle: React.CSSProperties = {
    ...baseStyle,
    overflow: 'hidden',
    borderRadius,
    backgroundImage: `url(${imageSrc})`,
    backgroundPosition: 'center',
  };

  // Apply background sizing based on fill mode
  if (fillMode === 'tile') {
    containerStyle.backgroundRepeat = 'repeat';
    containerStyle.backgroundSize = 'auto';
  } else {
    containerStyle.backgroundRepeat = 'no-repeat';
    containerStyle.backgroundSize = 
      fillMode === 'cover' ? 'cover' :
      fillMode === 'contain' ? 'contain' :
      fillMode === 'stretch' || fillMode === 'fill' ? '100% 100%' :
      fillMode === 'center' || fillMode === 'none' ? 'auto' : 'cover';
  }

  return {
    container: containerStyle,
    imageSrc,
    fillMode,
  };
};

export const getShapeStyles = (shapeElement: ShapeElement, baseStyle: React.CSSProperties) => {
  const getBorderRadiusStyle = () => {
    if (shapeElement.cornerRadii) {
      return `${shapeElement.cornerRadii.topLeft}px ${shapeElement.cornerRadii.topRight}px ${shapeElement.cornerRadii.bottomRight}px ${shapeElement.cornerRadii.bottomLeft}px`;
    }
    return shapeElement.cornerRadius || 0;
  };

  const shapeBaseStyle: React.CSSProperties = {
    ...baseStyle,
    border: shapeElement.strokeWidth > 0
      ? `${shapeElement.strokeWidth}px solid ${shapeElement.strokeColor}`
      : undefined,
  };

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

  return {
    base: shapeBaseStyle,
    borderRadius: getBorderRadiusStyle(),
    shapeType: shapeElement.shapeType,
  };
};

export const renderTriangleSVG = (shapeElement: ShapeElement) => {
  return (
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
  );
};
