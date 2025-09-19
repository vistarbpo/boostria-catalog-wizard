import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useCredits } from "@/hooks/useCredits";
import { useAuth } from "@/hooks/useAuth";
import { CreditCard, Calendar, TrendingUp, History, ShoppingCart } from "lucide-react";
import { format } from "date-fns";

const PLAN_DETAILS = {
  basic: { name: "Basic", price: "$29/month", maxCredits: 500, catalogs: 1, products: 50 },
  pro: { name: "Pro", price: "$89/month", maxCredits: 2000, catalogs: 5, products: 300 },
  advanced: { name: "Advanced", price: "$299/month", maxCredits: 10000, catalogs: "unlimited", products: 3000 },
  enterprise: { name: "Enterprise", price: "Contact us", maxCredits: "unlimited", catalogs: "unlimited", products: "unlimited" }
};

const ADDON_PACKAGES = [
  { price: "$10", credits: 500 },
  { price: "$25", credits: 2800 },
  { price: "$100", credits: 6000 },
  { price: "$500", credits: 40000 },
  { price: "$1000", credits: 70000 },
  { price: "$2000", credits: 150000 }
];

const USAGE_COSTS = [
  { action: "Create one catalog", cost: 50 },
  { action: "Generate one image with template", cost: 5 },
  { action: "Upload one manual image", cost: 3 },
  { action: "Upload one manual video", cost: 20 },
  { action: "One feed sync (refresh/update)", cost: 10 }
];

export default function Billing() {
  const { user } = useAuth();
  const { profile, creditLogs, loading } = useCredits();

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing</h1>
          <p className="text-muted-foreground">Please login to view your billing information</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing</h1>
          <p className="text-muted-foreground">Loading your billing information...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing</h1>
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  const planDetails = PLAN_DETAILS[profile.plan];
  const totalCredits = profile.monthly_credits + profile.addon_credits;
  const maxCredits = typeof planDetails.maxCredits === 'number' ? planDetails.maxCredits : 10000;
  const creditUsage = typeof planDetails.maxCredits === 'number' ? ((maxCredits - profile.monthly_credits) / maxCredits) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Billing & Credits</h1>
        <p className="text-muted-foreground">Manage your subscription and credit usage</p>
      </div>

      {/* Current Plan & Credits */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{planDetails.name}</h3>
                <p className="text-sm text-muted-foreground">{planDetails.price}</p>
              </div>
              <Badge variant="default">{profile.plan}</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Renewal Date</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(profile.renewal_date), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Max Catalogs</span>
                <span>{planDetails.catalogs}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Max Products</span>
                <span>{planDetails.products}</span>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Credits Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Monthly Credits</span>
                <span className="text-lg font-bold">{profile.monthly_credits.toLocaleString()}</span>
              </div>
              <Progress 
                value={typeof planDetails.maxCredits === 'number' ? (profile.monthly_credits / planDetails.maxCredits) * 100 : 50} 
                className="h-2" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Add-on Credits</span>
                <span className="text-lg font-bold">{profile.addon_credits.toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground">Expires in 1 year from purchase</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Available</span>
              <span className="text-xl font-bold text-primary">{totalCredits.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add-on Credits Packages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Buy Add-on Credits
          </CardTitle>
          <p className="text-sm text-muted-foreground">All add-on credits expire in 1 year</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {ADDON_PACKAGES.map((pkg) => (
              <Card key={pkg.price} className="text-center">
                <CardContent className="pt-4">
                  <div className="text-lg font-bold">{pkg.price}</div>
                  <div className="text-2xl font-bold text-primary">{pkg.credits.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mb-2">credits</div>
                  <Button size="sm" className="w-full">
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Costs */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Costs</CardTitle>
          <p className="text-sm text-muted-foreground">Credits required per action</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {USAGE_COSTS.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <span className="text-sm">{item.action}</span>
                <Badge variant="secondary">{item.cost} credits</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          {creditLogs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No usage history yet</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {creditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(log.created_at), 'MMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                  <Badge variant="destructive">-{log.credits_used}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}