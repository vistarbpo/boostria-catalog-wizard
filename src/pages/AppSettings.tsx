import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Globe, 
  Settings, 
  Save, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Apple,
  Bot,
  DollarSign
} from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAppConfig, AppConfig } from "@/hooks/useAppConfig";
import { createDynamicDeepLinkGenerator } from "@/utils/dynamicDeepLinks";
import { CURRENCIES, getCurrencyByCode } from "@/utils/currencies";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const appConfigSchema = z.object({
  // iOS Configuration
  ios_bundle_id: z.string().optional(),
  ios_app_store_id: z.string().optional(),
  ios_custom_scheme: z.string().optional(),
  ios_team_id: z.string().optional(),
  
  // Android Configuration  
  android_package_name: z.string().optional(),
  android_play_store_id: z.string().optional(),
  android_custom_scheme: z.string().optional(),
  android_sha256_fingerprint: z.string().optional(),
  
  // Web Configuration
  web_domain: z.string().optional(),
  web_fallback_url: z.string().url("Must be a valid URL"),
  
  // Universal Links / App Links
  universal_links_domain: z.string().optional(),
  android_app_links_domain: z.string().optional(),
  
  // App Details
  app_name: z.string().optional(),
  app_description: z.string().optional(),
  app_icon_url: z.string().url().optional().or(z.literal("")),
  
  // Deep Link Settings
  deep_linking_enabled: z.boolean(),
  custom_url_scheme: z.string().optional(),
  
  // Currency Settings
  default_currency: z.string().optional(),
});

type AppConfigFormData = z.infer<typeof appConfigSchema>;

