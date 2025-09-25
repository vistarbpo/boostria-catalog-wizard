import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Download,
  Smartphone,
  Link2,
  Package,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const getStatusBadge = (status: string) => {
  return status === "active" 
    ? <Badge className="bg-primary/20 text-primary border-primary/30">Active</Badge>
    : <Badge variant="secondary">Draft</Badge>;
};

export default function Products() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCatalogs, setSelectedCatalogs] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [catalogs, setCatalogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingData, setCreatingData] = useState(false);

  // Fetch catalogs from the database
  useEffect(() => {
    fetchCatalogs();
  }, [user]);

  const fetchCatalogs = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('catalogs')
        .select(`
          *,
          media (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCatalogs(data || []);
    } catch (error) {
      console.error('Error fetching catalogs:', error);
      toast.error('Failed to load catalogs');
    } finally {
      setLoading(false);
    }
  };

  const createSampleData = async () => {
    setCreatingData(true);
    try {
      const { data, error } = await supabase.rpc('create_my_sample_products');
      
      if (error) throw error;
      
      toast.success(data || 'Sample products created successfully!');
      await fetchCatalogs(); // Refresh the list
    } catch (error: any) {
      console.error('Error creating sample data:', error);
      toast.error(error.message || 'Failed to create sample data');
    } finally {
      setCreatingData(false);
    }
  };

  const toggleCatalogSelection = (catalogId: string) => {
    setSelectedCatalogs(prev => 
      prev.includes(catalogId) 
        ? prev.filter(id => id !== catalogId)
        : [...prev, catalogId]
    );
  };

  const toggleAllCatalogs = () => {
    setSelectedCatalogs(
      selectedCatalogs.length === catalogs.length ? [] : catalogs.map(c => c.id)
    );
  };

  const filteredCatalogs = catalogs.filter(catalog =>
    catalog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    catalog.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Catalogs</h1>
          <p className="text-muted-foreground">Manage your product catalogs and feed integrations</p>
        </div>
        <div className="flex gap-3">
          {catalogs.length === 0 && (
            <Button 
              onClick={createSampleData}
              disabled={creatingData}
              variant="outline"
              className="border-border hover:bg-muted/50"
            >
              {creatingData ? 'Creating Sample Data...' : 'Add Sample Data'}
            </Button>
          )}
          <Button variant="outline" className="border-border hover:bg-muted/50">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button 
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
            onClick={() => navigate('/products/new')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Catalog
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search catalogs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted/50 border-border"
              />
            </div>
            <Button variant="outline" className="border-border hover:bg-muted/50">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            {selectedCatalogs.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedCatalogs.length} selected
                </span>
                <Button variant="outline" size="sm" className="border-border hover:bg-muted/50">
                  Bulk Edit
                </Button>
                <Button variant="outline" size="sm" className="border-border hover:bg-muted/50">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Catalogs Content */}
      {filteredCatalogs.length > 0 ? (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Catalog Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedCatalogs.length === catalogs.length}
                      onCheckedChange={toggleAllCatalogs}
                    />
                  </TableHead>
                  <TableHead className="text-muted-foreground">Catalog Name</TableHead>
                  <TableHead className="text-muted-foreground">Products</TableHead>
                  <TableHead className="text-muted-foreground">Source</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Feed URLs</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCatalogs.map((catalog) => (
                  <TableRow key={catalog.id} className="border-border hover:bg-muted/30">
                    <TableCell>
                      <Checkbox 
                        checked={selectedCatalogs.includes(catalog.id)}
                        onCheckedChange={() => toggleCatalogSelection(catalog.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          {catalog.media && catalog.media[0] ? (
                            <img 
                              src={catalog.media[0].url} 
                              alt={catalog.name}
                              className="w-full h-full rounded-lg object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{catalog.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Updated {new Date(catalog.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground font-medium">
                      {catalog.product_count} items
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {catalog.source}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(catalog.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {catalog.meta_feed_url && (
                          <a href={catalog.meta_feed_url} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:underline">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {catalog.google_feed_url && (
                          <a href={catalog.google_feed_url} target="_blank" rel="noopener noreferrer"
                             className="text-blue-600 hover:underline">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {catalog.tiktok_feed_url && (
                          <a href={catalog.tiktok_feed_url} target="_blank" rel="noopener noreferrer"
                             className="text-blue-600 hover:underline">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
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
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-foreground"
                            onClick={() => navigate(`/products/edit/${catalog.id}`)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Catalog
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-foreground">
                            <Smartphone className="w-4 h-4 mr-2" />
                            Generate Deep Links
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-foreground">
                            <Link2 className="w-4 h-4 mr-2" />
                            Copy Feed URL
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Catalog
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
      ) : searchTerm ? (
        <Card className="border-border bg-card">
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No catalogs found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No product catalogs yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first catalog or adding sample data.
            </p>
            <Button onClick={createSampleData} disabled={creatingData}>
              {creatingData ? 'Creating Sample Data...' : 'Add Sample Data'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}