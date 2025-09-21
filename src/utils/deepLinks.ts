export interface DeepLinkConfig {
  scheme: string; // e.g., "myapp"
  host?: string; // e.g., "product" 
  path?: string; // e.g., "/details"
  parameters?: Record<string, string>;
}

export interface AppPlatformConfig {
  ios: {
    bundleId: string;
    appStoreId?: string;
    customScheme?: string;
  };
  android: {
    packageName: string;
    playStoreId?: string;  
    customScheme?: string;
  };
  web: {
    fallbackUrl: string;
  };
}

export class DeepLinkGenerator {
  private config: AppPlatformConfig;

  constructor(config: AppPlatformConfig) {
    this.config = config;
  }

  /**
   * Generate product deep link for mobile app
   */
  generateProductLink(productId: string, customParams?: Record<string, string>): {
    ios: string;
    android: string;
    universal: string;
    web: string;
  } {
    const params = new URLSearchParams({
      id: productId,
      ...customParams
    });

    const iosScheme = this.config.ios.customScheme || `${this.config.ios.bundleId}://`;
    const androidScheme = this.config.android.customScheme || `${this.config.android.packageName}://`;
    
    return {
      ios: `${iosScheme}product?${params.toString()}`,
      android: `${androidScheme}product?${params.toString()}`,
      universal: this.generateUniversalLink(productId, customParams),
      web: `${this.config.web.fallbackUrl}/products/${productId}?${params.toString()}`
    };
  }

  /**
   * Generate universal link that works across platforms
   */
  generateUniversalLink(productId: string, customParams?: Record<string, string>): string {
    const params = new URLSearchParams({
      id: productId,
      ...customParams
    });
    
    // This would typically be your domain with proper universal link setup
    return `https://app.boostria.com/product/${productId}?${params.toString()}`;
  }

  /**
   * Generate QR code friendly short link
   */
  generateShortLink(productId: string): string {
    return `https://boost.ria/${productId}`;
  }

  /**
   * Generate social media share links
   */
  generateSocialLinks(productId: string, productTitle: string, productImage?: string) {
    const productUrl = `${this.config.web.fallbackUrl}/products/${productId}`;
    const encodedTitle = encodeURIComponent(productTitle);
    const encodedUrl = encodeURIComponent(productUrl);
    const encodedImage = productImage ? encodeURIComponent(productImage) : '';

    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      pinterest: productImage 
        ? `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`
        : `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`
    };
  }

  /**
   * Generate marketing campaign links
   */
  generateCampaignLink(productId: string, campaign: {
    source: string;
    medium: string;
    campaign: string;
    content?: string;
  }): string {
    const baseUrl = `${this.config.web.fallbackUrl}/products/${productId}`;
    const params = new URLSearchParams({
      utm_source: campaign.source,
      utm_medium: campaign.medium,
      utm_campaign: campaign.campaign,
      ...(campaign.content && { utm_content: campaign.content })
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Check if mobile app is available
   */
  static detectMobileApp(): Promise<{ios: boolean; android: boolean}> {
    return new Promise((resolve) => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);

      // Simple detection - in real app you'd want more sophisticated detection
      resolve({
        ios: isIOS,
        android: isAndroid
      });
    });
  }

  /**
   * Smart redirect - opens app if available, fallback to web
   */
  static smartRedirect(links: {ios: string; android: string; web: string}) {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    if (isIOS) {
      // Try to open iOS app
      window.location.href = links.ios;
      // Fallback to web after delay
      setTimeout(() => {
        window.location.href = links.web;
      }, 2000);
    } else if (isAndroid) {
      // Try to open Android app  
      window.location.href = links.android;
      // Fallback to web after delay
      setTimeout(() => {
        window.location.href = links.web;
      }, 2000);
    } else {
      // Desktop - go to web
      window.location.href = links.web;
    }
  }
}

// Default configuration - can be customized per project
export const defaultDeepLinkConfig: AppPlatformConfig = {
  ios: {
    bundleId: "app.lovable.1e5fe75077594b01a23c43029902667c",
    customScheme: "boostria://",
  },
  android: {
    packageName: "app.lovable.1e5fe75077594b01a23c43029902667c", 
    customScheme: "boostria://",
  },
  web: {
    fallbackUrl: "https://1e5fe750-7759-4b01-a23c-43029902667c.lovableproject.com"
  }
};

export const deepLinkGenerator = new DeepLinkGenerator(defaultDeepLinkConfig);