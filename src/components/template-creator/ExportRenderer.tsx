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

// Helper to fetch and parse SVG content
const fetchSvgContent = async (svgPath: string): Promise<string | null> => {
  try {
    const response = await fetch(svgPath);
    if (!response.ok) return null;
    return await response.text();
  } catch (error) {
    console.error('[ExportRenderer] Failed to fetch SVG:', error);
    return null;
  }
};

// Helper to apply fill color to SVG content
const applySvgFill = (svgContent: string, fillColor: string): string => {
  // Replace fill attributes in path, circle, rect, polygon elements
  let modifiedSvg = svgContent
    .replace(/fill="[^"]*"/g, `fill="${fillColor}"`)
    .replace(/fill='[^']*'/g, `fill='${fillColor}'`);
  
  // If no fill attribute exists, add it to the SVG tag
  if (!modifiedSvg.includes('fill=')) {
    modifiedSvg = modifiedSvg.replace(/<svg/, `<svg fill="${fillColor}"`);
  }
  
  return modifiedSvg;
};

// Component to render inline SVG with dynamic color
const InlineSvgSymbol: React.FC<{
  svgPath: string;
  color: string;
  size: number;
  style?: React.CSSProperties;
}> = ({ svgPath, color, size, style }) => {
  const [svgContent, setSvgContent] = React.useState<string>('');
  
  React.useEffect(() => {
    fetchSvgContent(svgPath).then(content => {
      if (content) {
        const coloredSvg = applySvgFill(content, color);
        // Add width/height and viewBox attributes to ensure proper sizing
        const svgWithSize = coloredSvg
          .replace(/<svg/, `<svg width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet"`);
        setSvgContent(svgWithSize);
      }
    });
  }, [svgPath, color, size]);
  
  if (!svgContent) return null;
  
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
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
          const totalVerticalPadding = textElement.padding.top + textElement.padding.bottom;
          const centerPadding = totalVerticalPadding / 2;
          
          adjustedTextStyles.paddingTop = `${centerPadding}px`;
          adjustedTextStyles.paddingBottom = `${centerPadding}px`;
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
            currencySymbolSize: textElement.currencySymbolSize,
            fontSize: textElement.fontSize,
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
            // Use custom currency symbol size or default (80% of font size)
            const sizeMultiplier = textElement.currencySymbolSize ?? 0.8;
            const symbolSize = textElement.fontSize * sizeMultiplier;
            
            console.log('[ExportRenderer] SVG Symbol Size Calculation:', {
              fontSize: textElement.fontSize,
              currencySymbolSize: textElement.currencySymbolSize,
              sizeMultiplier,
              calculatedSize: symbolSize,
              color: textElement.color,
            });
            
            return (
              <div 
                key={element.id} 
                style={{
                  ...adjustedTextStyles,
                  display: 'flex',
                  alignItems: 'flex-start',
                  paddingTop: '15%',
                  justifyContent: textElement.textAlign === 'center' ? 'center' : textElement.textAlign === 'right' ? 'flex-end' : 'flex-start',
                  whiteSpace: 'nowrap',
                }}
              >
                {renderTextDecoration(
                  textElement,
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                    {parts[0]}
                    <InlineSvgSymbol
                      svgPath={currencySvgPath}
                      color={textElement.color}
                      size={symbolSize}
                      style={{
                        marginLeft: '2px',
                        marginRight: '2px',
                        flexShrink: 0,
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
                display: isPriceField ? 'flex' : 'block',
                alignItems: isPriceField ? 'flex-start' : undefined,
                paddingTop: isPriceField ? '15%' : undefined,
                justifyContent: isPriceField 
                  ? (textElement.textAlign === 'center' ? 'center' : textElement.textAlign === 'right' ? 'flex-end' : 'flex-start')
                  : undefined,
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
          
          // Use custom currency symbol size or default (80% of font size)
          const sizeMultiplier = textElement.currencySymbolSize ?? 0.8;
          const symbolSize = textElement.fontSize * sizeMultiplier;
          
          console.log('[ExportRenderer] Prefix Symbol Size Calculation:', {
            fontSize: textElement.fontSize,
            currencySymbolSize: textElement.currencySymbolSize,
            sizeMultiplier,
            calculatedSize: symbolSize,
            displayType,
          });
          
          return (
            <div 
              key={element.id} 
              style={{
                ...adjustedTextStyles,
                display: 'flex',
                alignItems: 'flex-start',
                paddingTop: '15%',
                justifyContent: textElement.textAlign === 'center' ? 'center' : textElement.textAlign === 'right' ? 'flex-end' : 'flex-start',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                {displayType === 'symbol' && isSvgSymbol && currencySvgPath && (
                  <InlineSvgSymbol
                    svgPath={currencySvgPath}
                    color={textElement.color}
                    size={symbolSize}
                    style={{
                      marginRight: '3px',
                      flexShrink: 0,
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
