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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const catalogSchema = z.object({
  name: z.string().min(1, "Catalog name is required"),
  source: z.enum(["salla", "zid", "shopify", "woocommerce", "xml", "csv"]),
  status: z.enum(["active", "in_sync", "error"]),
  product_count: z.number().int().min(0, "Product count must be positive"),
  meta_feed_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  google_feed_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  tiktok_feed_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  snapchat_feed_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type CatalogFormData = z.infer<typeof catalogSchema>;

const ProductEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const form = useForm<CatalogFormData>({
    resolver: zodResolver(catalogSchema),
    defaultValues: {
      source: "shopify",
      status: "active",
      product_count: 0,
      meta_feed_url: "",
      google_feed_url: "",
      tiktok_feed_url: "",
      snapchat_feed_url: "",
    },
  });

  const isEditing = id && id !== 'new';

  // Load existing catalog data if editing
  useEffect(() => {
    if (isEditing) {
      loadCatalog();
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadCatalog = async () => {
    try {
      const { data, error } = await supabase
        .from('catalogs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        form.reset({
          name: data.name,
          source: data.source as any,
          status: data.status as any,
          product_count: data.product_count,
          meta_feed_url: data.meta_feed_url || "",
          google_feed_url: data.google_feed_url || "",
          tiktok_feed_url: data.tiktok_feed_url || "",
          snapchat_feed_url: data.snapchat_feed_url || "",
        });
      }
    } catch (error) {
      console.error('Error loading catalog:', error);
      toast.error('Failed to load catalog');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CatalogFormData) => {
    try {
      if (isEditing) {
        // Update existing catalog
        const updateData = {
          name: data.name,
          source: data.source,
          status: data.status,
          product_count: data.product_count,
          meta_feed_url: data.meta_feed_url || null,
          google_feed_url: data.google_feed_url || null,
          tiktok_feed_url: data.tiktok_feed_url || null,
          snapchat_feed_url: data.snapchat_feed_url || null,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('catalogs')
          .update(updateData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Catalog updated successfully!');
      } else {
        // Create new catalog
        const insertData = {
          name: data.name,
          source: data.source,
          status: data.status,
          product_count: data.product_count,
          meta_feed_url: data.meta_feed_url || null,
          google_feed_url: data.google_feed_url || null,
          tiktok_feed_url: data.tiktok_feed_url || null,
          snapchat_feed_url: data.snapchat_feed_url || null,
          user_id: user?.id!,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('catalogs')
          .insert(insertData);

        if (error) throw error;
        toast.success('Catalog created successfully!');
      }

      navigate("/products");
    } catch (error) {
      console.error('Error saving catalog:', error);
      toast.error('Failed to save catalog');
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
              {isEditing ? 'Edit Catalog' : 'Add Catalog'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update your catalog information' : 'Create a new product catalog'}
            </p>
          </div>
        </div>
        <Button onClick={form.handleSubmit(onSubmit)}>
          <Save className="h-4 w-4 mr-2" />
          {isEditing ? 'Update Catalog' : 'Create Catalog'}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catalog Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter catalog name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="salla">Salla</SelectItem>
                          <SelectItem value="zid">Zid</SelectItem>
                          <SelectItem value="shopify">Shopify</SelectItem>
                          <SelectItem value="woocommerce">WooCommerce</SelectItem>
                          <SelectItem value="xml">XML Feed</SelectItem>
                          <SelectItem value="csv">CSV Import</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="in_sync">In Sync</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="product_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Count *</FormLabel>
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

          {/* Feed URLs */}
          <Card>
            <CardHeader>
              <CardTitle>Feed URLs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="meta_feed_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Feed URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/feeds/meta.xml" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="google_feed_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Feed URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/feeds/google.xml" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tiktok_feed_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TikTok Feed URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/feeds/tiktok.xml" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="snapchat_feed_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Snapchat Feed URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/feeds/snapchat.xml" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Media Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Catalog Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  Add representative images for this catalog
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
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default ProductEdit;