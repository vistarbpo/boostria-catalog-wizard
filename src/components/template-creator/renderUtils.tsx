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
  const hasDecoration = textElement.textDecoration && textElement.textDecoration !== 'none';
  
  return (
    <span style={{
      position: 'relative',
      display: 'inline-block',
    }}>
      {content}
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
      lineHeight: '1',
      display: 'block',
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

  let objectFit: React.CSSProperties['objectFit'] = imageElement.objectFit || 'cover';

  if (imageElement.fillType === 'dynamic' && imageElement.fillImageUrl && imageElement.fillMode) {
    objectFit =
      imageElement.fillMode === 'cover' ? 'cover' :
      imageElement.fillMode === 'contain' ? 'contain' :
      imageElement.fillMode === 'stretch' ? 'fill' :
      imageElement.fillMode === 'center' ? 'none' :
      'cover';
  }

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
