import { useState } from "react";
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
} from "lucide-react";

// Mock data
const products = [
  {
    id: "SKU001",
    title: "Premium Wireless Headphones",
    price: 299.99,
    salePrice: 249.99,
    availability: "in_stock",
    brand: "AudioTech",
    imageLink: "/placeholder.svg",
    status: "active",
  },
  {
    id: "SKU002", 
    title: "Smart Fitness Watch",
    price: 199.99,
    salePrice: null,
    availability: "in_stock",
    brand: "FitGear",
    imageLink: "/placeholder.svg",
    status: "active",
  },
  {
    id: "SKU003",
    title: "Organic Coffee Beans",
    price: 24.99,
    salePrice: 19.99,
    availability: "limited_stock",
    brand: "BrewMaster",
    imageLink: "/placeholder.svg",
    status: "active",
  },
  {
    id: "SKU004",
    title: "Gaming Mechanical Keyboard",
    price: 159.99,
    salePrice: null,
    availability: "out_of_stock",
    brand: "GamePro",
    imageLink: "/placeholder.svg",
    status: "archived",
  },
];

const getAvailabilityBadge = (availability: string) => {
  switch (availability) {
    case "in_stock":
      return <Badge className="bg-success/20 text-success border-success/30">In Stock</Badge>;
    case "limited_stock":
      return <Badge className="bg-warning/20 text-warning border-warning/30">Limited</Badge>;
    case "out_of_stock":
      return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Out of Stock</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  return status === "active" 
    ? <Badge className="bg-primary/20 text-primary border-primary/30">Active</Badge>
    : <Badge variant="secondary">Archived</Badge>;
};

export default function Products() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleAllProducts = () => {
    setSelectedProducts(
      selectedProducts.length === products.length ? [] : products.map(p => p.id)
    );
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-border hover:bg-muted/50">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button 
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
            onClick={() => window.location.href = '/products/new'}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
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
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted/50 border-border"
              />
            </div>
            <Button variant="outline" className="border-border hover:bg-muted/50">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            {selectedProducts.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedProducts.length} selected
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

      {/* Products Table */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Product Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/50">
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedProducts.length === products.length}
                    onCheckedChange={toggleAllProducts}
                  />
                </TableHead>
                <TableHead className="text-muted-foreground">Product</TableHead>
                <TableHead className="text-muted-foreground">SKU</TableHead>
                <TableHead className="text-muted-foreground">Price</TableHead>
                <TableHead className="text-muted-foreground">Availability</TableHead>
                <TableHead className="text-muted-foreground">Brand</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="border-border hover:bg-muted/30">
                  <TableCell>
                    <Checkbox 
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => toggleProductSelection(product.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img 
                        src={product.imageLink} 
                        alt={product.title}
                        className="w-10 h-10 rounded-lg bg-muted object-cover"
                      />
                      <div>
                        <p className="font-medium text-foreground">{product.title}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground font-mono text-sm">{product.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">
                        ${product.salePrice || product.price}
                      </span>
                      {product.salePrice && (
                        <span className="text-muted-foreground line-through text-sm">
                          ${product.price}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getAvailabilityBadge(product.availability)}</TableCell>
                  <TableCell className="text-foreground">{product.brand}</TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
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
                        <DropdownMenuItem className="text-foreground">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Product
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Product
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