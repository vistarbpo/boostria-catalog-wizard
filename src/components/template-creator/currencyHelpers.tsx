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
 * Strip all currency symbols from a string (including Arabic ones)
 */
export const stripCurrencySymbols = (text: string): string => {
  // Strip common currency symbols AND Arabic currency symbols
  // Use proper escaping for dots in د.إ and other Arabic symbols
  return text.replace(/[$€£¥₹﷼₪₺]|د\.إ|ر\.ق|د\.ك|د\.ب|ر\.ع\.|د\.ا|ل\.ل|د\.م\./g, '').trim();
};

/**
 * Apply modifiers to a numeric value
 */
const applyModifiers = (value: number, modifiers: any[]): number => {
  let result = value;
  modifiers.forEach(mod => {
    switch (mod.type) {
      case 'divide':
        if (typeof mod.value === 'number' && mod.value !== 0) {
          result = result / mod.value;
        }
        break;
      case 'multiply':
        result = result * (mod.value || 1);
        break;
      case 'add':
        result = result + (mod.value || 0);
        break;
      case 'subtract':
        result = result - (mod.value || 0);
        break;
      case 'decimals':
        result = parseFloat(result.toFixed(mod.value || 2));
        break;
    }
  });
  return result;
};

/**
 * Apply text modifiers (case transformations)
 */
const applyTextModifiers = (text: string, modifiers: any[]): string => {
  let result = text;
  modifiers.forEach(mod => {
    switch (mod.type) {
      case 'uppercase':
        result = result.toUpperCase();
        break;
      case 'lowercase':
        result = result.toLowerCase();
        break;
      case 'titlecase':
        result = result.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        break;
    }
  });
  return result;
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

  // Apply numeric modifiers
  if (element.modifiers) {
    value = applyModifiers(value, element.modifiers);
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
      // Use code or symbol based on displayType - ALWAYS use global currency settings
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
 * Unified text formatting function - handles all dynamic text scenarios
 * This is the SINGLE SOURCE OF TRUTH for text formatting
 */
export const formatTextWithCurrency = (
  element: TextElement,
  parentGroup: any | undefined,
  currencySymbol: string,
  isSvgCurrency: boolean,
  displayType: 'code' | 'symbol',
  currencyCode: string
): string => {
  // Handle rating widget text
  if (parentGroup?.widgetType === 'rating' && element.isDynamic && element.dynamicField === 'rating' && parentGroup.widgetData?.rating) {
    return parentGroup.widgetData.rating.toFixed(1);
  }
  
  // Handle template-based dynamic text with placeholders
  if ((element as any).isTemplate && element.isDynamic) {
    const result = processTemplatePlaceholders(
      element, 
      currencySymbol, 
      isSvgCurrency,
      displayType,
      currencyCode
    );
    return result.content;
  }
  
  // Regular dynamic content (non-template)
  let content = element.isDynamic ? (element.dynamicContent || element.content) : element.content;
  
  // If not dynamic, return as is
  if (!element.isDynamic) {
    return content;
  }

  // Apply text modifiers (case transformations)
  if (element.modifiers) {
    content = applyTextModifiers(content, element.modifiers);
  }

  // If no numeric modifiers or formatting, return the content
  const hasNumericFormatting = element.modifiers?.some(m => 
    ['divide', 'multiply', 'add', 'subtract', 'decimals', 'numerical'].includes(m.type)
  ) || element.formatting;

  if (!hasNumericFormatting) {
    return content;
  }

  // Check if content is numeric
  const cleanedText = content.replace(/[^0-9.-]/g, '');
  if (!cleanedText || isNaN(parseFloat(cleanedText))) {
    return content;
  }

  let value = parseFloat(cleanedText);

  // Apply numeric modifiers
  if (element.modifiers) {
    element.modifiers.forEach(mod => {
      switch (mod.type) {
        case 'numerical':
          // Already handled by cleanedText
          break;
        case 'add':
          value = value + (mod.value || 0);
          break;
        case 'subtract':
          value = value - (mod.value || 0);
          break;
        case 'multiply':
          value = value * (mod.value || 1);
          break;
        case 'divide':
          if (typeof mod.value === 'number' && mod.value !== 0) {
            value = value / mod.value;
          }
          break;
        case 'decimals':
          value = parseFloat(value.toFixed(mod.value || 2));
          break;
      }
    });
  }

  // Apply formatting
  if (element.formatting) {
    const fmt = element.formatting;
    let formatted = value.toFixed(fmt.decimals ?? 2);
    
    if (fmt.thousandsSeparator) {
      formatted = parseFloat(formatted).toLocaleString('en-US', {
        minimumFractionDigits: fmt.decimals ?? 2,
        maximumFractionDigits: fmt.decimals ?? 2,
      });
    }
    
    // Check if this is a price field
    const isPriceField = element.dynamicField === 'price' || 
                        element.dynamicField === 'sale_price' || 
                        element.dynamicField === 'compare_at_price';
    
    if (isPriceField) {
      // For price fields, ALWAYS use global currency settings (never use local prefix)
      const currencyPrefix = displayType === 'code' ? currencyCode + ' ' : currencySymbol;
      formatted = currencyPrefix + formatted;
    } else {
      // For non-price fields, use local formatting
      if (fmt.prefix) formatted = fmt.prefix + formatted;
      if (fmt.suffix) formatted = formatted + fmt.suffix;
    }
    
    return formatted;
  }

  return value.toString();
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
  position: 'before' | 'inline' = 'before',
  useFilter: boolean = false
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
      useFilter={useFilter}
    />
  );
};

/**
 * Render text content with inline currency symbols
 */
export const renderTextWithCurrency = (
  content: string,
  options: CurrencyRenderOptions,
  useFilter: boolean = false
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
      {renderCurrencySymbol(options, 'inline', useFilter)}
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