const AppSettings = () => {
  const { toast } = useToast();
  const { config, loading, updateConfig, resetConfig } = useAppConfig();
  const [saving, setSaving] = useState(false);

  const form = useForm<AppConfigFormData>({
    resolver: zodResolver(appConfigSchema),
    defaultValues: {
      ios_bundle_id: config?.ios_bundle_id || "",
      ios_app_store_id: config?.ios_app_store_id || "",
      ios_custom_scheme: config?.ios_custom_scheme || "",
      ios_team_id: config?.ios_team_id || "",
      android_package_name: config?.android_package_name || "",
      android_play_store_id: config?.android_play_store_id || "",
      android_custom_scheme: config?.android_custom_scheme || "",
      android_sha256_fingerprint: config?.android_sha256_fingerprint || "",
      web_domain: config?.web_domain || "",
      web_fallback_url: config?.web_fallback_url || window.location.origin,
      universal_links_domain: config?.universal_links_domain || "",
      android_app_links_domain: config?.android_app_links_domain || "",
      app_name: config?.app_name || "",
      app_description: config?.app_description || "",
      app_icon_url: config?.app_icon_url || "",
      deep_linking_enabled: config?.deep_linking_enabled || false,
      custom_url_scheme: config?.custom_url_scheme || "",
      default_currency: config?.default_currency || "USD",
    },
  });

  // Update form when config loads
  useEffect(() => {
    if (config) {
      form.reset({
        ios_bundle_id: config.ios_bundle_id || "",
        ios_app_store_id: config.ios_app_store_id || "",
        ios_custom_scheme: config.ios_custom_scheme || "",
        ios_team_id: config.ios_team_id || "",
        android_package_name: config.android_package_name || "",
        android_play_store_id: config.android_play_store_id || "",
        android_custom_scheme: config.android_custom_scheme || "",
        android_sha256_fingerprint: config.android_sha256_fingerprint || "",
        web_domain: config.web_domain || "",
        web_fallback_url: config.web_fallback_url || window.location.origin,
        universal_links_domain: config.universal_links_domain || "",
        android_app_links_domain: config.android_app_links_domain || "",
        app_name: config.app_name || "",
        app_description: config.app_description || "",
        app_icon_url: config.app_icon_url || "",
        deep_linking_enabled: config.deep_linking_enabled || false,
        custom_url_scheme: config.custom_url_scheme || "",
        default_currency: config.default_currency || "USD",
      });
    }
  }, [config, form]);

  const onSubmit = async (data: AppConfigFormData) => {
    try {
      setSaving(true);
      await updateConfig(data);
      toast({
        title: "Settings saved successfully!",
        description: "Your app configuration has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      await resetConfig();
      toast({
        title: "Settings reset",
        description: "Your app configuration has been reset to defaults.",
      });
    } catch (error: any) {
      toast({
        title: "Error resetting settings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Get configuration status
  const generator = createDynamicDeepLinkGenerator(config);
  const configStatus = generator ? generator.isConfigured() : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">App Settings</h1>
          <p className="text-muted-foreground">Configure your mobile app and deep linking settings</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      {/* Configuration Status */}
      {configStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${configStatus.hasIOSApp ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm">iOS App</span>
                {configStatus.hasIOSApp && <CheckCircle className="w-4 h-4 text-green-500" />}
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${configStatus.hasAndroidApp ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm">Android App</span>
                {configStatus.hasAndroidApp && <CheckCircle className="w-4 h-4 text-green-500" />}
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${configStatus.hasUniversalLinks ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm">Universal Links</span>
                {configStatus.hasUniversalLinks && <CheckCircle className="w-4 h-4 text-green-500" />}
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${configStatus.hasWebFallback ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm">Web Fallback</span>
                {configStatus.hasWebFallback && <CheckCircle className="w-4 h-4 text-green-500" />}
              </div>
            </div>
            <div className="mt-4">
              <Badge variant={configStatus.isComplete ? "default" : "secondary"}>
                {configStatus.isComplete ? "Ready for Deep Linking" : "Configuration Incomplete"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="currency">Currency</TabsTrigger>
              <TabsTrigger value="ios">iOS App</TabsTrigger>
              <TabsTrigger value="android">Android App</TabsTrigger>
              <TabsTrigger value="web">Web & Links</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General App Information</CardTitle>
                  <CardDescription>
                    Basic information about your mobile application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="deep_linking_enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Enable Deep Linking</FormLabel>
                          <FormDescription>
                            Allow generation of deep links for your products
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="app_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>App Name</FormLabel>
                          <FormControl>
                            <Input placeholder="My Awesome App" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="app_icon_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>App Icon URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/icon.png" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="app_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>App Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief description of your app"
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="custom_url_scheme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom URL Scheme</FormLabel>
                        <FormControl>
                          <Input placeholder="myapp" {...field} />
                        </FormControl>
                        <div className="text-sm text-muted-foreground">
                          Used for custom deep link schemes (e.g., myapp://product/123)
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Currency Tab */}
            <TabsContent value="currency">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Currency Settings
                  </CardTitle>
                  <CardDescription>
                    Set your default currency for products and pricing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="default_currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Currency</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[300px]">
                            {CURRENCIES.map((currency) => {
                              const currencyIcon = currency.symbolType === 'svg' && currency.svgPath ? (
                                <img src={currency.svgPath} alt={currency.code} className="w-4 h-4" />
                              ) : (
                                <span className="w-4 text-center">{currency.symbol}</span>
                              );
                              
                              return (
                                <SelectItem key={currency.code} value={currency.code}>
                                  <div className="flex items-center gap-3">
                                    {currencyIcon}
                                    <span className="font-medium">{currency.code}</span>
                                    <span className="text-muted-foreground">- {currency.name}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This currency will be used as the default for your product pricing and feeds.
                          {field.value && (() => {
                            const selectedCurrency = getCurrencyByCode(field.value);
                            return selectedCurrency ? (
                              <div className="mt-2 p-3 bg-muted rounded-md">
                                <div className="flex items-center gap-2">
                                  {selectedCurrency.symbolType === 'svg' && selectedCurrency.svgPath ? (
                                    <img src={selectedCurrency.svgPath} alt={selectedCurrency.code} className="w-6 h-6" />
                                  ) : (
                                    <span className="text-xl">{selectedCurrency.symbol}</span>
                                  )}
                                  <div>
                                    <div className="font-medium">{selectedCurrency.name} ({selectedCurrency.code})</div>
                                    <div className="text-sm text-muted-foreground">
                                      {selectedCurrency.countries.length > 0 
                                        ? `Used in: ${selectedCurrency.countries.slice(0, 5).join(', ')}${selectedCurrency.countries.length > 5 ? '...' : ''}`
                                        : 'Digital currency'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : null;
                          })()}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="rounded-lg border p-4 bg-muted/50">
                    <h4 className="font-medium mb-2">Currency Auto-Detection</h4>
                    <p className="text-sm text-muted-foreground">
                      When you first set up your account, we automatically detect your currency based on your location. 
                      You can change it here at any time.
                    </p>
                  </div>

                  <div className="rounded-lg border p-4 bg-muted/50">
                    <h4 className="font-medium mb-2">Supported Currencies</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      We support {CURRENCIES.length} currencies including major global currencies and regional options.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {CURRENCIES.slice(0, 12).map((currency) => (
                        <div key={currency.code} className="flex items-center gap-2 text-xs">
                          {currency.symbolType === 'svg' && currency.svgPath ? (
                            <img src={currency.svgPath} alt={currency.code} className="w-3 h-3" />
                          ) : (
                            <span>{currency.symbol}</span>
                          )}
                          <span className="font-medium">{currency.code}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      ...and {CURRENCIES.length - 12} more
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* iOS Tab */}
            <TabsContent value="ios">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Apple className="w-5 h-5" />
                    iOS App Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your iOS app settings for deep linking
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="ios_bundle_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bundle ID</FormLabel>
                          <FormControl>
                            <Input placeholder="com.example.myapp" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your iOS app's unique bundle identifier
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ios_app_store_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>App Store ID</FormLabel>
                          <FormControl>
                            <Input placeholder="123456789" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your app's ID from the Apple App Store
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ios_custom_scheme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Scheme</FormLabel>
                          <FormControl>
                            <Input placeholder="myapp://" {...field} />
                          </FormControl>
                          <FormDescription>
                            Custom URL scheme for your iOS app
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ios_team_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team ID</FormLabel>
                          <FormControl>
                            <Input placeholder="ABCD123456" {...field} />
                          </FormControl>
                          <FormDescription>
                            Apple Developer Team ID
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Android Tab */}
            <TabsContent value="android">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    Android App Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your Android app settings for deep linking
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="android_package_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Package Name</FormLabel>
                          <FormControl>
                            <Input placeholder="com.example.myapp" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your Android app's package name
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="android_play_store_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Play Store ID</FormLabel>
                          <FormControl>
                            <Input placeholder="com.example.myapp" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your app's ID on Google Play Store
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="android_custom_scheme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Scheme</FormLabel>
                          <FormControl>
                            <Input placeholder="myapp://" {...field} />
                          </FormControl>
                          <FormDescription>
                            Custom URL scheme for your Android app
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="android_sha256_fingerprint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SHA256 Fingerprint</FormLabel>
                          <FormControl>
                            <Input placeholder="AB:CD:EF..." {...field} />
                          </FormControl>
                          <FormDescription>
                            SHA256 fingerprint for app links verification
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Web & Links Tab */}
            <TabsContent value="web">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Web & Universal Links
                  </CardTitle>
                  <CardDescription>
                    Configure web fallbacks and universal link domains
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="web_fallback_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Web Fallback URL *</FormLabel>
                          <FormControl>
                            <Input placeholder="https://myapp.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            URL to redirect users when app is not available
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="web_domain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Web Domain</FormLabel>
                          <FormControl>
                            <Input placeholder="myapp.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your website's primary domain
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="universal_links_domain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Universal Links Domain</FormLabel>
                          <FormControl>
                            <Input placeholder="links.myapp.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            Domain for iOS Universal Links
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="android_app_links_domain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Android App Links Domain</FormLabel>
                          <FormControl>
                            <Input placeholder="links.myapp.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            Domain for Android App Links
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Configuration</CardTitle>
                  <CardDescription>
                    Advanced settings and testing tools
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Configuration Testing
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Test your deep link configuration with sample links
                    </p>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm">
                        Test iOS Links
                      </Button>
                      <Button type="button" variant="outline" size="sm">
                        Test Android Links
                      </Button>
                      <Button type="button" variant="outline" size="sm">
                        Test Universal Links
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Export Configuration</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Export your configuration for use in mobile app development
                    </p>
                    <Button type="button" variant="outline" size="sm">
                      Export JSON
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
};

export default AppSettings;