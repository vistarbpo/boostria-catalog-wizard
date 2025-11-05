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
  // Currency props (passed directly to avoid context initialization issues during export)
  currencySymbol?: string;
  currencySvgPath?: string;
  isSvgSymbol?: boolean;
  displayType?: 'code' | 'symbol';
  currencyCode?: string;
}

// Helper function to convert color to CSS filter for SVG recoloring
// Using robust version from CurrencySvgIcon for accurate color matching
const getColorFilter = (targetColor: string): string => {
  // Normalize color for checking
  const normalizedColor = targetColor.toLowerCase().replace(/\s/g, '');
  
  // Extract RGB values from various formats
  const extractRGB = (colorStr: string): { r: number; g: number; b: number } | null => {
    // Try rgb() format
    const rgbMatch = colorStr.match(/rgb\((\d+),(\d+),(\d+)\)/);
    if (rgbMatch) {
      return { r: parseInt(rgbMatch[1]), g: parseInt(rgbMatch[2]), b: parseInt(rgbMatch[3]) };
    }
    
    // Try hex format
    const hexMatch = colorStr.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/);
    if (hexMatch) {
      return { 
        r: parseInt(hexMatch[1], 16), 
        g: parseInt(hexMatch[2], 16), 
        b: parseInt(hexMatch[3], 16) 
      };
    }
    
    return null;
  };
  
  const rgb = extractRGB(normalizedColor);
  
  // Check if it's a light color (white or near-white)
  const isLightColor = 
    normalizedColor.includes('white') || 
    normalizedColor.includes('#fff') || 
    normalizedColor === '#ffffff' ||
    normalizedColor.includes('255,255,255') ||
    normalizedColor.includes('rgb(255,255,255)') ||
    normalizedColor.includes('hsl(0,0%,100%)') ||
    (rgb && rgb.r > 240 && rgb.g > 240 && rgb.b > 240);
  
  // For white or light colors, invert the black SVG to white
  if (isLightColor) {
    return 'brightness(0) invert(1)';
  }
  
  // Check if it's black or very dark
  const isBlackColor = 
    normalizedColor.includes('black') ||
    normalizedColor.includes('#000') ||
    normalizedColor === '#000000' ||
    normalizedColor.includes('rgb(0,0,0)') ||
    normalizedColor.includes('hsl(0,0%,0%)') ||
    normalizedColor.includes('0,0,0') ||
    (rgb && rgb.r < 15 && rgb.g < 15 && rgb.b < 15);
  
  if (isBlackColor) {
    return 'brightness(0)';
  }
  
  // Check if it's a red color (for sale prices)
  const isRedColor = normalizedColor.includes('#ef4444') || 
                    normalizedColor.includes('#dc2626') ||
                    normalizedColor.includes('239,68,68') ||
                    normalizedColor.includes('220,38,38') ||
                    normalizedColor.includes('red') ||
                    (rgb && rgb.r > 200 && rgb.g < 100 && rgb.b < 100);
  
  if (isRedColor) {
    // Convert black SVG to red
    return 'brightness(0) saturate(100%) invert(27%) sepia(98%) saturate(7426%) hue-rotate(358deg) brightness(95%) contrast(111%)';
  }
  
  // Check if it's a gray color (for strikethrough prices)
  const isGrayColor = normalizedColor.includes('#999') || 
                     normalizedColor.includes('#9ca3af') ||
                     normalizedColor.includes('#6b7280') ||
                     normalizedColor.includes('153,153,153') ||
                     normalizedColor.includes('156,163,175') ||
                     normalizedColor.includes('107,114,128') ||
                     (rgb && Math.abs(rgb.r - rgb.g) < 20 && Math.abs(rgb.g - rgb.b) < 20 && rgb.r > 100 && rgb.r < 180);
  
  if (isGrayColor) {
    // For gray, make it black then reduce brightness
    return 'brightness(0) saturate(0) brightness(0.6)';
  }
  
  // For any other dark color, keep the SVG black
  return 'brightness(0)';
};

