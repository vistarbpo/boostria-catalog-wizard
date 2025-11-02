import React, { useState } from 'react';

interface CurrencySvgIconProps {
  svgPath: string;
  color: string;
  size: number;
  marginLeft?: string;
  marginRight?: string;
  ariaLabel: string;
  useFilter?: boolean; // For html2canvas compatibility
}

/**
 * Component to render SVG currency icons with dynamic coloring
 * Uses CSS mask by default, but can use filter for html2canvas export
 */
export const CurrencySvgIcon: React.FC<CurrencySvgIconProps> = ({
  svgPath,
  color = 'currentColor',
  size = 16,
  marginLeft = '0',
  marginRight = '4px',
  ariaLabel = 'Currency',
  useFilter = false,
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Fallback to text symbol if image fails to load
  if (imageError) {
    return <span style={{ marginLeft, marginRight, color }}>{ariaLabel}</span>;
  }
  
  // For export/html2canvas, use filter method (more compatible)
  if (useFilter) {
    const getColorFilter = (targetColor: string): string => {
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
    
    return (
      <img
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
      />
    );
  }
  
  // For preview, use CSS mask (perfect color matching)
  return (
    <span
      style={{
        display: 'inline-block',
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
        marginLeft,
        marginRight,
        verticalAlign: 'baseline',
        backgroundColor: color,
        maskImage: `url(${svgPath})`,
        WebkitMaskImage: `url(${svgPath})`,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
      aria-label={ariaLabel}
      role="img"
    />
  );
};

