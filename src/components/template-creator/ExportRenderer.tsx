import React from 'react';
import { CanvasElement, TextElement, ImageElement, ButtonElement, ShapeElement, GroupElement } from '@/types/canvas';
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
                  top: '92%',
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

      case 'group': {
        const groupElement = element as GroupElement;
        
        // Check conditional display
        if (groupElement.conditionalDisplay?.enabled) {
          // For now, we'll render it - in a real export with product data,
          // this would check the actual condition
          // You would pass product data to ExportRenderer and evaluate here
        }
        
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              pointerEvents: 'auto',
            }}
          >
            {groupElement.children?.map((child) => {
              // Render child elements with offset positions
              const childBaseStyle: React.CSSProperties = {
                position: 'absolute',
                left: `${child.position.x}px`,
                top: `${child.position.y}px`,
                width: `${child.size.width}px`,
                height: `${child.size.height}px`,
                transform: `rotate(${child.rotation}deg)`,
                opacity: child.opacity / 100,
                zIndex: child.zIndex,
                pointerEvents: 'none',
              };

              // Render based on child type
              if (child.type === 'text') {
                const textChild = child as TextElement;
                
                // Handle dynamic content for rating widget text
                let textContent = textChild.content;
                if (groupElement.widgetType === 'rating' && textChild.isDynamic && textChild.dynamicField === 'rating' && groupElement.widgetData?.rating) {
                  textContent = groupElement.widgetData.rating.toFixed(1);
                }
                
                // Handle dynamic content for BNPL widget text
                if (groupElement.widgetType === 'bnpl' && textChild.isDynamic && groupElement.widgetData) {
                  const { price = 50, priceModifier = 4, currency = 'SAR', providers = [] } = groupElement.widgetData;
                  const modifiedPrice = (price / priceModifier).toFixed(1);
                  
                  if (providers.length === 1) {
                    textContent = `Pay ${currency} ${modifiedPrice} Now\n& Pay rest later`;
                  } else {
                    textContent = `Buy now with ${currency} ${modifiedPrice} & Pay rest later`;
                  }
                }
                
                // Update text color from widgetData if exists
                let displayColor = textChild.color;
                if (groupElement.widgetType === 'bnpl' && groupElement.widgetData?.textColor) {
                  displayColor = groupElement.widgetData.textColor;
                }
                if (groupElement.widgetType === 'rating' && textChild.isDynamic && textChild.dynamicField === 'rating' && groupElement.widgetData?.textColor) {
                  displayColor = groupElement.widgetData.textColor;
                }
                
                // Update fontSize from widgetData if exists
                let displayFontSize = textChild.fontSize;
                if (groupElement.widgetType === 'bnpl' && groupElement.widgetData?.fontSize) {
                  displayFontSize = groupElement.widgetData.fontSize;
                }
                
                const textStyles = {
                  ...getTextStyles({ ...textChild, color: displayColor, fontSize: displayFontSize, content: textContent }, childBaseStyle),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                };
                
                const renderExportTextDecoration = () => {
                  if (textChild.textDecoration === 'underline') {
                    return (
                      <span style={{
                        textDecoration: 'underline',
                        textDecorationColor: displayColor,
                        textDecorationThickness: '1.5px',
                        textUnderlineOffset: '2px',
                      }}>
                        {textContent}
                      </span>
                    );
                  } else if (textChild.textDecoration === 'line-through') {
                    return (
                      <span style={{ 
                        position: 'relative',
                        display: 'inline-block',
                      }}>
                        {textContent}
                        <span style={{
                          position: 'absolute',
                          left: '0',
                          right: '0',
                          top: '92%',
                          height: '2px',
                          backgroundColor: displayColor,
                          pointerEvents: 'none',
                        }} />
                      </span>
                    );
                  }
                  return <span>{textContent}</span>;
                };
                
                return (
                  <div key={child.id} style={textStyles}>
                    {renderExportTextDecoration()}
                  </div>
                );
              } else if (child.type === 'shape') {
                const shapeChild = child as ShapeElement;
                const shapeStyles = getShapeStyles(shapeChild, childBaseStyle);

                switch (shapeChild.shapeType) {
                  case 'star':
                    // Get rating from widget data
                    const widgetRating = groupElement.widgetData?.rating || 4.5;
                    const starIndex = parseInt(child.id.match(/star-(\d+)/)?.[1] || '0');
                    
                    // Calculate if this star should be filled, half-filled, or empty
                    const filledStars = Math.floor(widgetRating);
                    const hasHalfStar = widgetRating % 1 >= 0.5;
                    const isHalfStar = starIndex === filledStars && hasHalfStar;
                    const isFilled = starIndex < filledStars;
                    
                    // Get colors from widget data
                    const filledColor = groupElement.widgetData?.starFilledColor || '#E4A709';
                    const unfilledColor = groupElement.widgetData?.starUnfilledColor || '#D1D5DB';
                    
                    return (
                      <div
                        key={child.id}
                        style={{
                          ...childBaseStyle,
                          boxSizing: 'border-box',
                        }}
                      >
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                          <defs>
                            {isHalfStar && (
                              <linearGradient id={`half-fill-${child.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="50%" stopColor={filledColor} />
                                <stop offset="50%" stopColor={unfilledColor} />
                              </linearGradient>
                            )}
                          </defs>
                          <polygon 
                            points="50,10 61,40 95,40 68,60 79,90 50,70 21,90 32,60 5,40 39,40" 
                            fill={
                              isHalfStar 
                                ? `url(#half-fill-${child.id})` 
                                : isFilled 
                                  ? filledColor 
                                  : unfilledColor
                            }
                            stroke={shapeChild.strokeColor}
                            strokeWidth={shapeChild.strokeWidth}
                          />
                        </svg>
                      </div>
                    );

                  default:
                    return (
                      <div
                        key={child.id}
                        style={{
                          ...shapeStyles.base,
                          borderRadius: shapeStyles.borderRadius,
                          boxSizing: 'border-box',
                        }}
                      />
                    );
                }
              } else if (child.type === 'image') {
                const imageChild = child as ImageElement;
                const imageStyles = getImageStyles(imageChild, childBaseStyle);
                const borderRadius = imageChild.cornerRadii
                  ? `${imageChild.cornerRadii.topLeft}px ${imageChild.cornerRadii.topRight}px ${imageChild.cornerRadii.bottomRight}px ${imageChild.cornerRadii.bottomLeft}px`
                  : imageChild.cornerRadius || 0;
                
                const objectFit = 
                  imageStyles.fillMode === 'cover' ? 'cover' :
                  imageStyles.fillMode === 'contain' ? 'contain' :
                  imageStyles.fillMode === 'stretch' ? 'fill' :
                  imageStyles.fillMode === 'center' ? 'none' :
                  imageStyles.fillMode === 'tile' ? 'initial' :
                  'cover';

                return (
                  <div
                    key={child.id}
                    style={{
                      ...childBaseStyle,
                      overflow: 'hidden',
                      borderRadius,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={imageStyles.imageSrc}
                      alt={imageChild.alt || ''}
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
              }

              return null;
            })}
          </div>
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
