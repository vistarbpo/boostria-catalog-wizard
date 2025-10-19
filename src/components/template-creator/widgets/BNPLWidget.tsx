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
  tabby: '/src/assets/bnpl/tabby.svg',
  tamara: '/src/assets/bnpl/tamara.svg',
  klarna: '/src/assets/bnpl/klarna.svg',
  afterpay: '/src/assets/bnpl/afterpay.svg',
  affirm: '/src/assets/bnpl/affirm.svg',
  paypal: '/src/assets/bnpl/paypal.svg'
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

  const elements: CanvasElement[] = [];

  if (isSingleProvider) {
    // Single provider layout: Text on left, logo on right
    const textContent = `Pay ${currency} ${modifiedPrice} Now\n& Pay rest later`;
    
    const textElement: TextElement = {
      id: `bnpl-text-${Math.random().toString(36).substr(2, 9)}`,
      type: 'text',
      content: textContent,
      position: position,
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
      position: { x: position.x + 320, y: position.y + 10 },
      size: { width: 120, height: logoHeight },
      objectFit: 'contain',
        rotation: 0,
        opacity: 100,
        visible: true,
        locked: false,
        zIndex: 0,
        cornerRadius: 8
      };

    elements.push(textElement, logoElement);

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
    // Multiple providers layout: Text above, logos below
    const textContent = `Buy now with ${currency} ${modifiedPrice} & Pay rest later`;
    
    const textElement: TextElement = {
      id: `bnpl-text-${Math.random().toString(36).substr(2, 9)}`,
      type: 'text',
      content: textContent,
      position: position,
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

    elements.push(textElement);

    // Add logo images
    const totalLogosWidth = providers.length * 120 + (providers.length - 1) * logoSpacing;
    let currentX = position.x;

    providers.forEach((provider, index) => {
      const logoElement: ImageElement = {
        id: `bnpl-logo-${provider}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'image',
        src: providerLogos[provider],
        position: { x: currentX, y: position.y + 45 },
        size: { width: 120, height: logoHeight },
        objectFit: 'contain',
          rotation: 0,
          opacity: 100,
          visible: true,
          locked: false,
          zIndex: 0,
          cornerRadius: 8
        };

      elements.push(logoElement);
      currentX += 120 + logoSpacing;
    });

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
      children: elements,
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
