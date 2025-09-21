import { AppConfig } from '@/hooks/useAppConfig';

export interface DynamicAppPlatformConfig {
  ios: {
    bundleId?: string;
    appStoreId?: string;
    customScheme?: string;
    teamId?: string;
  };
  android: {
    packageName?: string;
    playStoreId?: string;
    customScheme?: string;
    sha256Fingerprint?: string;
  };
  web: {
    domain?: string;
    fallbackUrl: string;
  };
  universal: {
    linksDomain?: string;
    appLinksDomain?: string;
  };
  app: {
    name?: string;
    description?: string;
    iconUrl?: string;
  };
}

export class DynamicDeepLinkGenerator {
  private config: DynamicAppPlatformConfig;

  constructor(appConfig: AppConfig) {
    this.config = this.transformAppConfig(appConfig);
  }

  private transformAppConfig(appConfig: AppConfig): DynamicAppPlatformConfig {
    return {
      ios: {
        bundleId: appConfig.ios_bundle_id,
        appStoreId: appConfig.ios_app_store_id,
        customScheme: appConfig.ios_custom_scheme,
        teamId: appConfig.ios_team_id,
      },
      android: {
        packageName: appConfig.android_package_name,
        playStoreId: appConfig.android_play_store_id,
        customScheme: appConfig.android_custom_scheme,
        sha256Fingerprint: appConfig.android_sha256_fingerprint,
      },
      web: {
        domain: appConfig.web_domain,
        fallbackUrl: appConfig.web_fallback_url,
      },
      universal: {
        linksDomain: appConfig.universal_links_domain,
        appLinksDomain: appConfig.android_app_links_domain,
      },
      app: {
        name: appConfig.app_name,
        description: appConfig.app_description,
        iconUrl: appConfig.app_icon_url,
      }
    };
  }

  /**
   * Generate product deep link using client's app configuration
   */
  generateProductLink(productId: string, customParams?: Record<string, string>): {
    ios: string;
    android: string;
    universal: string;
    web: string;
    canOpenApp: {
      ios: boolean;
      android: boolean;
    };
  } {
    const params = new URLSearchParams({
      id: productId,
      ...customParams
    });

    // Generate iOS link
    let iosLink = `${this.config.web.fallbackUrl}/products/${productId}`;
    if (this.config.ios.customScheme) {
      iosLink = `${this.config.ios.customScheme}://product?${params.toString()}`;
    } else if (this.config.ios.bundleId) {
      iosLink = `${this.config.ios.bundleId}://product?${params.toString()}`;
    }

    // Generate Android link
    let androidLink = `${this.config.web.fallbackUrl}/products/${productId}`;
    if (this.config.android.customScheme) {
      androidLink = `${this.config.android.customScheme}://product?${params.toString()}`;
    } else if (this.config.android.packageName) {
      androidLink = `${this.config.android.packageName}://product?${params.toString()}`;
    }

    // Generate universal link
    let universalLink = `${this.config.web.fallbackUrl}/products/${productId}?${params.toString()}`;
    if (this.config.universal.linksDomain) {
      universalLink = `https://${this.config.universal.linksDomain}/product/${productId}?${params.toString()}`;
    }

    return {
      ios: iosLink,
      android: androidLink,
      universal: universalLink,
      web: `${this.config.web.fallbackUrl}/products/${productId}?${params.toString()}`,
      canOpenApp: {
        ios: !!(this.config.ios.bundleId || this.config.ios.customScheme),
        android: !!(this.config.android.packageName || this.config.android.customScheme),
      }
    };
  }

  /**
   * Generate app store links for app installation
   */
  generateAppStoreLinks(): {
    ios?: string;
    android?: string;
  } {
    const links: { ios?: string; android?: string } = {};

    if (this.config.ios.appStoreId) {
      links.ios = `https://apps.apple.com/app/id${this.config.ios.appStoreId}`;
    }

    if (this.config.android.playStoreId) {
      links.android = `https://play.google.com/store/apps/details?id=${this.config.android.playStoreId}`;
    }

    return links;
  }

  /**
   * Generate smart redirect HTML for web pages
   */
  generateSmartRedirectScript(productId: string): string {
    const links = this.generateProductLink(productId);
    const storeLinks = this.generateAppStoreLinks();

    return `
      <script>
        (function() {
          const userAgent = navigator.userAgent.toLowerCase();
          const isIOS = /iphone|ipad|ipod/.test(userAgent);
          const isAndroid = /android/.test(userAgent);
          
          let appLink, storeLink;
          
          if (isIOS && ${links.canOpenApp.ios}) {
            appLink = '${links.ios}';
            storeLink = '${storeLinks.ios || ''}';
          } else if (isAndroid && ${links.canOpenApp.android}) {
            appLink = '${links.android}';
            storeLink = '${storeLinks.android || ''}';
          }
          
          if (appLink) {
            // Try to open app
            window.location.href = appLink;
            
            // Fallback to store or web after 2 seconds
            setTimeout(function() {
              if (storeLink) {
                window.location.href = storeLink;
              } else {
                window.location.href = '${links.web}';
              }
            }, 2000);
          } else {
            // No app available, go to web
            window.location.href = '${links.web}';
          }
        })();
      </script>
    `;
  }

  /**
   * Generate marketing campaign links with tracking
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
   * Generate QR code URL for the product
   */
  generateQRCode(productId: string, size: number = 300): string {
    const links = this.generateProductLink(productId);
    const qrData = encodeURIComponent(links.universal);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${qrData}`;
  }

  /**
   * Check if the client has configured their app properly
   */
  isConfigured(): {
    hasIOSApp: boolean;
    hasAndroidApp: boolean;
    hasUniversalLinks: boolean;
    hasWebFallback: boolean;
    isComplete: boolean;
  } {
    const hasIOSApp = !!(this.config.ios.bundleId || this.config.ios.customScheme);
    const hasAndroidApp = !!(this.config.android.packageName || this.config.android.customScheme);
    const hasUniversalLinks = !!this.config.universal.linksDomain;
    const hasWebFallback = !!this.config.web.fallbackUrl;

    return {
      hasIOSApp,
      hasAndroidApp,
      hasUniversalLinks,
      hasWebFallback,
      isComplete: hasWebFallback && (hasIOSApp || hasAndroidApp || hasUniversalLinks)
    };
  }
}

/**
 * Helper function to create deep link generator from app config
 */
export const createDynamicDeepLinkGenerator = (appConfig: AppConfig | null): DynamicDeepLinkGenerator | null => {
  if (!appConfig) return null;
  return new DynamicDeepLinkGenerator(appConfig);
};