import { CanvasElement, GroupElement, ShapeElement, TextElement } from "@/types/canvas";

export interface RatingWidgetConfig {
  position: { x: number; y: number };
  starFilledColor?: string;
  starUnfilledColor?: string;
  textColor?: string;
  fontSize?: number;
  rating?: number;
  showRatingText?: boolean;
  conditionalThreshold?: number;
}

export function createRatingWidget(config: RatingWidgetConfig): GroupElement {
  const {
    position,
    starFilledColor = '#E4A709',
    starUnfilledColor = '#D1D5DB',
    textColor = '#000000',
    fontSize = 16,
    rating = 4.5,
    showRatingText = true,
    conditionalThreshold = 0
  } = config;

  const starSize = 24;
  const starSpacing = 4;
  const textMarginLeft = 8;
  const totalStars = 5;
  
  // Calculate filled stars
  const filledStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  const children: CanvasElement[] = [];
  let currentX = 0;

  // Create 5 star shapes
  for (let i = 0; i < totalStars; i++) {
    const isFilled = i < filledStars || (i === filledStars && hasHalfStar);
    
    const star: ShapeElement = {
      id: `star-${i}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'shape',
      shapeType: 'star',
      position: { x: currentX, y: 0 },
      size: { width: starSize, height: starSize },
      fillColor: isFilled ? starFilledColor : starUnfilledColor,
      fillType: 'solid',
      strokeWidth: 0,
      rotation: 0,
      opacity: 100,
      visible: true,
      locked: false,
      zIndex: 0
    };

    children.push(star);
    currentX += starSize + starSpacing;
  }

  // Add rating text
  if (showRatingText) {
    const ratingText: TextElement = {
      id: `rating-text-${Math.random().toString(36).substr(2, 9)}`,
      type: 'text',
      content: rating.toFixed(1),
      position: { x: currentX + textMarginLeft, y: (starSize - fontSize) / 2 },
      size: { width: 50, height: starSize },
      fontSize: fontSize,
      fontFamily: 'Inter',
      fontWeight: '600',
      color: textColor,
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
      isDynamic: true,
      dynamicField: 'rating'
    };

    children.push(ratingText);
  }

  // Calculate total widget size
  const totalWidth = currentX + (showRatingText ? textMarginLeft + 50 : 0);
  const totalHeight = starSize;

  const group: GroupElement = {
    id: `rating-widget-${Math.random().toString(36).substr(2, 9)}`,
    type: 'group',
    name: 'Rating Widget',
    position: position,
    size: { width: totalWidth, height: totalHeight },
    rotation: 0,
    opacity: 100,
    visible: true,
    locked: false,
    zIndex: 0,
    children: children,
    widgetType: 'rating',
    widgetData: {
      starFilledColor,
      starUnfilledColor,
      textColor,
      rating
    },
    conditionalDisplay: conditionalThreshold > 0 ? {
      enabled: true,
      field: 'rating',
      operator: 'greater_than',
      value: conditionalThreshold
    } : undefined
  };

  return group;
}
