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
import { useCurrency } from '@/contexts/CurrencyContext';
import {
  processTemplatePlaceholders,
  formatDynamicValue,
  renderCurrencySymbol,
  renderTextWithCurrency,
  getDisplayText,
  stripCurrencySymbols,
} from './currencyHelpers';

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
  const { currencySymbol, currencySvgPath, isSvgSymbol } = useCurrency();
  
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
        
        // Check if this is a price field
        const isPriceField = textElement.isDynamic && 
          (textElement.dynamicField === 'price' || 
           textElement.dynamicField === 'sale_price' || 
           textElement.dynamicField === 'compare_at_price');
        
        let displayContent: string;
        let hasCurrencyPlaceholder = false;
        
        // Handle different text types
        if ((textElement as any).isTemplate && textElement.isDynamic) {
          // Template-based text like "Pay {currency}{price} in 4 installments"
          const result = processTemplatePlaceholders(textElement, currencySymbol, isSvgSymbol);
          displayContent = result.content;
          hasCurrencyPlaceholder = result.hasCurrencyPlaceholder;
        } else if (textElement.isDynamic && textElement.dynamicContent) {
          // Regular dynamic field
          const sourceValue = textElement.dynamicContent;
          displayContent = formatDynamicValue(textElement, sourceValue, currencySymbol, isSvgSymbol && isPriceField);
        } else {
          // Static text
          displayContent = textElement.content;
        }
        
        const currencyOptions = {
          currencySymbol,
          currencySvgPath,
          isSvgSymbol,
          textColor: textElement.color,
          fontSize: textElement.fontSize,
        };

        // Handle template text with inline currency
        if (hasCurrencyPlaceholder) {
          const contentNode = renderTextWithCurrency(displayContent, currencyOptions);
          
          return (
            <div key={element.id} style={{
              ...textStyles,
              display: 'flex',
              alignItems: 'center',
            }}>
              {renderTextDecoration(textElement, contentNode as any)}
            </div>
          );
        }
        
        // Handle price fields with prefix currency symbol
        const showPrefixSymbol = isPriceField && isSvgSymbol && currencySvgPath;
        const finalText = showPrefixSymbol ? stripCurrencySymbols(displayContent) : displayContent;
        
        return (
          <div key={element.id} style={{
            ...textStyles,
            display: 'flex',
            alignItems: 'center',
            gap: showPrefixSymbol ? '4px' : '0',
          }}>
            {showPrefixSymbol && renderCurrencySymbol(currencyOptions)}
            {renderTextDecoration(textElement, finalText)}
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{
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
        
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              pointerEvents: 'none',
            }}
          >
            {groupElement.children
              .sort((a, b) => a.zIndex - b.zIndex)
              .map(child => {
                // Render child elements with adjusted positioning (relative to group)
                return renderElement({
                  ...child,
                  position: {
                    x: child.position.x,
                    y: child.position.y,
                  },
                  zIndex: child.zIndex,
                } as CanvasElement);
              })}
          </div>
        );
      }

      default:
        return null;
    }
  };

  const backgroundStyle: React.CSSProperties = {
    overflow: 'hidden',
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
      id="export-canvas"
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
