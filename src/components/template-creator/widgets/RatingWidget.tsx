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

export function createRatingWidget(config: RatingWidgetConfig): CanvasElement[] {
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

  const starChildren: CanvasElement[] = [];
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

    starChildren.push(star);
    currentX += starSize + starSpacing;
  }

  const starsWidth = currentX - starSpacing;

  // Create stars group
  const starsGroup: GroupElement = {
    id: `rating-stars-${Math.random().toString(36).substr(2, 9)}`,
    type: 'group',
    name: 'Rating Stars',
    position: position,
    size: { width: starsWidth, height: starSize },
    rotation: 0,
    opacity: 100,
    visible: true,
    locked: false,
    zIndex: 0,
    children: starChildren,
    widgetType: 'rating',
    widgetData: {
      starFilledColor,
      starUnfilledColor,
      rating
    },
    conditionalDisplay: conditionalThreshold > 0 ? {
      enabled: true,
      field: 'rating',
      operator: 'greater_than',
      value: conditionalThreshold
    } : undefined
  };

  const elements: CanvasElement[] = [starsGroup];

  // Add rating text as separate element
  if (showRatingText) {
    const ratingText: TextElement = {
      id: `rating-text-${Math.random().toString(36).substr(2, 9)}`,
      type: 'text',
      content: rating.toFixed(1),
      position: { x: position.x + starsWidth + textMarginLeft, y: position.y + (starSize - fontSize) / 2 },
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

    elements.push(ratingText);
  }

  return elements;
}
