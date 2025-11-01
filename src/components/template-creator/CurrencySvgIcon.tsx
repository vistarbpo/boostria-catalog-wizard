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
 * Component to render SVG currency icons with dynamic coloring
 * Uses CSS mask to properly color the icon to match text color
 */
export const CurrencySvgIcon: React.FC<CurrencySvgIconProps> = ({
  svgPath,
  color = 'currentColor',
  size = 16,
  marginLeft = '0',
  marginRight = '4px',
  ariaLabel = 'Currency',
}) => {
  return (
    <span
      style={{
        display: 'inline-block',
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
        marginLeft,
        marginRight,
        backgroundColor: color,
        WebkitMask: `url(${svgPath}) center/contain no-repeat`,
        mask: `url(${svgPath}) center/contain no-repeat`,
        verticalAlign: 'baseline',
      }}
      aria-label={ariaLabel}
      role="img"
    />
  );
};

