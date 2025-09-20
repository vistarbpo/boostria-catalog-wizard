import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BuyCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ADDON_PACKAGES = [
  { price: "$10", credits: 500, popular: false },
  { price: "$25", credits: 2800, popular: true },
  { price: "$100", credits: 6000, popular: false },
  { price: "$500", credits: 40000, popular: false },
  { price: "$1000", credits: 70000, popular: false },
  { price: "$2000", credits: 150000, popular: false }
];

export function BuyCreditsDialog({ open, onOpenChange }: BuyCreditsDialogProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (packageData: typeof ADDON_PACKAGES[0]) => {
    setLoading(packageData.price);
    
    try {
      // Here you would integrate with Stripe to create a checkout session
      toast({
        title: "Purchase initiated",
        description: "Redirecting to checkout...",
      });
      
      // Placeholder for Stripe checkout
      setTimeout(() => {
        setLoading(null);
        onOpenChange(false);
        toast({
          title: "Purchase successful",
          description: `${packageData.credits.toLocaleString()} credits added to your account!`,
        });
      }, 2000);
      
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase failed",
        description: "Please try again later",
        variant: "destructive",
      });
      setLoading(null);
    }
  };

  const calculateSavings = (credits: number, price: number) => {
    const baseRate = 10 / 500; // $10 for 500 credits
    const packageRate = price / credits;
    const savings = Math.round((1 - packageRate / baseRate) * 100);
    return savings > 0 ? savings : 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Buy Add-on Credits
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            All add-on credits expire in 1 year from purchase date
          </p>
        </DialogHeader>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ADDON_PACKAGES.map((pkg) => {
            const priceNum = parseInt(pkg.price.replace('$', ''));
            const savings = calculateSavings(pkg.credits, priceNum);
            
            return (
              <Card key={pkg.price} className={`relative ${pkg.popular ? 'border-primary' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Zap className="w-3 h-3 mr-1" />
                      Best Value
                    </Badge>
                  </div>
                )}
                
                <CardContent className="pt-6 text-center space-y-4">
                  <div>
                    <div className="text-2xl font-bold">{pkg.price}</div>
                    <div className="text-3xl font-bold text-primary">{pkg.credits.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">credits</div>
                  </div>
                  
                  {savings > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      Save {savings}%
                    </Badge>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    ${(priceNum / pkg.credits * 1000).toFixed(2)} per 1K credits
                  </div>
                  
                  <Button
                    className="w-full"
                    variant={pkg.popular ? 'default' : 'outline'}
                    disabled={loading === pkg.price}
                    onClick={() => handlePurchase(pkg)}
                  >
                    {loading === pkg.price ? 'Processing...' : 'Buy Now'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">What can you do with credits?</h4>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <div>• Create one catalog: 50 credits</div>
            <div>• Generate one image with template: 5 credits</div>
            <div>• Upload one manual image: 3 credits</div>
            <div>• Upload one manual video: 20 credits</div>
            <div>• One feed sync (refresh/update): 10 credits</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}