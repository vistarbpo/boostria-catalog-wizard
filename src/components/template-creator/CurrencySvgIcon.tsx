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
  const [isReady, setIsReady] = useState(false);
  
  // Preload the SVG and add delay to ensure mask applies before showing
  React.useEffect(() => {
    const img = new Image();
    img.onload = () => {
      // Wait for next frame to ensure mask is applied
      requestAnimationFrame(() => {
        setTimeout(() => setIsReady(true), 50);
      });
    };
    img.onerror = () => setImageError(true);
    img.src = svgPath;
  }, [svgPath]);
  
  // Fallback to text symbol if image fails to load
  if (imageError) {
    return <span style={{ marginLeft, marginRight, color }}>{ariaLabel}</span>;
  }
  
  // For export/html2canvas, use filter method (more compatible)
  if (useFilter) {
    const getColorFilter = (targetColor: string): string => {
      // Normalize color for checking
      const normalizedColor = targetColor.toLowerCase().replace(/\s/g, '');
      
      // Extract RGB values from various formats
      const extractRGB = (colorStr: string): { r: number; g: number; b: number } | null => {
        // Try rgb() format
        const rgbMatch = colorStr.match(/rgb\((\d+),(\d+),(\d+)\)/);
        if (rgbMatch) {
          return { r: parseInt(rgbMatch[1]), g: parseInt(rgbMatch[2]), b: parseInt(rgbMatch[3]) };
        }
        
        // Try hex format
        const hexMatch = colorStr.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/);
        if (hexMatch) {
          return { 
            r: parseInt(hexMatch[1], 16), 
            g: parseInt(hexMatch[2], 16), 
            b: parseInt(hexMatch[3], 16) 
          };
        }
        
        return null;
      };
      
      const rgb = extractRGB(normalizedColor);
      
      // Check if it's a light color (white or near-white)
      const isLightColor = 
        normalizedColor.includes('white') || 
        normalizedColor.includes('#fff') || 
        normalizedColor === '#ffffff' ||
        normalizedColor.includes('255,255,255') ||
        normalizedColor.includes('rgb(255,255,255)') ||
        normalizedColor.includes('hsl(0,0%,100%)') ||
        (rgb && rgb.r > 240 && rgb.g > 240 && rgb.b > 240);
      
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
        normalizedColor.includes('hsl(0,0%,0%)') ||
        normalizedColor.includes('0,0,0') ||
        (rgb && rgb.r < 15 && rgb.g < 15 && rgb.b < 15);
      
      if (isBlackColor) {
        return 'brightness(0)';
      }
      
      // Check if it's a red color (for sale prices)
      const isRedColor = normalizedColor.includes('#ef4444') || 
                        normalizedColor.includes('#dc2626') ||
                        normalizedColor.includes('239,68,68') ||
                        normalizedColor.includes('220,38,38') ||
                        normalizedColor.includes('red') ||
                        (rgb && rgb.r > 200 && rgb.g < 100 && rgb.b < 100);
      
      if (isRedColor) {
        // Convert black SVG to red
        return 'brightness(0) saturate(100%) invert(27%) sepia(98%) saturate(7426%) hue-rotate(358deg) brightness(95%) contrast(111%)';
      }
      
      // Check if it's a gray color (for strikethrough prices)
      const isGrayColor = normalizedColor.includes('#999') || 
                         normalizedColor.includes('#9ca3af') ||
                         normalizedColor.includes('#6b7280') ||
                         normalizedColor.includes('153,153,153') ||
                         normalizedColor.includes('156,163,175') ||
                         normalizedColor.includes('107,114,128') ||
                         (rgb && Math.abs(rgb.r - rgb.g) < 20 && Math.abs(rgb.g - rgb.b) < 20 && rgb.r > 100 && rgb.r < 180);
      
      if (isGrayColor) {
        // For gray, make it black then reduce brightness
        return 'brightness(0) saturate(0) brightness(0.6)';
      }
      
      // For any other dark color, keep the SVG black
      return 'brightness(0)';
    };
    
    return (
      <img
        src={svgPath}
        alt={ariaLabel}
        crossOrigin="anonymous"
        onError={() => setImageError(true)}
        style={{
          display: 'inline-block',
          width: `${size}px`,
          height: `${size}px`,
          flexShrink: 0,
          marginLeft,
          marginRight,
          verticalAlign: 'middle',
          filter: getColorFilter(color),
          objectFit: 'contain',
          transform: 'translateY(-0.5px)',
        }}
        aria-label={ariaLabel}
      />
    );
  }
  
  // For preview, use CSS mask (perfect color matching)
  // Only show once SVG is fully ready to prevent rectangle flash
  if (!isReady) {
    return (
      <span
        style={{
          display: 'inline-block',
          width: `${size}px`,
          height: `${size}px`,
          flexShrink: 0,
          marginLeft,
          marginRight,
          verticalAlign: 'middle',
          opacity: 0,
        }}
        aria-label={ariaLabel}
        role="img"
      />
    );
  }
  
  return (
    <span
      style={{
        display: 'inline-block',
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
        marginLeft,
        marginRight,
        verticalAlign: 'middle',
        backgroundColor: color,
        maskImage: `url(${svgPath})`,
        WebkitMaskImage: `url(${svgPath})`,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        transform: 'translateY(-0.5px)',
      }}
      aria-label={ariaLabel}
      role="img"
    />
  );
};

