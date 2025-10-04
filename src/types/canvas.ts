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
  // Dynamic content properties
  isDynamic?: boolean;
  dynamicField?: string; // Field name from product data like 'title', 'price', etc.
  dynamicContent?: string; // Resolved content when isDynamic is true
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
    type: 'add' | 'subtract' | 'multiply' | 'divide' | 'decimals';
    value: number;
  }>;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'star' | 'heart' | 'polygon' | 'plus' | 'arrow' | 'diamond';
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

export interface GroupElement extends BaseElement {
  type: 'group';
  name?: string;
  children: CanvasElement[];
}

export interface MediaSource {
  id: string;
  name: string;
  type: 'image' | 'video';
  url?: string; // For manual uploads
  isFromFeed: boolean;
}

export type CanvasElement = TextElement | ShapeElement | ImageElement | SVGElement | GroupElement;

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