export const ExportRenderer: React.FC<ExportRendererProps> = ({
  elements,
  canvasWidth,
  canvasHeight,
  backgroundColor,
  backgroundType,
  backgroundImageUrl,
  backgroundMode,
  currencySymbol: propCurrencySymbol,
  currencySvgPath: propCurrencySvgPath,
  isSvgSymbol: propIsSvgSymbol,
  displayType: propDisplayType,
  currencyCode: propCurrencyCode,
}) => {
  // Try to use context if available, otherwise use props
  let contextValues;
  try {
    contextValues = useCurrency();
  } catch {
    // Context not available (e.g., during export), use defaults
    contextValues = {
      currencySymbol: '$',
      currencySvgPath: undefined,
      isSvgSymbol: false,
      displayType: 'symbol' as const,
      currencyCode: 'USD',
    };
  }
  
  // Prefer props over context for export scenarios
  const currencySymbol = propCurrencySymbol ?? contextValues.currencySymbol;
  const currencySvgPath = propCurrencySvgPath ?? contextValues.currencySvgPath;
  const isSvgSymbol = propIsSvgSymbol ?? contextValues.isSvgSymbol;
  const displayType = propDisplayType ?? contextValues.displayType;
  const currencyCode = propCurrencyCode ?? contextValues.currencyCode;
  
  // Debug: Log currency values during export
  console.log('[ExportRenderer] Currency config:', {
    currencySymbol,
    currencySvgPath,
    isSvgSymbol,
    displayType,
    currencyCode,
    hasValidSvgPath: !!currencySvgPath,
    svgPathType: currencySvgPath ? (currencySvgPath.startsWith('http') ? 'absolute' : 'relative') : 'none',
  });
  
  // Log when rendering price fields
  const priceFields = elements.filter(el => 
    el.type === 'text' && 
    (el as any).isDynamic && 
    ((el as any).dynamicField === 'price' || 
     (el as any).dynamicField === 'sale_price' || 
     (el as any).dynamicField === 'compare_at_price')
  );
  console.log('[ExportRenderer] Found price fields:', priceFields.length);
  if (isSvgSymbol && currencySvgPath) {
    console.log('[ExportRenderer] Will render SVG currency symbols for price fields');
  }
  
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
        if (isPriceField && textElement.backgroundColor) {
          // For price fields with backgrounds, ensure vertical centering
          // by balancing top and bottom padding
          const verticalPadding = Math.max(textElement.padding.top, textElement.padding.bottom);
          adjustedTextStyles.paddingTop = `${verticalPadding}px`;
          adjustedTextStyles.paddingBottom = `${verticalPadding}px`;
          adjustedTextStyles.lineHeight = '1';
          adjustedTextStyles.display = 'flex';
          adjustedTextStyles.alignItems = 'center';
        }
        
        // Use unified formatting function
        const displayContent = formatTextWithCurrency(textElement, undefined, currencySymbol, isSvgSymbol, displayType, currencyCode);
        const hasCurrencyPlaceholder = displayContent.includes('[CURRENCY_SVG]');
        
        // Debug logging for price fields
        if (isPriceField) {
          console.log('[ExportRenderer] Price field rendering:', {
            elementId: element.id,
            dynamicField: textElement.dynamicField,
            displayContent,
            hasCurrencyPlaceholder,
            isSvgSymbol,
            currencySvgPath: !!currencySvgPath,
            displayType,
          });
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
          console.log('[ExportRenderer] Rendering currency placeholder:', {
            hasSvgPath: !!currencySvgPath,
            svgPath: currencySvgPath,
            parts: displayContent.split('[CURRENCY_SVG]'),
          });
          
          // For export, render SVG symbols directly as images
          if (isSvgSymbol && currencySvgPath) {
            const parts = displayContent.split('[CURRENCY_SVG]');
            // Smaller SVG size (60% of font size)
            const symbolSize = textElement.fontSize * 0.6;
            
            console.log('[ExportRenderer] Rendering SVG img with size:', symbolSize, 'filter:', getColorFilter(textElement.color));
            
            return (
              <div 
                key={element.id} 
                style={{
                  ...adjustedTextStyles,
                  display: 'inline-flex',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {renderTextDecoration(
                  textElement,
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0' }}>
                    {parts[0]}
                    <img
                      src={currencySvgPath}
                      alt="Currency"
                      crossOrigin="anonymous"
                      onLoad={(e) => {
                        console.log('[ExportRenderer] SVG loaded successfully');
                        // Force filter application
                        e.currentTarget.style.filter = getColorFilter(textElement.color);
                      }}
                      onError={(e) => console.error('[ExportRenderer] SVG failed to load:', e)}
                      style={{
                        display: 'inline-block',
                        width: `${symbolSize}px`,
                        height: `${symbolSize}px`,
                        marginLeft: '2px',
                        marginRight: '2px',
                        verticalAlign: 'middle',
                        filter: getColorFilter(textElement.color),
                        objectFit: 'contain',
                        flexShrink: 0,
                        transform: 'translateY(6px)',
                        visibility: 'visible',
                        opacity: 1,
                        imageRendering: 'crisp-edges',
                      }}
                    />
                    {parts[1]}
                  </span>,
                  true
                )}
              </div>
            );
          }
          
          // Fallback to text symbol
          console.log('[ExportRenderer] Falling back to text symbol');
          const contentNode = displayContent.replace('[CURRENCY_SVG]', currencySymbol);
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
        
        // Handle price fields with prefix currency symbol
        // For SVG symbols in symbol mode OR code in code mode, handle separately
        const needsSeparateSymbol = isPriceField && (
          (displayType === 'symbol' && isSvgSymbol && !!currencySvgPath) ||
          displayType === 'code'
        );
        
        if (needsSeparateSymbol) {
          // Strip all currency symbols/codes from the formatted text
          let cleanText = stripCurrencySymbols(displayContent);
          if (displayType === 'code') {
            // Also strip currency codes like "SAR ", "USD ", etc.
            cleanText = cleanText.replace(/^[A-Z]{3}\s+/, '');
          }
          
          // Smaller SVG size (60% of font size instead of 80%)
          const symbolSize = textElement.fontSize * 0.6;
          
          return (
            <div 
              key={element.id} 
              style={{
                ...adjustedTextStyles,
                display: 'inline-flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0' }}>
                {displayType === 'symbol' && isSvgSymbol && currencySvgPath && (
                  <img
                    src={currencySvgPath}
                    alt={currencySymbol}
                    crossOrigin="anonymous"
                    onLoad={(e) => {
                      // Force filter application on load
                      e.currentTarget.style.filter = getColorFilter(textElement.color);
                    }}
                    style={{
                      display: 'inline-block',
                      width: `${symbolSize}px`,
                      height: `${symbolSize}px`,
                      marginRight: '3px',
                      verticalAlign: 'middle',
                      filter: getColorFilter(textElement.color),
                      objectFit: 'contain',
                      flexShrink: 0,
                      transform: 'translateY(6px)',
                      imageRendering: 'crisp-edges',
                    }}
                  />
                )}
                {displayType === 'code' && <span style={{ color: textElement.color }}>{currencyCode} </span>}
                {renderTextDecoration(textElement, cleanText, true)}
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
            {renderTextDecoration(textElement, displayContent, true)}
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
