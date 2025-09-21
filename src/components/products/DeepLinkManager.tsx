import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Smartphone, 
  Globe, 
  QrCode, 
  Share2, 
  Copy, 
  ExternalLink,
  Facebook,
  Twitter,
  MessageCircle,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppConfig } from "@/hooks/useAppConfig";
import { createDynamicDeepLinkGenerator } from "@/utils/dynamicDeepLinks";

interface DeepLinkManagerProps {
  productId: string;
  productTitle: string;
  productImage?: string;
  onLinksGenerated?: (links: any) => void;
}

const DeepLinkManager = ({ 
  productId, 
  productTitle, 
  productImage, 
  onLinksGenerated 
}: DeepLinkManagerProps) => {
  const { toast } = useToast();
  const { config: appConfig } = useAppConfig();
  const [mobileAppAvailable, setMobileAppAvailable] = useState({ ios: false, android: false });
  const [generatedLinks, setGeneratedLinks] = useState<any>(null);
  const [customParams, setCustomParams] = useState("");

  useEffect(() => {
    // Check if mobile app is available
    if (appConfig) {
      const generator = createDynamicDeepLinkGenerator(appConfig);
      if (generator) {
        const status = generator.isConfigured();
        setMobileAppAvailable({
          ios: status.hasIOSApp,
          android: status.hasAndroidApp
        });
      }
    }
    
    // Generate initial links
    generateLinks();
  }, [productId, appConfig]);

  const generateLinks = () => {
    if (!appConfig) return;

    const generator = createDynamicDeepLinkGenerator(appConfig);
    if (!generator) return;

    const customParamsObj = customParams ? 
      Object.fromEntries(customParams.split('&').map(p => p.split('='))) : 
      {};

    const productLinks = generator.generateProductLink(productId, customParamsObj);
    const qrCode = generator.generateQRCode(productId);
    const storeLinks = generator.generateAppStoreLinks();

    const links = {
      product: productLinks,
      social: {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productLinks.web)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(productLinks.web)}&text=${encodeURIComponent(productTitle)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(productTitle + ' ' + productLinks.web)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(productLinks.web)}&text=${encodeURIComponent(productTitle)}`,
      },
      qr: qrCode,
      store: storeLinks
    };

    setGeneratedLinks(links);
    onLinksGenerated?.(links);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} link copied to clipboard.`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually.",
        variant: "destructive"
      });
    }
  };

  const openLink = (url: string) => {
    window.open(url, '_blank');
  };

  const smartRedirect = () => {
    if (generatedLinks && appConfig) {
      const generator = createDynamicDeepLinkGenerator(appConfig);
      if (generator) {
        const userAgent = navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);

        if (isIOS && generatedLinks.product.canOpenApp?.ios) {
          window.location.href = generatedLinks.product.ios;
          setTimeout(() => {
            if (generatedLinks.store?.ios) {
              window.location.href = generatedLinks.store.ios;
            } else {
              window.location.href = generatedLinks.product.web;
            }
          }, 2000);
        } else if (isAndroid && generatedLinks.product.canOpenApp?.android) {
          window.location.href = generatedLinks.product.android;
          setTimeout(() => {
            if (generatedLinks.store?.android) {
              window.location.href = generatedLinks.store.android;
            } else {
              window.location.href = generatedLinks.product.web;
            }
          }, 2000);
        } else {
          window.location.href = generatedLinks.product.web;
        }
      }
    }
  };

  if (!generatedLinks) {
    return <div className="p-4">Generating links...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Mobile App Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Mobile App Status
          </CardTitle>
          <CardDescription>
            Deep links work best when your mobile app is available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={mobileAppAvailable.ios ? "default" : "secondary"}>
                iOS {mobileAppAvailable.ios ? "Available" : "Not Detected"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={mobileAppAvailable.android ? "default" : "secondary"}>
                Android {mobileAppAvailable.android ? "Available" : "Not Detected"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Parameters</CardTitle>
          <CardDescription>
            Add custom parameters to track campaigns or user flow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="customParams">Parameters (format: key1=value1&key2=value2)</Label>
            <Input
              id="customParams"
              placeholder="source=email&campaign=summer2024"
              value={customParams}
              onChange={(e) => setCustomParams(e.target.value)}
            />
          </div>
          <Button onClick={generateLinks} variant="outline">
            Regenerate Links
          </Button>
        </CardContent>
      </Card>

      {/* Generated Links */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Deep Links</CardTitle>
          <CardDescription>
            Use these links to direct users to your product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="product" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="product">Product Links</TabsTrigger>
              <TabsTrigger value="social">Social Share</TabsTrigger>
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
              <TabsTrigger value="quick">Quick Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="product" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <Label className="font-medium">Universal Link</Label>
                    <p className="text-sm text-muted-foreground truncate">
                      {generatedLinks.product.universal}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(generatedLinks.product.universal, "Universal")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openLink(generatedLinks.product.universal)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <Label className="font-medium">iOS Deep Link</Label>
                    <p className="text-sm text-muted-foreground truncate">
                      {generatedLinks.product.ios}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(generatedLinks.product.ios, "iOS")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <Label className="font-medium">Android Deep Link</Label>
                    <p className="text-sm text-muted-foreground truncate">
                      {generatedLinks.product.android}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(generatedLinks.product.android, "Android")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <Label className="font-medium">Web Fallback</Label>
                    <p className="text-sm text-muted-foreground truncate">
                      {generatedLinks.product.web}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(generatedLinks.product.web, "Web")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openLink(generatedLinks.product.web)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="social" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => openLink(generatedLinks.social.facebook)}
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Share on Facebook
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => openLink(generatedLinks.social.twitter)}
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Share on Twitter
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => openLink(generatedLinks.social.whatsapp)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Share on WhatsApp
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => openLink(generatedLinks.social.telegram)}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Share on Telegram
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="marketing" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <Label className="font-medium">Short Link</Label>
                    <p className="text-sm text-muted-foreground">
                      {generatedLinks.short}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(generatedLinks.short, "Short")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <Label className="font-medium">QR Code URL</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Generate QR code for: {generatedLinks.qr}
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => openLink(generatedLinks.qr)}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Generate QR Code
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="quick" className="space-y-4">
              <div className="flex flex-col gap-3">
                <Button onClick={smartRedirect} className="w-full">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Smart Redirect (App → Web)
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => copyToClipboard(generatedLinks.product.universal, "Universal")}
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Universal Link
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => openLink(generatedLinks.product.web)}
                  className="w-full"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Open in Browser
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeepLinkManager;