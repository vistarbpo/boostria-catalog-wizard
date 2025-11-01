import React from 'react';
import { TextElement } from '@/types/canvas';
import { CurrencySvgIcon } from './CurrencySvgIcon';

/**
 * Currency helper utilities for consistent currency rendering across canvas and export
 */

export interface CurrencyRenderOptions {
  currencySymbol: string;
  currencySvgPath?: string;
  isSvgSymbol: boolean;
  textColor: string;
  fontSize: number;
}

/**
 * Strip all currency symbols from a string
 */
export const stripCurrencySymbols = (text: string): string => {
  return text.replace(/[$€£¥₹﷼]/g, '').trim();
};

/**
 * Format dynamic text value with modifiers and formatting
 */
export const formatDynamicValue = (
  element: TextElement,
  sourceValue: string,
  currencySymbol: string,
  skipCurrencyPrefix: boolean = false,
  displayType: 'code' | 'symbol' = 'symbol',
  currencyCode?: string
): string => {
  // Strip any existing currency symbols first
  const cleanedSource = stripCurrencySymbols(sourceValue);
  const cleanedText = cleanedSource.replace(/[^0-9.-]/g, '');
  let value = parseFloat(cleanedText) || 0;

  // Apply modifiers
  if (element.modifiers) {
    element.modifiers.forEach(mod => {
      switch (mod.type) {
        case 'divide':
          if (typeof mod.value === 'number' && mod.value !== 0) {
            value = value / mod.value;
          }
          break;
        case 'multiply':
          value = value * (mod.value || 1);
          break;
        case 'add':
          value = value + (mod.value || 0);
          break;
        case 'subtract':
          value = value - (mod.value || 0);
          break;
        case 'decimals':
          value = parseFloat(value.toFixed(mod.value || 2));
          break;
      }
    });
  }

  // Apply formatting
  let formattedValue = value.toString();
  if (element.formatting) {
    const fmt = element.formatting;
    formattedValue = value.toFixed(fmt.decimals ?? 2);

    if (fmt.thousandsSeparator) {
      formattedValue = parseFloat(formattedValue).toLocaleString('en-US', {
        minimumFractionDigits: fmt.decimals ?? 2,
        maximumFractionDigits: fmt.decimals ?? 2,
      });
    }

    // Add currency or prefix/suffix
    const isPriceField = element.dynamicField === 'price' || 
                        element.dynamicField === 'sale_price' || 
                        element.dynamicField === 'compare_at_price';
    
    if (isPriceField && !skipCurrencyPrefix) {
      // Use code or symbol based on displayType
      const prefix = displayType === 'code' ? (currencyCode || 'USD') + ' ' : currencySymbol;
      formattedValue = prefix + formattedValue;
    } else if (!isPriceField) {
      if (fmt.prefix) formattedValue = fmt.prefix + formattedValue;
      if (fmt.suffix) formattedValue = formattedValue + fmt.suffix;
    }
  }

  return formattedValue;
};

/**
 * Process template-based text with placeholders like "Pay {currency}{price} in 4 installments"
 */
export const processTemplatePlaceholders = (
  element: TextElement,
  currencySymbol: string,
  isSvgSymbol: boolean,
  displayType: 'code' | 'symbol' = 'symbol',
  currencyCode?: string
): { content: string; hasCurrencyPlaceholder: boolean } => {
  if (!(element as any).isTemplate || !element.isDynamic || !element.dynamicField) {
    return { content: element.content, hasCurrencyPlaceholder: false };
  }

  const sourceValue = element.dynamicContent || element.content;
  
  // Skip currency prefix when formatting since we handle {currency} separately
  const formattedValue = formatDynamicValue(element, sourceValue, currencySymbol, true, displayType, currencyCode);
  
  // Replace {field} placeholder
  let content = element.content.replace(`{${element.dynamicField}}`, formattedValue);
  
  // Replace {currency} placeholder
  const hasCurrencyPlaceholder = content.includes('{currency}');
  if (hasCurrencyPlaceholder) {
    // Use code or symbol based on displayType
    if (displayType === 'code') {
      content = content.replace('{currency}', currencyCode || 'USD');
    } else {
      // Use special marker for SVG symbols, otherwise use the symbol
      content = content.replace('{currency}', isSvgSymbol ? '[CURRENCY_SVG]' : currencySymbol);
    }
  }
  
  return { content, hasCurrencyPlaceholder };
};

/**
 * Render currency symbol (SVG or text) with proper styling
 */
export const renderCurrencySymbol = (
  options: CurrencyRenderOptions,
  position: 'before' | 'inline' = 'before'
): React.ReactNode => {
  const { isSvgSymbol, currencySvgPath, currencySymbol, fontSize, textColor } = options;
  
  if (!isSvgSymbol || !currencySvgPath) {
    return position === 'inline' ? currencySymbol : null;
  }

  const size = fontSize * 0.8;
  const marginLeft = position === 'inline' ? '2px' : '0';
  const marginRight = position === 'inline' ? '2px' : '4px';

  return (
    <CurrencySvgIcon
      svgPath={currencySvgPath}
      color={textColor}
      size={size}
      marginLeft={marginLeft}
      marginRight={marginRight}
      ariaLabel={currencySymbol}
    />
  );
};

/**
 * Render text content with inline currency symbols
 */
export const renderTextWithCurrency = (
  content: string,
  options: CurrencyRenderOptions
): React.ReactNode => {
  const { isSvgSymbol, currencySvgPath } = options;
  
  if (!content.includes('[CURRENCY_SVG]')) {
    return content;
  }

  if (!isSvgSymbol || !currencySvgPath) {
    return content.replace('[CURRENCY_SVG]', options.currencySymbol);
  }

  const parts = content.split('[CURRENCY_SVG]');
  
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
      {parts[0]}
      {renderCurrencySymbol(options, 'inline')}
      {parts[1]}
    </span>
  );
};

/**
 * Get display text without currency symbol for rendering
 */
export const getDisplayText = (
  content: string,
  currencySymbol: string,
  showSvgSymbol: boolean
): string => {
  if (!showSvgSymbol) {
    return content;
  }
  
  // Remove currency symbol if we're showing it as SVG
  return stripCurrencySymbols(content);
};
