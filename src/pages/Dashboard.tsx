import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Images, 
  Rss, 
  TrendingUp, 
  Upload, 
  Plus,
  Activity,
  Users,
  DollarSign
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const stats = [
    {
      title: "Total Products",
      value: "2,431",
      icon: Package,
      change: "+12%",
      trend: "up"
    },
    {
      title: "Media Assets",
      value: "8,924",
      icon: Images,
      change: "+3%",
      trend: "up"
    },
    {
      title: "Active Feeds",
      value: "6",
      icon: Rss,
      change: "0%",
      trend: "stable"
    },
    {
      title: "Monthly Views",
      value: "94.3K",
      icon: Activity,
      change: "+25%",
      trend: "up"
    }
  ];

  const recentActivity = [
    { action: "Feed generated", target: "Meta Catalog", time: "2 min ago", status: "success" },
    { action: "Products imported", target: "245 items from CSV", time: "1 hour ago", status: "success" },
    { action: "Media generated", target: "Square images for 50 products", time: "3 hours ago", status: "success" },
    { action: "Feed error", target: "Google Merchant feed", time: "6 hours ago", status: "error" },
  ];

  const quickActions = [
    { title: "Import Products", icon: Upload, description: "CSV, XML, or API import" },
    { title: "Add Product", icon: Plus, description: "Manually create new product" },
    { title: "Generate Feed", icon: Rss, description: "Create platform-specific feed" },
    { title: "Bulk Edit", icon: Package, description: "Edit multiple products" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your catalog overview.</p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4 mr-2" />
          Quick Start
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center space-x-2 text-xs">
                <Badge 
                  variant={stat.trend === "up" ? "default" : stat.trend === "error" ? "destructive" : "secondary"}
                  className="px-1"
                >
                  {stat.change}
                </Badge>
                <span className="text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Button 
                key={action.title}
                variant="ghost" 
                className="w-full justify-start h-auto p-3 hover:bg-muted/50"
              >
                <action.icon className="w-5 h-5 mr-3 text-primary" />
                <div className="text-left">
                  <div className="font-medium text-foreground">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === "success" ? "bg-success" : 
                      activity.status === "error" ? "bg-destructive" : "bg-warning"
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.target}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}