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
      // Normalize color for checking
      const normalizedColor = targetColor.toLowerCase().replace(/\s/g, '');
      
      // Check if it's a light color (white or near-white)
      const isLightColor = 
        normalizedColor.includes('white') || 
        normalizedColor.includes('#fff') || 
        normalizedColor === '#ffffff' ||
        normalizedColor.includes('255,255,255') ||
        normalizedColor.includes('rgb(255,255,255)') ||
        normalizedColor.includes('hsl(0,0%,100%)');
      
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
        normalizedColor.includes('hsl(0,0%,0%)');
      
      if (isBlackColor) {
        return 'brightness(0)';
      }
      
      // Check if it's a red color (for sale prices)
      const isRedColor = normalizedColor.includes('#ef4444') || 
                        normalizedColor.includes('#dc2626') ||
                        normalizedColor.includes('239,68,68') ||
                        normalizedColor.includes('220,38,38') ||
                        normalizedColor.includes('red');
      
      if (isRedColor) {
        // Convert black SVG to red: brightness(0) makes it black, then sepia + hue-rotate to red
        return 'brightness(0) saturate(100%) invert(27%) sepia(98%) saturate(7426%) hue-rotate(358deg) brightness(95%) contrast(111%)';
      }
      
      // Check if it's a gray color (for strikethrough prices)
      const isGrayColor = normalizedColor.includes('#999') || 
                         normalizedColor.includes('#9ca3af') ||
                         normalizedColor.includes('#6b7280') ||
                         normalizedColor.includes('153,153,153') ||
                         normalizedColor.includes('156,163,175') ||
                         normalizedColor.includes('107,114,128');
      
      if (isGrayColor) {
        // For gray, make it black then reduce brightness
        return 'brightness(0) saturate(0) brightness(0.6)';
      }
      
      // For currentColor or other dark colors, keep the SVG black
      return 'brightness(0)';
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

