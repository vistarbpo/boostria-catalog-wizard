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
 * Uses CSS mask for perfect color matching with text
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
  
  // Fallback to text symbol if image fails to load
  if (imageError) {
    return <span style={{ marginLeft, marginRight, color }}>{ariaLabel}</span>;
  }
  
  // Use the SVG as a mask and apply the color directly
  // This ensures perfect color matching regardless of the text color
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

