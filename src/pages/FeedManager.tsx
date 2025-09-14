import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Copy, 
  Eye, 
  RefreshCw, 
  MoreHorizontal,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const feeds = [
  {
    id: "meta-feed",
    platform: "Meta (Facebook/Instagram)",
    url: "https://boostria.com/feeds/meta/user123.xml",
    status: "active",
    lastUpdated: "2 minutes ago",
    products: 2431,
  },
  {
    id: "google-feed",
    platform: "Google Merchant Center",
    url: "https://boostria.com/feeds/google/user123.xml",
    status: "active",
    lastUpdated: "5 minutes ago",
    products: 2431,
  },
  {
    id: "tiktok-feed",
    platform: "TikTok Ads",
    url: "https://boostria.com/feeds/tiktok/user123.json",
    status: "warning",
    lastUpdated: "1 hour ago",
    products: 2385,
  },
  {
    id: "snapchat-feed",
    platform: "Snapchat Ads",
    url: "https://boostria.com/feeds/snapchat/user123.xml",
    status: "active",
    lastUpdated: "30 minutes ago",
    products: 2431,
  },
  {
    id: "pinterest-feed",
    platform: "Pinterest Business",
    url: "https://boostria.com/feeds/pinterest/user123.xml",
    status: "error",
    lastUpdated: "3 hours ago",
    products: 0,
  },
  {
    id: "microsoft-feed",
    platform: "Microsoft Ads",
    url: "https://boostria.com/feeds/microsoft/user123.xml",
    status: "active",
    lastUpdated: "15 minutes ago",
    products: 2431,
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-success/20 text-success border-success/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    case "warning":
      return (
        <Badge className="bg-warning/20 text-warning border-warning/30">
          <AlertCircle className="w-3 h-3 mr-1" />
          Warning
        </Badge>
      );
    case "error":
      return (
        <Badge className="bg-destructive/20 text-destructive border-destructive/30">
          <XCircle className="w-3 h-3 mr-1" />
          Error
        </Badge>
      );
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export default function FeedManager() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Feed Manager</h1>
          <p className="text-muted-foreground">Generate and manage platform-specific product feeds</p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4 mr-2" />
          Generate New Feed
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Feeds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">6</div>
          </CardContent>
        </Card>
        
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Feeds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">4</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products in Feeds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">2,431</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">2</div>
          </CardContent>
        </Card>
      </div>

      {/* Feeds Table */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Platform Feeds</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/50">
                <TableHead className="text-muted-foreground">Platform</TableHead>
                <TableHead className="text-muted-foreground">Feed URL</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Products</TableHead>
                <TableHead className="text-muted-foreground">Last Updated</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeds.map((feed) => (
                <TableRow key={feed.id} className="border-border hover:bg-muted/30">
                  <TableCell>
                    <div className="font-medium text-foreground">{feed.platform}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground font-mono">
                        {feed.url}
                      </code>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 hover:bg-muted/50"
                        onClick={() => copyToClipboard(feed.url)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(feed.status)}</TableCell>
                  <TableCell>
                    <span className="text-foreground font-medium">{feed.products.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">{feed.lastUpdated}</span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-muted/50">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-foreground">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview Feed
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-foreground">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open Feed URL
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-foreground">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate Feed
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-foreground">
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Feed URL
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}