import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import { toast } from "@/hooks/use-toast";

interface UpgradePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PLANS = [
  {
    id: 'pro',
    name: 'Pro',
    price: '$89',
    credits: 2000,
    catalogs: 5,
    products: 300,
    features: ['Everything in Basic', '2,000 monthly credits', 'Up to 5 catalogs', '300 products per catalog', 'Priority support']
  },
  {
    id: 'advanced',
    name: 'Advanced',
    price: '$299',
    credits: 10000,
    catalogs: 'Unlimited',
    products: 3000,
    features: ['Everything in Pro', '10,000 monthly credits', 'Unlimited catalogs', '3,000 products per catalog', 'Advanced analytics', 'Custom integrations']
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Contact us',
    credits: 'Unlimited',
    catalogs: 'Unlimited',
    products: 'Unlimited',
    features: ['Everything in Advanced', 'Unlimited credits', 'Unlimited catalogs', 'Unlimited products', 'Dedicated support', 'Custom development']
  }
];

export function UpgradePlanDialog({ open, onOpenChange }: UpgradePlanDialogProps) {
  const { profile } = useCredits();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    setLoading(planId);
    
    try {
      // Here you would integrate with Stripe to create a checkout session
      toast({
        title: "Upgrade initiated",
        description: "Redirecting to checkout...",
      });
      
      // Placeholder for Stripe checkout
      setTimeout(() => {
        setLoading(null);
        onOpenChange(false);
        toast({
          title: "Upgrade successful",
          description: `Welcome to ${PLANS.find(p => p.id === planId)?.name}!`,
        });
      }, 2000);
      
    } catch (error) {
      console.error('Upgrade error:', error);
      toast({
        title: "Upgrade failed",
        description: "Please try again later",
        variant: "destructive",
      });
      setLoading(null);
    }
  };

  const currentPlan = profile?.plan || 'basic';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Upgrade Your Plan
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const isDowngrade = currentPlan === 'enterprise' && plan.id !== 'enterprise';
            
            return (
              <Card key={plan.id} className={`relative ${plan.id === 'advanced' ? 'border-primary' : ''}`}>
                {plan.id === 'advanced' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    {isCurrent && <Badge variant="secondary">Current</Badge>}
                  </CardTitle>
                  <div className="text-3xl font-bold">{plan.price}</div>
                  {plan.price !== 'Contact us' && <div className="text-sm text-muted-foreground">per month</div>}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Monthly Credits</span>
                      <span className="font-medium">{typeof plan.credits === 'number' ? plan.credits.toLocaleString() : plan.credits}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Catalogs</span>
                      <span className="font-medium">{plan.catalogs}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Products per catalog</span>
                      <span className="font-medium">{typeof plan.products === 'number' ? plan.products.toLocaleString() : plan.products}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    className="w-full"
                    variant={plan.id === 'advanced' ? 'default' : 'outline'}
                    disabled={isCurrent || isDowngrade || loading === plan.id}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {loading === plan.id ? 'Processing...' : 
                     isCurrent ? 'Current Plan' :
                     isDowngrade ? 'Contact Support' :
                     plan.price === 'Contact us' ? 'Contact Sales' : 'Upgrade Now'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}