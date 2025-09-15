import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";

const productSchema = z.object({
  // Basic Info
  id: z.string().min(1, "Product ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  brand: z.string().min(1, "Brand is required"),
  condition: z.enum(["new", "refurbished", "used"]),
  price: z.string().min(1, "Price is required"),
  sale_price: z.string().optional(),
  availability: z.enum(["in stock", "out of stock", "preorder", "backorder"]),
  link: z.string().url("Must be a valid URL"),
  category: z.string().min(1, "Category is required"),
  
  // Media
  image_link: z.string().url("Must be a valid image URL"),
  additional_image_links: z.array(z.string().url()).optional(),
  
  // Variants
  size: z.string().optional(),
  color: z.string().optional(),
  material: z.string().optional(),
  gender: z.enum(["male", "female", "unisex"]).optional(),
  item_group_id: z.string().optional(),
  
  // Shipping
  shipping: z.string().optional(),
  weight: z.string().optional(),
  
  // Labels & Tags
  internal_labels: z.string().optional(),
  custom_labels: z.string().optional(),
  custom_numbers: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

const ProductEdit = () => {
  const navigate = useNavigate();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      condition: "new",
      availability: "in stock",
      additional_image_links: [],
    },
  });

  const onSubmit = (data: ProductFormData) => {
    console.log("Product data:", data);
    toast({
      title: "Product saved successfully!",
      description: "Your product has been saved to the catalog.",
    });
    navigate("/products");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const imageUrls = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...imageUrls]);
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const videoUrls = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedVideos(prev => [...prev, ...videoUrls]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setUploadedVideos(prev => prev.filter((_, i) => i !== index));
  };

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
            <h1 className="text-3xl font-bold">Add Product</h1>
            <p className="text-muted-foreground">Create a new product for your catalog</p>
          </div>
        </div>
        <Button onClick={form.handleSubmit(onSubmit)}>
          <Save className="h-4 w-4 mr-2" />
          Save Product
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="labels">Labels & Tags</TabsTrigger>
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
                      name="id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product ID / SKU *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter unique product ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter brand name" {...field} />
                          </FormControl>
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
                        <FormLabel>Description *</FormLabel>
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
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Apparel & Accessories" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 29.99 USD" {...field} />
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
                            <Input placeholder="e.g., 24.99 USD" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Link *</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/product" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                    name="image_link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Image URL *</FormLabel>
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

                  <div>
                    <Label className="text-base font-medium">Videos</Label>
                    <div className="mt-2 space-y-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          multiple
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="hidden"
                          id="video-upload"
                        />
                        <Label htmlFor="video-upload" className="cursor-pointer">
                          <Button type="button" variant="outline" asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Videos
                            </span>
                          </Button>
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          Max 20 videos per product
                        </span>
                      </div>
                      
                      {uploadedVideos.length > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                          {uploadedVideos.map((url, index) => (
                            <div key={index} className="relative">
                              <video
                                src={url}
                                className="w-full h-32 object-cover rounded-md border"
                                controls
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6"
                                onClick={() => removeVideo(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Template Images (Auto-generated)</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Square and Story template images will be automatically generated for social media platforms.
                    </p>
                    <Button type="button" variant="outline" size="sm">
                      Regenerate Templates
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Variants Tab */}
            <TabsContent value="variants">
              <Card>
                <CardHeader>
                  <CardTitle>Product Variants</CardTitle>
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
                            <Input placeholder="e.g., XL, 42, Large" {...field} />
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
                            <Input placeholder="e.g., Blue, Red, Black" {...field} />
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
                            <Input placeholder="e.g., Cotton, Leather, Polyester" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
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
                  </div>

                  <FormField
                    control={form.control}
                    name="item_group_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Group ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Group related variants together" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Shipping Tab */}
            <TabsContent value="shipping">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="shipping"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Cost</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 5.99 USD, Free shipping" {...field} />
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
                          <Input placeholder="e.g., 1.5 kg, 3.2 lbs" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Labels & Tags Tab */}
            <TabsContent value="labels">
              <Card>
                <CardHeader>
                  <CardTitle>Labels & Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="internal_labels"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Internal Labels</FormLabel>
                        <FormControl>
                          <Input placeholder="Internal organization tags" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="custom_labels"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Labels</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Custom labels for targeting and organization"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="custom_numbers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Numbers</FormLabel>
                        <FormControl>
                          <Input placeholder="Custom numeric identifiers" {...field} />
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