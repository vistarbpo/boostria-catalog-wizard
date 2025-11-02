import React, { useState } from 'react';

interface CurrencySvgIconProps {
  svgPath: string;
  color: string;
  size: number;
  marginLeft?: string;
  marginRight?: string;
  ariaLabel: string;
}

/**
 * Component to render SVG currency icons with dynamic coloring
 * Uses inline image with CSS filter for proper color rendering
 */
export const CurrencySvgIcon: React.FC<CurrencySvgIconProps> = ({
  svgPath,
  color = 'currentColor',
  size = 16,
  marginLeft = '0',
  marginRight = '4px',
  ariaLabel = 'Currency',
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Convert color to filter values for accurate color matching
  // For black SVGs, we need to colorize them to match the text color
  const getColorFilter = (targetColor: string): string => {
    // For currentColor, inherit from parent - invert to white for proper contrast
    if (targetColor === 'currentColor') {
      return 'brightness(0) invert(1)';
    }
    
    // Check if it's a light color (white or near-white)
    const isLightColor = 
      targetColor.includes('white') || 
      targetColor.includes('#fff') || 
      targetColor.includes('255, 255, 255') ||
      targetColor.includes('255,255,255') ||
      targetColor === '#FFFFFF' ||
      targetColor === 'rgb(255, 255, 255)';
    
    // For white or light colors, invert the black SVG to white
    if (isLightColor) {
      return 'brightness(0) invert(1)';
    }
    
    // For dark colors, keep the SVG black  
    return 'none';
  };
  
  // Fallback to text symbol if image fails to load
  if (imageError) {
    return <span style={{ marginLeft, marginRight }}>{ariaLabel}</span>;
  }
  
  return (
    <img
      key={svgPath} // Force re-render when path changes
      src={svgPath}
      alt={ariaLabel}
      onError={() => setImageError(true)}
      style={{
        display: 'inline-block',
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
        marginLeft,
        marginRight,
        verticalAlign: 'baseline',
        filter: getColorFilter(color),
        objectFit: 'contain',
      }}
      aria-label={ariaLabel}
      loading="eager"
    />
  );
};

