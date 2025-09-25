import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const productSchema = z.object({
  // Basic Info
  sku: z.string().min(1, "SKU is required").max(100, "SKU must be less than 100 characters"),
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(2000, "Description must be less than 2000 characters").optional(),
  brand: z.string().max(100, "Brand must be less than 100 characters").optional(),
  category: z.string().max(100, "Category must be less than 100 characters").optional(),
  
  // Pricing
  price: z.number().min(0, "Price must be positive").optional(),
  sale_price: z.number().min(0, "Sale price must be positive").optional(),
  currency: z.string().default("USD"),
  
  // Product Details
  condition: z.enum(["new", "refurbished", "used"]).default("new"),
  availability: z.enum(["in stock", "out of stock", "preorder", "backorder"]).default("in stock"),
  
  // Images
  main_image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  
  // Variants
  size: z.string().max(50, "Size must be less than 50 characters").optional(),
  color: z.string().max(50, "Color must be less than 50 characters").optional(),
  material: z.string().max(100, "Material must be less than 100 characters").optional(),
  weight: z.string().max(50, "Weight must be less than 50 characters").optional(),
  gender: z.enum(["male", "female", "unisex"]).optional(),
  
  // SEO & Links
  product_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  meta_title: z.string().max(60, "Meta title must be less than 60 characters").optional(),
  meta_description: z.string().max(160, "Meta description must be less than 160 characters").optional(),
  
  // Inventory
  stock_quantity: z.number().int().min(0, "Stock must be positive").default(0),
  
  // Catalog assignment
  catalog_id: z.string().uuid("Invalid catalog ID").optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

const ProductEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [catalogs, setCatalogs] = useState<any[]>([]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      condition: "new",
      availability: "in stock",
      currency: "USD",
      stock_quantity: 0,
    },
  });

  const isEditing = id && id !== 'new';

  // Load catalogs and existing product data
  useEffect(() => {
    Promise.all([
      loadCatalogs(),
      isEditing ? loadProduct() : Promise.resolve()
    ]).finally(() => setLoading(false));
  }, [id]);

  const loadCatalogs = async () => {
    try {
      const { data, error } = await supabase
        .from('catalogs')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCatalogs(data || []);
    } catch (error) {
      console.error('Error loading catalogs:', error);
      toast.error('Failed to load catalogs');
    }
  };

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        form.reset({
          sku: data.sku,
          title: data.title,
          description: data.description || "",
          brand: data.brand || "",
          category: data.category || "",
          price: data.price || undefined,
          sale_price: data.sale_price || undefined,
          currency: data.currency || "USD",
          condition: data.condition as any,
          availability: data.availability as any,
          main_image_url: data.main_image_url || "",
          size: data.size || "",
          color: data.color || "",
          material: data.material || "",
          weight: data.weight || "",
          gender: data.gender as any,
          product_url: data.product_url || "",
          meta_title: data.meta_title || "",
          meta_description: data.meta_description || "",
          stock_quantity: data.stock_quantity || 0,
          catalog_id: data.catalog_id || "",
        });
        
        // Set additional images
        if (data.additional_images) {
          setUploadedImages(data.additional_images);
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product');
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (isEditing) {
        // Update existing product
        const updateData = {
          sku: data.sku,
          title: data.title,
          description: data.description || null,
          brand: data.brand || null,
          category: data.category || null,
          price: data.price || null,
          sale_price: data.sale_price || null,
          currency: data.currency,
          condition: data.condition,
          availability: data.availability,
          main_image_url: data.main_image_url || null,
          additional_images: uploadedImages.length > 0 ? uploadedImages : null,
          size: data.size || null,
          color: data.color || null,
          material: data.material || null,
          weight: data.weight || null,
          gender: data.gender || null,
          product_url: data.product_url || null,
          meta_title: data.meta_title || null,
          meta_description: data.meta_description || null,
          stock_quantity: data.stock_quantity,
          catalog_id: data.catalog_id || null,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Product updated successfully!');
      } else {
        // Create new product
        const insertData = {
          sku: data.sku,
          title: data.title,
          description: data.description || null,
          brand: data.brand || null,
          category: data.category || null,
          price: data.price || null,
          sale_price: data.sale_price || null,
          currency: data.currency,
          condition: data.condition,
          availability: data.availability,
          main_image_url: data.main_image_url || null,
          additional_images: uploadedImages.length > 0 ? uploadedImages : null,
          size: data.size || null,
          color: data.color || null,
          material: data.material || null,
          weight: data.weight || null,
          gender: data.gender || null,
          product_url: data.product_url || null,
          meta_title: data.meta_title || null,
          meta_description: data.meta_description || null,
          stock_quantity: data.stock_quantity,
          catalog_id: data.catalog_id || null,
          user_id: user?.id!,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('products')
          .insert(insertData);

        if (error) throw error;
        toast.success('Product created successfully!');
      }

      navigate("/products");
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const imageUrls = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...imageUrls]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/products")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? 'Edit Product' : 'Add Product'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update product information' : 'Create a new product for your catalog'}
            </p>
          </div>
        </div>
        <Button onClick={form.handleSubmit(onSubmit)}>
          <Save className="h-4 w-4 mr-2" />
          {isEditing ? 'Update Product' : 'Save Product'}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU / Product ID *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter unique SKU" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="catalog_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Catalog</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select catalog" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {catalogs.map((catalog) => (
                                <SelectItem key={catalog.id} value={catalog.id}>
                                  {catalog.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter detailed product description"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <FormControl>
                            <Input placeholder="Brand name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Apparel & Accessories" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condition *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="refurbished">Refurbished</SelectItem>
                              <SelectItem value="used">Used</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="availability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Availability *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="in stock">In Stock</SelectItem>
                              <SelectItem value="out of stock">Out of Stock</SelectItem>
                              <SelectItem value="preorder">Preorder</SelectItem>
                              <SelectItem value="backorder">Backorder</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stock_quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media">
              <Card>
                <CardHeader>
                  <CardTitle>Product Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="main_image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <Label className="text-base font-medium">Additional Images</Label>
                    <div className="mt-2 space-y-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Label htmlFor="image-upload" className="cursor-pointer">
                          <Button type="button" variant="outline" asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Images
                            </span>
                          </Button>
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          Max 20 images per product
                        </span>
                      </div>

                      {uploadedImages.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {uploadedImages.map((url, index) => (
                            <div key={index} className="relative">
                              <img
                                src={url}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-24 object-cover rounded-md border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6"
                                onClick={() => removeImage(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Variants Tab */}
            <TabsContent value="variants">
              <Card>
                <CardHeader>
                  <CardTitle>Product Variants & Attributes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Size</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., M, L, XL, 42" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Red, Blue, Black" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="material"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Material</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Cotton, Polyester, Leather" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 500g, 1.2kg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="unisex">Unisex</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Regular Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="29.99"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sale_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sale Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="24.99"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <FormControl>
                            <Input placeholder="USD" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo">
              <Card>
                <CardHeader>
                  <CardTitle>SEO & Meta Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="product_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/product" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="meta_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title (SEO)</FormLabel>
                        <FormControl>
                          <Input placeholder="SEO optimized title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="meta_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description (SEO)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="SEO optimized description"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
};

export default ProductEdit;