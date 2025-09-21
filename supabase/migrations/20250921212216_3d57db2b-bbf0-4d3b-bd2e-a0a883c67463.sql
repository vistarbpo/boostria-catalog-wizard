-- Create app_configurations table for client-specific app settings
CREATE TABLE public.app_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- iOS Configuration
  ios_bundle_id TEXT,
  ios_app_store_id TEXT,
  ios_custom_scheme TEXT,
  ios_team_id TEXT,
  
  -- Android Configuration  
  android_package_name TEXT,
  android_play_store_id TEXT,
  android_custom_scheme TEXT,
  android_sha256_fingerprint TEXT,
  
  -- Web Configuration
  web_domain TEXT,
  web_fallback_url TEXT NOT NULL DEFAULT 'https://example.com',
  
  -- Universal Links / App Links
  universal_links_domain TEXT,
  android_app_links_domain TEXT,
  
  -- App Details
  app_name TEXT,
  app_description TEXT,
  app_icon_url TEXT,
  
  -- Deep Link Settings
  deep_linking_enabled BOOLEAN NOT NULL DEFAULT false,
  custom_url_scheme TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_configurations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own app configuration" 
ON public.app_configurations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own app configuration" 
ON public.app_configurations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own app configuration" 
ON public.app_configurations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own app configuration" 
ON public.app_configurations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_app_configurations_updated_at
BEFORE UPDATE ON public.app_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_app_configurations_user_id ON public.app_configurations(user_id);