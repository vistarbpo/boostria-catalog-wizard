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

// Helper function to fetch and convert SVG to data URL with proper fill color
const convertSvgToColoredDataUrl = async (svgUrl: string, color: string): Promise<string> => {
  try {
    const response = await fetch(svgUrl);
    let svgText = await response.text();
    
    // Add fill color to the SVG
    // Insert fill attribute into path, g, or svg elements
    svgText = svgText.replace(/<path\s/g, `<path fill="${color}" `);
    svgText = svgText.replace(/<circle\s/g, `<circle fill="${color}" `);
    svgText = svgText.replace(/<rect\s/g, `<rect fill="${color}" `);
    svgText = svgText.replace(/<polygon\s/g, `<polygon fill="${color}" `);
    
    // Convert to base64
    const base64 = btoa(unescape(encodeURIComponent(svgText)));
    return `data:image/svg+xml;base64,${base64}`;
  } catch (err) {
    console.error('[Export] Failed to convert SVG:', err);
    return svgUrl; // Fallback to original URL
  }
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
  const [coloredSvgCache, setColoredSvgCache] = React.useState<Map<string, string>>(new Map());
  
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
  
  // Helper to get colored SVG data URL (with caching)
  const getColoredSvg = React.useCallback(async (color: string): Promise<string> => {
    if (!currencySvgPath) return '';
    
    const cacheKey = `${currencySvgPath}-${color}`;
    if (coloredSvgCache.has(cacheKey)) {
      return coloredSvgCache.get(cacheKey)!;
    }
    
    const dataUrl = await convertSvgToColoredDataUrl(currencySvgPath, color);
    setColoredSvgCache(new Map(coloredSvgCache.set(cacheKey, dataUrl)));
    return dataUrl;
  }, [currencySvgPath, coloredSvgCache]);
  
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
          
          // For export, render SVG symbols directly as images with proper coloring
          if (isSvgSymbol && currencySvgPath) {
            const parts = displayContent.split('[CURRENCY_SVG]');
            // Smaller SVG size (60% of font size)
            const symbolSize = textElement.fontSize * 0.6;
            
            console.log('[ExportRenderer] Rendering SVG with inline color:', textElement.color);
            
            // Create a component that fetches and renders colored SVG
            const ColoredSvgSymbol = () => {
              const [svgDataUrl, setSvgDataUrl] = React.useState<string>('');
              
              React.useEffect(() => {
                getColoredSvg(textElement.color).then(setSvgDataUrl);
              }, []);
              
              if (!svgDataUrl) return null;
              
              return (
                <img
                  src={svgDataUrl}
                  alt="Currency"
                  onLoad={() => console.log('[ExportRenderer] Colored SVG loaded')}
                  onError={(e) => console.error('[ExportRenderer] Colored SVG failed:', e)}
                  style={{
                    display: 'inline-block',
                    width: `${symbolSize}px`,
                    height: `${symbolSize}px`,
                    marginLeft: '2px',
                    marginRight: '2px',
                    objectFit: 'contain',
                    flexShrink: 0,
                  }}
                />
              );
            };
            
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
                {renderTextDecoration(
                  textElement,
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0' }}>
                    {parts[0]}
                    <ColoredSvgSymbol />
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
          
          // Create colored SVG component
          const PrefixSvgSymbol = () => {
            const [svgDataUrl, setSvgDataUrl] = React.useState<string>('');
            
            React.useEffect(() => {
              if (displayType === 'symbol' && isSvgSymbol && currencySvgPath) {
                getColoredSvg(textElement.color).then(setSvgDataUrl);
              }
            }, []);
            
            if (!svgDataUrl) return null;
            
            return (
              <img
                src={svgDataUrl}
                alt={currencySymbol}
                style={{
                  display: 'inline-block',
                  width: `${symbolSize}px`,
                  height: `${symbolSize}px`,
                  marginRight: '3px',
                  objectFit: 'contain',
                  flexShrink: 0,
                }}
              />
            );
          };
          
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
              <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '0' }}>
                {displayType === 'symbol' && isSvgSymbol && currencySvgPath && <PrefixSvgSymbol />}
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
