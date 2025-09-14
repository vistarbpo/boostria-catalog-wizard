import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export default function Support() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Support</h1>
        <p className="text-muted-foreground">Get help and find answers</p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Help Center</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Access documentation, tutorials, and contact our support team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}