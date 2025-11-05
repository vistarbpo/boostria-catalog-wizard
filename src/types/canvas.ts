export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface BaseElement {
  id: string;
  type: string;
  position: Position;
  size: Size;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  aspectRatioLocked?: boolean; // Lock aspect ratio during resize
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  direction?: 'ltr' | 'rtl';
  letterSpacing: number;
  lineHeight: number;
  autoSize: boolean;
  textWrapping: boolean;
  backgroundColor?: string;
  strokeColor?: string;
  strokeWidth: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  // Text decoration
  textDecoration?: 'none' | 'underline' | 'line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  // Dynamic content properties
  isDynamic?: boolean;
  dynamicField?: string; // Field name from product data like 'title', 'price', etc.
  dynamicContent?: string; // Resolved content when isDynamic is true
  isTemplate?: boolean; // Whether to use placeholder replacement like "Pay {price} in 4 installments"
  fallbackField?: string; // Fallback field if dynamicField is empty
  // Currency symbol size control (for price fields with SVG symbols)
  currencySymbolSize?: number; // Multiplier for currency symbol size (0.1 to 2.0, default 0.8)
  conditionalDisplay?: {
    dependsOn?: string; // Field name to check
    hideIfEmpty?: boolean; // Hide if the dependsOn field is empty
    hideIfEqual?: string; // Hide if dynamicField equals this field
  };
  // Formatting and modifiers
  formatting?: {
    prefix?: string;
    suffix?: string;
    decimals?: number;
    thousandsSeparator?: boolean;
    currencySymbol?: string;
  };
  modifiers?: Array<{
    id: string;
    type: 'uppercase' | 'lowercase' | 'titlecase' | 'numerical' | 'add' | 'subtract' | 'multiply' | 'divide' | 'decimals';
    value?: number;
  }>;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'star' | 'heart' | 'polygon' | 'plus' | 'arrow' | 'diamond' | 'line';
  fillColor: string;
  fillType: 'solid' | 'image';
  fillSource?: string; // For dynamic fills like 'image_link', 'additional_image_link', etc.
  fillImageUrl?: string; // Resolved image URL when fillType is 'image'
  fillMode?: 'cover' | 'contain' | 'stretch' | 'center' | 'tile'; // How the image fills the shape
  strokeColor?: string;
  strokeWidth: number;
  cornerRadius?: number; // Legacy single radius (will be used as fallback)
  cornerRadii?: {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  };
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  alt?: string;
  objectFit: 'contain' | 'cover' | 'fill';
  cornerRadius?: number;
  cornerRadii?: {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  };
  // Dynamic fill properties
  fillType?: 'original' | 'dynamic';
  fillSource?: string; // For dynamic fills like 'image_link', 'additional_image_link', etc.
  fillImageUrl?: string; // Resolved image URL when fillType is 'dynamic'
  fillMode?: 'cover' | 'contain' | 'stretch' | 'center' | 'tile';
}

export interface SVGElement extends BaseElement {
  type: 'svg';
  svgContent: string;
  preserveAspectRatio?: string;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  // Dynamic fill properties
  fillType?: 'color' | 'image';
  fillSource?: string; // For dynamic fills like 'image_link', 'additional_image_link', etc.
  fillImageUrl?: string; // Resolved image URL when fillType is 'image'
  fillMode?: 'cover' | 'contain' | 'stretch' | 'center' | 'tile';
}

export interface ButtonElement extends BaseElement {
  type: 'button';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  backgroundColor: string;
  textAlign: 'left' | 'center' | 'right';
  direction?: 'ltr' | 'rtl';
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  cornerRadius?: number;
  cornerRadii?: {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  };
  borderColor?: string;
  borderWidth: number;
}

export interface GroupElement extends BaseElement {
  type: 'group';
  name?: string;
  children: CanvasElement[];
  // Conditional display settings
  conditionalDisplay?: {
    enabled: boolean;
    field: string; // e.g., 'rating'
    operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
    value: number | string;
  };
  // Widget-specific metadata
  widgetType?: 'rating' | 'custom';
  widgetData?: {
    starFilledColor?: string;
    starUnfilledColor?: string;
    textColor?: string;
    rating?: number;
  };
}

export interface MediaSource {
  id: string;
  name: string;
  type: 'image' | 'video';
  url?: string; // For manual uploads
  isFromFeed: boolean;
}

export type CanvasElement = TextElement | ShapeElement | ImageElement | SVGElement | ButtonElement | GroupElement;

export interface CanvasState {
  elements: CanvasElement[];
  selectedElementIds: string[];
  canvasSize: {
    width: number;
    height: number;
  };
  zoom: number;
  panOffset: Position;
  backgroundColor: string;
  backgroundType: 'solid' | 'image';
  backgroundImageUrl?: string;
  backgroundMode?: 'cover' | 'contain' | 'stretch' | 'center' | 'tile';
}