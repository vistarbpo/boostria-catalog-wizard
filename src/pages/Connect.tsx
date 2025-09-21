import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  ShoppingBag, 
  Store, 
  Link2, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  connected: boolean;
  storeUrl?: string;
  products?: number;
  lastSync?: string;
}

const Connect = () => {
  const { toast } = useToast();
  const [feedUrl, setFeedUrl] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      id: "salla",
      name: "Salla",
      icon: <Store className="w-6 h-6" />,
      description: "Connect your Salla store to sync products",
      color: "bg-green-500",
      connected: false
    },
    {
      id: "zid", 
      name: "Zid",
      icon: <ShoppingBag className="w-6 h-6" />,
      description: "Integrate with your Zid marketplace",
      color: "bg-blue-500",
      connected: true,
      storeUrl: "mystore.zid.sa",
      products: 245,
      lastSync: "2 hours ago"
    },
    {
      id: "shopify",
      name: "Shopify", 
      icon: <Store className="w-6 h-6" />,
      description: "Sync products from your Shopify store",
      color: "bg-purple-500",
      connected: false
    },
    {
      id: "woocommerce",
      name: "WooCommerce",
      icon: <Globe className="w-6 h-6" />,
      description: "Connect your WooCommerce website",
      color: "bg-orange-500", 
      connected: false
    }
  ]);

  const handleConnect = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;

    // Simulate OAuth flow - in real app this would open OAuth window
    toast({
      title: "Connecting to " + platform.name,
      description: "Opening authentication window...",
    });

    // Simulate connection success after delay
    setTimeout(() => {
      setPlatforms(prev => prev.map(p => 
        p.id === platformId 
          ? { ...p, connected: true, storeUrl: `mystore.${platformId}.com`, products: 0, lastSync: "Just now" }
          : p
      ));
      
      toast({
        title: "Successfully Connected!",
        description: `Your ${platform.name} store is now connected and syncing.`,
      });
    }, 2000);
  };

  const handleDisconnect = (platformId: string) => {
    setPlatforms(prev => prev.map(p => 
      p.id === platformId 
        ? { ...p, connected: false, storeUrl: undefined, products: undefined, lastSync: undefined }
        : p
    ));
    
    const platform = platforms.find(p => p.id === platformId);
    toast({
      title: "Disconnected",
      description: `${platform?.name} store has been disconnected.`,
      variant: "destructive"
    });
  };

  const handleFeedConnect = () => {
    if (!feedUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid feed URL",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Feed Connected",
      description: "Your product feed has been added successfully!",
    });
    setFeedUrl("");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Connect Platforms</h1>
        <p className="text-muted-foreground">
          Integrate your e-commerce platforms to sync product data automatically
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Platform Connections */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">E-commerce Platforms</h2>
            <p className="text-sm text-muted-foreground">
              Connect your store to start syncing products
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {platforms.map((platform) => (
              <Card key={platform.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${platform.color} text-white`}>
                        {platform.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                        {platform.connected && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <CardDescription>{platform.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {platform.connected ? (
                    <div className="space-y-3">
                      <div className="text-sm space-y-1">
                        {platform.storeUrl && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe className="w-4 h-4" />
                            <span>{platform.storeUrl}</span>
                          </div>
                        )}
                        {platform.products !== undefined && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <ShoppingBag className="w-4 h-4" />
                            <span>{platform.products} products synced</span>
                          </div>
                        )}
                        {platform.lastSync && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <AlertCircle className="w-4 h-4" />
                            <span>Last sync: {platform.lastSync}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Sync Now
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDisconnect(platform.id)}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => handleConnect(platform.id)}
                      className="w-full"
                    >
                      <Link2 className="w-4 h-4 mr-2" />
                      Connect {platform.name}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Feed Connection & Connected Platforms Summary */}
        <div className="space-y-4">
          {/* Manual Feed Connection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Feed Link
              </CardTitle>
              <CardDescription>
                Connect using a direct product feed URL
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedUrl">Feed URL</Label>
                <Input
                  id="feedUrl"
                  placeholder="https://your-store.com/products.xml"
                  value={feedUrl}
                  onChange={(e) => setFeedUrl(e.target.value)}
                />
              </div>
              <Button onClick={handleFeedConnect} className="w-full">
                <Link2 className="w-4 h-4 mr-2" />
                Connect Feed
              </Button>
            </CardContent>
          </Card>

          {/* Connection Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Connection Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Connected Platforms:</span>
                <span className="font-medium">{platforms.filter(p => p.connected).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Products:</span>
                <span className="font-medium">
                  {platforms.reduce((sum, p) => sum + (p.products || 0), 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Sync:</span>
                <span className="font-medium">
                  {platforms.find(p => p.connected && p.lastSync)?.lastSync || "Never"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ExternalLink className="w-4 h-4 mr-2" />
                Sync All Platforms
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <AlertCircle className="w-4 h-4 mr-2" />
                View Sync Logs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Connect;