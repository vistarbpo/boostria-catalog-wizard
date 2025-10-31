import React from 'react';
import { TextElement } from '@/types/canvas';
import { getTextStyles, renderTextDecoration } from './renderUtils';
import {
  processTemplatePlaceholders,
  formatDynamicValue,
  renderCurrencySymbol,
  renderTextWithCurrency,
  stripCurrencySymbols,
  CurrencyRenderOptions,
} from './currencyHelpers';

interface TextRendererProps {
  element: TextElement;
  baseStyle: React.CSSProperties;
  currencyOptions: CurrencyRenderOptions;
}

/**
 * Unified text renderer used by both CanvasElement and ExportRenderer
 * Ensures 100% consistency between preview and export
 */
export const TextRenderer: React.FC<TextRendererProps> = ({
  element,
  baseStyle,
  currencyOptions,
}) => {
  const { currencySymbol, currencySvgPath, isSvgSymbol } = currencyOptions;
  const textStyles = getTextStyles(element, baseStyle);
  
  // Check if this is a price field
  const isPriceField = element.isDynamic && 
    (element.dynamicField === 'price' || 
     element.dynamicField === 'sale_price' || 
     element.dynamicField === 'compare_at_price');
  
  let displayContent: string;
  let hasCurrencyPlaceholder = false;
  
  // Handle different text types
  if ((element as any).isTemplate && element.isDynamic) {
    // Template-based text like "Pay {currency}{price} in 4 installments"
    const result = processTemplatePlaceholders(element, currencySymbol, isSvgSymbol);
    displayContent = result.content;
    hasCurrencyPlaceholder = result.hasCurrencyPlaceholder;
  } else if (element.isDynamic && element.dynamicContent) {
    // Regular dynamic field
    const sourceValue = element.dynamicContent;
    displayContent = formatDynamicValue(element, sourceValue, currencySymbol, isSvgSymbol && isPriceField);
  } else {
    // Static text
    displayContent = element.content;
  }

  // Handle template text with inline currency
  if (hasCurrencyPlaceholder) {
    const contentNode = renderTextWithCurrency(displayContent, currencyOptions);
    
    return (
      <div style={textStyles}>
        {renderTextDecoration(element, contentNode as any)}
      </div>
    );
  }
  
  // Handle price fields with prefix currency symbol
  const showPrefixSymbol = isPriceField && isSvgSymbol && currencySvgPath;
  const finalText = showPrefixSymbol ? stripCurrencySymbols(displayContent) : displayContent;
  
  if (showPrefixSymbol) {
    return (
      <div style={textStyles}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          {renderCurrencySymbol(currencyOptions)}
          {renderTextDecoration(element, finalText)}
        </span>
      </div>
    );
  }
  
  return (
    <div style={textStyles}>
      {renderTextDecoration(element, finalText)}
    </div>
  );
};
