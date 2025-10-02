import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Edit, Copy, Trash2, Eye, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Mock data for user's templates
const mockTemplates = [
  {
    id: 1,
    name: "Product Catalog Template",
    description: "Professional product showcase template",
    size: "1200x800",
    width: 1200,
    height: 800,
    category: "Product",
    thumbnail: "/placeholder.svg",
    createdAt: "2024-01-15",
    isActive: true
  },
  {
    id: 2,
    name: "Social Media Post",
    description: "Instagram story template with dynamic content",
    size: "1080x1920",
    width: 1080,
    height: 1920,
    category: "Social",
    thumbnail: "/placeholder.svg",
    createdAt: "2024-01-12",
    isActive: false
  }
];

// Mock data for library templates
const libraryTemplates = [
  {
    id: 101,
    name: "Modern E-commerce Banner",
    description: "Clean and modern banner for online stores",
    size: "1920x600",
    width: 1920,
    height: 600,
    category: "Marketing",
    thumbnail: "/placeholder.svg",
    author: "Lovable Team"
  },
  {
    id: 102,
    name: "Instagram Story Sale",
    description: "Eye-catching sale announcement for Instagram",
    size: "1080x1920",
    width: 1080,
    height: 1920,
    category: "Social",
    thumbnail: "/placeholder.svg",
    author: "Lovable Team"
  },
  {
    id: 103,
    name: "Product Feature Card",
    description: "Highlight product features in style",
    size: "800x800",
    width: 800,
    height: 800,
    category: "Product",
    thumbnail: "/placeholder.svg",
    author: "Lovable Team"
  },
  {
    id: 104,
    name: "Email Newsletter Header",
    description: "Professional header for email campaigns",
    size: "600x400",
    width: 600,
    height: 400,
    category: "Email",
    thumbnail: "/placeholder.svg",
    author: "Lovable Team"
  },
  {
    id: 105,
    name: "Facebook Ad Template",
    description: "High-converting Facebook ad design",
    size: "1200x628",
    width: 1200,
    height: 628,
    category: "Marketing",
    thumbnail: "/placeholder.svg",
    author: "Lovable Team"
  },
  {
    id: 106,
    name: "Pinterest Pin Design",
    description: "Vertical pin design for maximum engagement",
    size: "1000x1500",
    width: 1000,
    height: 1500,
    category: "Social",
    thumbnail: "/placeholder.svg",
    author: "Lovable Team"
  }
];

const categories = ["All", "Product", "Social", "Marketing", "Email"];

export default function Templates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("my-templates");
  const navigate = useNavigate();

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredLibraryTemplates = libraryTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleImportTemplate = (templateId: number) => {
    toast.success("Template imported to your collection!");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Templates</h1>
          <p className="text-muted-foreground">
            Create and manage your design templates
          </p>
        </div>
        <Button 
          onClick={() => navigate("/templates/create")}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="my-templates">My Templates</TabsTrigger>
          <TabsTrigger value="library">Templates Library</TabsTrigger>
        </TabsList>

        {/* My Templates Tab */}
        <TabsContent value="my-templates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center relative overflow-hidden">
                    <img 
                      src={template.thumbnail} 
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => navigate(`/templates/edit/${template.id}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg font-semibold line-clamp-1">
                      {template.name}
                    </CardTitle>
                    {template.isActive && (
                      <Badge variant="secondary" className="text-xs bg-success text-success-foreground">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{template.size}</span>
                    <span>{template.createdAt}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or create a new template.
              </p>
              <Button onClick={() => navigate("/templates/create")}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Templates Library Tab */}
        <TabsContent value="library" className="mt-6">
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {filteredLibraryTemplates.map((template) => (
              <Card key={template.id} className="break-inside-avoid group hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <div 
                    className="bg-muted rounded-t-lg flex items-center justify-center relative overflow-hidden"
                    style={{ aspectRatio: `${template.width}/${template.height}` }}
                  >
                    <img 
                      src={template.thumbnail} 
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => handleImportTemplate(template.id)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Import
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg font-semibold line-clamp-1 mb-1">
                    {template.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>{template.size}</span>
                    <span>by {template.author}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredLibraryTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or category filter.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}