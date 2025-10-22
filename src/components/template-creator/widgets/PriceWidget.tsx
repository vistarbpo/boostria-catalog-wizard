import { CanvasElement, GroupElement, TextElement } from "@/types/canvas";

export type PriceWidgetStyle = 
  | 'stacked-large-small'  // Large sale price on top, small strikethrough below
  | 'stacked-small-large'  // Small strikethrough on top, large sale price below  
  | 'side-by-side'         // Prices side by side horizontally
  | 'badge-style';         // Sale price in colored background/badge

export interface PriceWidgetConfig {
  position: { x: number; y: number };
  style?: PriceWidgetStyle;
  salePriceColor?: string;
  originalPriceColor?: string;
  salePriceFontSize?: number;
  originalPriceFontSize?: number;
  salePriceFontWeight?: string;
  originalPriceFontWeight?: string;
  fontFamily?: string;
  currencySymbol?: string;
  showOriginalPrice?: boolean;
  backgroundColor?: string; // For badge-style
  padding?: number; // For badge-style
  spacing?: number; // Gap between prices
}

export function createPriceWidget(config: PriceWidgetConfig): CanvasElement[] {
  const {
    position,
    style = 'stacked-small-large',
    salePriceColor = '#000000',
    originalPriceColor = '#999999',
    salePriceFontSize = 48,
    originalPriceFontSize = 24,
    salePriceFontWeight = '700',
    originalPriceFontWeight = '400',
    fontFamily = 'Inter',
    currencySymbol = '$',
    showOriginalPrice = true,
    backgroundColor,
    padding = 12,
    spacing = 8
  } = config;

  const elements: CanvasElement[] = [];

  // Calculate positions based on style
  let salePricePos = { ...position };
  let originalPricePos = { ...position };
  
  const estimatedSalePriceWidth = salePriceFontSize * 3.5; // Rough estimate
  const estimatedOriginalPriceWidth = originalPriceFontSize * 3.5;

  switch (style) {
    case 'stacked-large-small':
      // Large sale price on top, small original below
      salePricePos = { x: position.x, y: position.y };
      originalPricePos = { 
        x: position.x, 
        y: position.y + salePriceFontSize + spacing 
      };
      break;
      
    case 'stacked-small-large':
      // Small original on top, large sale below
      originalPricePos = { x: position.x, y: position.y };
      salePricePos = { 
        x: position.x, 
        y: position.y + originalPriceFontSize + spacing 
      };
      break;
      
    case 'side-by-side':
      // Prices side by side
      originalPricePos = { x: position.x, y: position.y };
      salePricePos = { 
        x: position.x + estimatedOriginalPriceWidth + spacing * 2, 
        y: position.y 
      };
      break;
      
    case 'badge-style':
      // Sale price with background, original above
      originalPricePos = { x: position.x, y: position.y };
      salePricePos = { 
        x: position.x, 
        y: position.y + originalPriceFontSize + spacing 
      };
      break;
  }

  // Create original price text (with strikethrough)
  if (showOriginalPrice) {
    const originalPriceText: TextElement = {
      id: `price-original-${Math.random().toString(36).substr(2, 9)}`,
      type: 'text',
      content: `${currencySymbol}48.00`,
      position: originalPricePos,
      size: { width: estimatedOriginalPriceWidth, height: originalPriceFontSize + 4 },
      fontSize: originalPriceFontSize,
      fontFamily: fontFamily,
      fontWeight: originalPriceFontWeight,
      color: originalPriceColor,
      textAlign: 'left',
      letterSpacing: 0,
      lineHeight: 1.2,
      autoSize: true,
      textWrapping: false,
      strokeWidth: 0,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      rotation: 0,
      opacity: 100,
      visible: true,
      locked: false,
      zIndex: 0,
      textDecoration: 'line-through',
      isDynamic: true,
      dynamicField: 'price',
      formatting: {
        prefix: currencySymbol,
        decimals: 2
      }
    };

    elements.push(originalPriceText);
  }

  // Create sale price text
  const salePriceText: TextElement = {
    id: `price-sale-${Math.random().toString(36).substr(2, 9)}`,
    type: 'text',
    content: `${currencySymbol}28.80`,
    position: salePricePos,
    size: { width: estimatedSalePriceWidth, height: salePriceFontSize + 4 },
    fontSize: salePriceFontSize,
    fontFamily: fontFamily,
    fontWeight: salePriceFontWeight,
    color: salePriceColor,
    textAlign: 'left',
    letterSpacing: 0,
    lineHeight: 1.2,
    autoSize: true,
    textWrapping: false,
    strokeWidth: 0,
    padding: style === 'badge-style' && backgroundColor ? { 
      top: padding, 
      right: padding * 2, 
      bottom: padding, 
      left: padding * 2 
    } : { top: 0, right: 0, bottom: 0, left: 0 },
    rotation: 0,
    opacity: 100,
    visible: true,
    locked: false,
    zIndex: 0,
    backgroundColor: style === 'badge-style' ? backgroundColor : undefined,
    isDynamic: true,
    dynamicField: 'sale_price',
    formatting: {
      prefix: currencySymbol,
      decimals: 2
    }
  };

  elements.push(salePriceText);

  return elements;
}

// Preset configurations for different styles
export const priceWidgetPresets = {
  default: {
    style: 'stacked-small-large' as PriceWidgetStyle,
    salePriceColor: '#000000',
    originalPriceColor: '#999999',
    salePriceFontSize: 48,
    originalPriceFontSize: 24,
    salePriceFontWeight: '700',
    originalPriceFontWeight: '400',
    fontFamily: 'Inter',
    currencySymbol: '$',
    showOriginalPrice: true,
    spacing: 8
  },
  largeBold: {
    style: 'stacked-large-small' as PriceWidgetStyle,
    salePriceColor: '#000000',
    originalPriceColor: '#D1D5DB',
    salePriceFontSize: 56,
    originalPriceFontSize: 28,
    salePriceFontWeight: '800',
    originalPriceFontWeight: '400',
    fontFamily: 'Inter',
    currencySymbol: '$',
    showOriginalPrice: true,
    spacing: 4
  },
  redBadge: {
    style: 'badge-style' as PriceWidgetStyle,
    salePriceColor: '#FFFFFF',
    originalPriceColor: '#DC2626',
    salePriceFontSize: 42,
    originalPriceFontSize: 20,
    salePriceFontWeight: '700',
    originalPriceFontWeight: '600',
    fontFamily: 'Inter',
    currencySymbol: '$',
    showOriginalPrice: true,
    backgroundColor: '#DC2626',
    padding: 12,
    spacing: 8
  },
  sideBySide: {
    style: 'side-by-side' as PriceWidgetStyle,
    salePriceColor: '#000000',
    originalPriceColor: '#9CA3AF',
    salePriceFontSize: 36,
    originalPriceFontSize: 28,
    salePriceFontWeight: '700',
    originalPriceFontWeight: '400',
    fontFamily: 'Inter',
    currencySymbol: '$',
    showOriginalPrice: true,
    spacing: 12
  }
};
