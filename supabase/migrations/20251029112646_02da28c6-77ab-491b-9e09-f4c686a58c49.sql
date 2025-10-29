-- Add currency configuration to app_configurations table
ALTER TABLE public.app_configurations
ADD COLUMN default_currency TEXT DEFAULT 'USD';

-- Add comment
COMMENT ON COLUMN public.app_configurations.default_currency IS 'Default currency code (ISO 4217) for the user';
