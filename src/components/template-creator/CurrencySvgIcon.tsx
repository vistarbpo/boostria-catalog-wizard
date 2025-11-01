import React from 'react';

interface CurrencySvgIconProps {
  svgPath: string;
  color: string;
  size: number;
  marginLeft?: string;
  marginRight?: string;
  ariaLabel: string;
}

/**
 * Check if a color is light (simple heuristic)
 */
function isLightColor(color: string): boolean {
  // Check for common light color keywords
  if (color.match(/white|#fff|#ffffff|rgb\(255,\s*255,\s*255\)/i)) {
    return true;
  }
  
  // Check hex colors
  const hex = color.replace('#', '');
  if (hex.length === 3 || hex.length === 6) {
    const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substr(0, 2), 16);
    const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substr(2, 2), 16);
    const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  }
  
  // Check rgb/rgba colors
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  }
  
  return false;
}

/**
 * Component to render SVG currency icons with dynamic coloring
 * Uses CSS filters to match the text color
 */
export const CurrencySvgIcon: React.FC<CurrencySvgIconProps> = ({
  svgPath,
  color,
  size,
  marginLeft = '0',
  marginRight = '4px',
  ariaLabel,
}) => {
  const isLight = isLightColor(color);
  
  // For light colors, invert the black SVG to white
  // For dark colors, keep the SVG black
  const filter = isLight ? 'invert(1) brightness(2)' : 'none';
  
  return (
    <img
      src={svgPath}
      alt={ariaLabel}
      style={{
        display: 'inline-block',
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
        marginLeft,
        marginRight,
        objectFit: 'contain',
        filter,
        verticalAlign: 'baseline',
      }}
      aria-label={ariaLabel}
    />
  );
};

