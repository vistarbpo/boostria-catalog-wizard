import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Image, Video, RefreshCw, Grid, List } from "lucide-react";

export default function MediaManager() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Media Manager</h1>
          <p className="text-muted-foreground">Manage product images, videos, and templates</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-border hover:bg-muted/50">
            <Upload className="w-4 h-4 mr-2" />
            Upload Media
          </Button>
          <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate Templates
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Image className="w-5 h-5 text-primary" />
              Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">8,924</div>
            <p className="text-sm text-muted-foreground">Total media assets</p>
          </CardContent>
        </Card>
        
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">142</div>
            <p className="text-sm text-muted-foreground">Product videos</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">4,862</div>
            <p className="text-sm text-muted-foreground">Generated templates</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Storage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">24.3 GB</div>
            <p className="text-sm text-muted-foreground">of 100 GB used</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Image className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Media Management Interface</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Upload, organize, and manage your product media assets. Generate template images and videos for your marketing campaigns.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}