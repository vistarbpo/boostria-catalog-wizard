import { CanvasElement, GroupElement, TextElement, ImageElement } from "@/types/canvas";

export type BNPLProvider = 'tabby' | 'tamara' | 'klarna' | 'afterpay' | 'affirm' | 'paypal';

export interface BNPLWidgetConfig {
  position: { x: number; y: number };
  providers: BNPLProvider[];
  priceModifier: number; // e.g., 4 for "divided by 4"
  price?: number; // default price for preview
  currency?: string;
  textColor?: string;
  fontSize?: number;
}

const providerLogos: Record<BNPLProvider, string> = {
  tabby: '/bnpl/tabby.svg',
  tamara: '/bnpl/tamara.svg',
  klarna: '/bnpl/klarna.svg',
  afterpay: '/bnpl/afterpay.svg',
  affirm: '/bnpl/affirm.svg',
  paypal: '/bnpl/paypal.svg'
};

export function createBNPLWidget(config: BNPLWidgetConfig): CanvasElement[] {
  const {
    position,
    providers,
    priceModifier = 4,
    price = 50,
    currency = 'SAR',
    textColor = '#000000',
    fontSize = 16
  } = config;

  const modifiedPrice = (price / priceModifier).toFixed(1);
  const isSingleProvider = providers.length === 1;
  const logoHeight = 40;
  const logoSpacing = 12;

  if (isSingleProvider) {
    // Single provider layout: Text on left, logo on right
    const textContent = `Pay ${currency} ${modifiedPrice} Now\n& Pay rest later`;
    
    const textElement: TextElement = {
      id: `bnpl-text-${Math.random().toString(36).substr(2, 9)}`,
      type: 'text',
      content: textContent,
      position: { x: 0, y: 0 },
      size: { width: 300, height: 60 },
      fontSize: fontSize,
      fontFamily: 'Inter',
      fontWeight: '400',
      color: textColor,
      textAlign: 'left',
      letterSpacing: 0,
      lineHeight: 1.4,
      autoSize: false,
      textWrapping: true,
      strokeWidth: 0,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      rotation: 0,
      opacity: 100,
      visible: true,
      locked: false,
      zIndex: 0,
      isDynamic: true,
      dynamicField: 'price'
    };

    const logoElement: ImageElement = {
      id: `bnpl-logo-${Math.random().toString(36).substr(2, 9)}`,
      type: 'image',
      src: providerLogos[providers[0]],
      position: { x: 320, y: 10 },
      size: { width: 120, height: logoHeight },
      objectFit: 'contain',
      rotation: 0,
      opacity: 100,
      visible: true,
      locked: false,
      zIndex: 0,
      cornerRadius: 8
    };

    // Group them
    const group: GroupElement = {
      id: `bnpl-widget-${Math.random().toString(36).substr(2, 9)}`,
      type: 'group',
      name: 'BNPL Widget',
      position: position,
      size: { width: 460, height: 60 },
      rotation: 0,
      opacity: 100,
      visible: true,
      locked: false,
      zIndex: 0,
      children: [textElement, logoElement],
      widgetType: 'bnpl',
      widgetData: {
        providers,
        priceModifier,
        price,
        currency,
        textColor,
        fontSize
      }
    };

    return [group];
  } else {
    // Multiple providers layout: Text above, logos in grid below
    const textContent = `Buy now with ${currency} ${modifiedPrice} & Pay rest later`;
    
    const textElement: TextElement = {
      id: `bnpl-text-${Math.random().toString(36).substr(2, 9)}`,
      type: 'text',
      content: textContent,
      position: { x: 0, y: 0 },
      size: { width: 500, height: 30 },
      fontSize: fontSize,
      fontFamily: 'Inter',
      fontWeight: '400',
      color: textColor,
      textAlign: 'left',
      letterSpacing: 0,
      lineHeight: 1.4,
      autoSize: false,
      textWrapping: false,
      strokeWidth: 0,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      rotation: 0,
      opacity: 100,
      visible: true,
      locked: false,
      zIndex: 0,
      isDynamic: true,
      dynamicField: 'price'
    };

    // Create logos container as nested children
    const logoElements: ImageElement[] = [];
    let currentX = 0;

    providers.forEach((provider) => {
      const logoElement: ImageElement = {
        id: `bnpl-logo-${provider}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'image',
        src: providerLogos[provider],
        position: { x: currentX, y: 0 },
        size: { width: 120, height: logoHeight },
        objectFit: 'contain',
        rotation: 0,
        opacity: 100,
        visible: true,
        locked: false,
        zIndex: 0,
        cornerRadius: 8
      };

      logoElements.push(logoElement);
      currentX += 120 + logoSpacing;
    });

    const totalLogosWidth = currentX - logoSpacing;

    // Group them
    const group: GroupElement = {
      id: `bnpl-widget-${Math.random().toString(36).substr(2, 9)}`,
      type: 'group',
      name: 'BNPL Widget',
      position: position,
      size: { width: Math.max(500, totalLogosWidth), height: 95 },
      rotation: 0,
      opacity: 100,
      visible: true,
      locked: false,
      zIndex: 0,
      children: [textElement, ...logoElements.map(logo => ({
        ...logo,
        position: { x: logo.position.x, y: 45 }
      }))],
      widgetType: 'bnpl',
      widgetData: {
        providers,
        priceModifier,
        price,
        currency,
        textColor,
        fontSize
      }
    };

    return [group];
  }
}
