import React from 'react';
import { CanvasElement, TextElement, ImageElement, ButtonElement, ShapeElement, GroupElement } from '@/types/canvas';
import {
  getTextStyles,
  renderTextDecoration,
  getButtonStyles,
  getImageStyles,
  getShapeStyles,
  renderTriangleSVG,
  renderStarSVG,
} from './renderUtils';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
  formatTextWithCurrency,
  renderCurrencySymbol,
  renderTextWithCurrency,
  processTemplatePlaceholders,
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
  const { currencySymbol, currencySvgPath, isSvgSymbol, displayType, currencyCode } = useCurrency();
  
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
        
        // Check if this is a price field
        const isPriceField = textElement.isDynamic && 
          (textElement.dynamicField === 'price' || 
           textElement.dynamicField === 'sale_price' || 
           textElement.dynamicField === 'compare_at_price');
        
        const textStyles = getTextStyles(textElement, baseStyle, displayType, isPriceField);
        
        // Add vertical alignment adjustments for price fields
        let adjustedTextStyles: React.CSSProperties = { ...textStyles };
        if (isPriceField) {
          // Move text up by reducing top padding/position
          adjustedTextStyles.paddingTop = 0;
          adjustedTextStyles.lineHeight = 1;
          adjustedTextStyles.display = 'flex';
          adjustedTextStyles.alignItems = 'flex-start';
        }
        
        // Use unified formatting function
        const displayContent = formatTextWithCurrency(textElement, undefined, currencySymbol, isSvgSymbol, displayType, currencyCode);
        const hasCurrencyPlaceholder = displayContent.includes('[CURRENCY_SVG]');
        
        const currencyOptions = {
          currencySymbol,
          currencySvgPath,
          isSvgSymbol,
          textColor: textElement.color,
          fontSize: textElement.fontSize,
        };

        // Handle template text with inline currency
        if (hasCurrencyPlaceholder) {
          const contentNode = renderTextWithCurrency(displayContent, currencyOptions, true);
          
          return (
            <div 
              key={element.id} 
              style={{
                ...adjustedTextStyles,
                display: isPriceField ? 'inline-flex' : 'block',
                alignItems: isPriceField ? 'flex-start' : 'center',
                whiteSpace: isPriceField ? 'nowrap' : 'normal',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              {renderTextDecoration(textElement, contentNode, true)}
            </div>
          );
        }
        
        // Handle price fields with prefix currency symbol (only for symbol mode)
        const showPrefixSymbol = isPriceField && displayType === 'symbol' && isSvgSymbol && currencySvgPath;
        const finalText = showPrefixSymbol ? stripCurrencySymbols(displayContent) : displayContent;
        
        if (showPrefixSymbol) {
          return (
            <div 
              key={element.id} 
              style={{
                ...adjustedTextStyles,
                display: 'inline-flex',
                alignItems: 'flex-start',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '4px' }}>
                {renderCurrencySymbol(currencyOptions, 'before', true)}
                {renderTextDecoration(textElement, finalText, true)}
              </span>
            </div>
          );
        }
        
        return (
          <div 
            key={element.id} 
            style={{
              ...adjustedTextStyles,
              display: 'block',
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {renderTextDecoration(textElement, finalText, true)}
          </div>
        );
      }

      case 'image': {
        const imageElement = element as ImageElement;
        const imageStyles = getImageStyles(imageElement, baseStyle);
        const borderRadius = imageElement.cornerRadii
          ? `${imageElement.cornerRadii.topLeft}px ${imageElement.cornerRadii.topRight}px ${imageElement.cornerRadii.bottomRight}px ${imageElement.cornerRadii.bottomLeft}px`
          : imageElement.cornerRadius || 0;
        
        // Determine object-fit based on fillMode from imageElement directly
        const fillMode = imageElement.fillMode || 'cover';
        const objectFit = 
          fillMode === 'cover' ? 'cover' :
          fillMode === 'contain' ? 'contain' :
          fillMode === 'stretch' ? 'fill' :
          'none'; // center and tile use 'none'
        
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
            return (
              <div
                key={element.id}
                style={{
                  ...baseStyle,
                  boxSizing: 'border-box',
                }}
              >
                {renderStarSVG(shapeElement)}
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
