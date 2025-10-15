import React from 'react';
import { TextElement, ButtonElement, ImageElement, ShapeElement } from '@/types/canvas';

/**
 * Shared rendering utilities to ensure 100% consistency between preview and export
 */

export const getTextStyles = (textElement: TextElement, baseStyle: React.CSSProperties) => {
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
    whiteSpace: textElement.textWrapping ? 'normal' : 'nowrap',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: textElement.textAlign === 'center' ? 'center' : textElement.textAlign === 'right' ? 'flex-end' : 'flex-start',
    boxSizing: 'border-box' as const,
  };
};

export const renderTextDecoration = (textElement: TextElement, content: string) => {
  const decorationStyle: React.CSSProperties = {};
  
  if (textElement.textDecoration === 'underline') {
    decorationStyle.textDecoration = 'underline';
    decorationStyle.textDecorationColor = textElement.color;
    decorationStyle.textDecorationThickness = '1.5px';
    decorationStyle.textUnderlineOffset = '2px';
  } else if (textElement.textDecoration === 'line-through') {
    decorationStyle.textDecoration = 'line-through';
    decorationStyle.textDecorationColor = textElement.color;
    decorationStyle.textDecorationThickness = '1.5px';
  }
  
  return (
    <span style={decorationStyle}>
      {content}
    </span>
  );
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
    },
  };
};

export const getImageStyles = (imageElement: ImageElement, baseStyle: React.CSSProperties) => {
  const borderRadius = imageElement.cornerRadii
    ? `${imageElement.cornerRadii.topLeft}px ${imageElement.cornerRadii.topRight}px ${imageElement.cornerRadii.bottomRight}px ${imageElement.cornerRadii.bottomLeft}px`
    : imageElement.cornerRadius || 0;

  const imageSrc = imageElement.fillType === 'dynamic' && imageElement.fillImageUrl
    ? imageElement.fillImageUrl
    : imageElement.src;

  // Determine objectFit - prioritize dynamic fillMode if set, otherwise use objectFit property or default to 'cover'
  let objectFit: React.CSSProperties['objectFit'] = 'cover';
  
  if (imageElement.fillType === 'dynamic' && imageElement.fillImageUrl && imageElement.fillMode) {
    // Dynamic image with fillMode specified
    objectFit =
      imageElement.fillMode === 'cover' ? 'cover' :
      imageElement.fillMode === 'contain' ? 'contain' :
      imageElement.fillMode === 'stretch' ? 'fill' :
      imageElement.fillMode === 'center' ? 'none' :
      'cover';
  } else if (imageElement.objectFit) {
    // Use explicitly set objectFit
    objectFit = imageElement.objectFit;
  }
  // Otherwise defaults to 'cover'

  return {
    container: {
      ...baseStyle,
      overflow: 'hidden',
      borderRadius,
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit,
      display: 'block',
    },
    imageSrc,
    isTile: imageElement.fillType === 'dynamic' && imageElement.fillMode === 'tile',
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
