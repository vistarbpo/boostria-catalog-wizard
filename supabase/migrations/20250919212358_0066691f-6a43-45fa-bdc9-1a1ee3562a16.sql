-- Create enum types (only if they don't exist)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.subscription_plan AS ENUM ('basic', 'pro', 'advanced', 'enterprise');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.catalog_source AS ENUM ('salla', 'zid', 'shopify', 'woocommerce', 'xml', 'csv');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.catalog_status AS ENUM ('active', 'in_sync', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.media_type AS ENUM ('template_square', 'template_story', 'manual_image', 'manual_video');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.billing_status AS ENUM ('active', 'expired', 'canceled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role app_role NOT NULL DEFAULT 'member',
    plan subscription_plan NOT NULL DEFAULT 'basic',
    monthly_credits INTEGER NOT NULL DEFAULT 500,
    addon_credits INTEGER NOT NULL DEFAULT 0,
    renewal_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create catalogs table
CREATE TABLE IF NOT EXISTS public.catalogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    source catalog_source NOT NULL,
    product_count INTEGER NOT NULL DEFAULT 0,
    status catalog_status NOT NULL DEFAULT 'active',
    google_feed_url TEXT,
    meta_feed_url TEXT,
    tiktok_feed_url TEXT,
    snapchat_feed_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create media table
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catalog_id UUID NOT NULL REFERENCES public.catalogs(id) ON DELETE CASCADE,
    type media_type NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create credits_log table
CREATE TABLE IF NOT EXISTS public.credits_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    credits_used INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create billing table
CREATE TABLE IF NOT EXISTS public.billing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan subscription_plan NOT NULL,
    status billing_status NOT NULL DEFAULT 'active',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    invoices JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create addon_credits table to track add-on credit purchases
CREATE TABLE IF NOT EXISTS public.addon_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    credits INTEGER NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '1 year'),
    purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    used_credits INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addon_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for catalogs
DROP POLICY IF EXISTS "Users can view their own catalogs" ON public.catalogs;
CREATE POLICY "Users can view their own catalogs" ON public.catalogs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own catalogs" ON public.catalogs;
CREATE POLICY "Users can create their own catalogs" ON public.catalogs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own catalogs" ON public.catalogs;
CREATE POLICY "Users can update their own catalogs" ON public.catalogs
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own catalogs" ON public.catalogs;
CREATE POLICY "Users can delete their own catalogs" ON public.catalogs
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for media
DROP POLICY IF EXISTS "Users can view media from their catalogs" ON public.media;
CREATE POLICY "Users can view media from their catalogs" ON public.media
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.catalogs 
        WHERE catalogs.id = media.catalog_id AND catalogs.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can create media for their catalogs" ON public.media;
CREATE POLICY "Users can create media for their catalogs" ON public.media
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM public.catalogs 
        WHERE catalogs.id = media.catalog_id AND catalogs.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can update media from their catalogs" ON public.media;
CREATE POLICY "Users can update media from their catalogs" ON public.media
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.catalogs 
        WHERE catalogs.id = media.catalog_id AND catalogs.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can delete media from their catalogs" ON public.media;
CREATE POLICY "Users can delete media from their catalogs" ON public.media
    FOR DELETE USING (EXISTS (
        SELECT 1 FROM public.catalogs 
        WHERE catalogs.id = media.catalog_id AND catalogs.user_id = auth.uid()
    ));

-- RLS Policies for credits_log
DROP POLICY IF EXISTS "Users can view their own credits log" ON public.credits_log;
CREATE POLICY "Users can view their own credits log" ON public.credits_log
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own credits log" ON public.credits_log;
CREATE POLICY "Users can insert their own credits log" ON public.credits_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for billing
DROP POLICY IF EXISTS "Users can view their own billing" ON public.billing;
CREATE POLICY "Users can view their own billing" ON public.billing
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own billing" ON public.billing;
CREATE POLICY "Users can update their own billing" ON public.billing
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own billing" ON public.billing;
CREATE POLICY "Users can insert their own billing" ON public.billing
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for addon_credits
DROP POLICY IF EXISTS "Users can view their own addon credits" ON public.addon_credits;
CREATE POLICY "Users can view their own addon credits" ON public.addon_credits
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own addon credits" ON public.addon_credits;
CREATE POLICY "Users can insert their own addon credits" ON public.addon_credits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop triggers if they exist and recreate
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_catalogs_updated_at ON public.catalogs;
CREATE TRIGGER update_catalogs_updated_at
    BEFORE UPDATE ON public.catalogs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_billing_updated_at ON public.billing;
CREATE TRIGGER update_billing_updated_at
    BEFORE UPDATE ON public.billing
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, plan, monthly_credits, renewal_date)
    VALUES (
        NEW.id,
        NEW.email,
        'member',
        'basic',
        500,
        CURRENT_DATE + INTERVAL '1 month'
    );
    
    INSERT INTO public.billing (user_id, plan, status)
    VALUES (NEW.id, 'basic', 'active');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to deduct credits and log usage
CREATE OR REPLACE FUNCTION public.deduct_credits(
    p_user_id UUID,
    p_action TEXT,
    p_credits INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    v_monthly_credits INTEGER;
    v_addon_credits INTEGER;
    v_total_available INTEGER;
BEGIN
    -- Get current credits
    SELECT monthly_credits, addon_credits 
    INTO v_monthly_credits, v_addon_credits
    FROM public.profiles 
    WHERE id = p_user_id;
    
    v_total_available := v_monthly_credits + v_addon_credits;
    
    -- Check if user has enough credits
    IF v_total_available < p_credits THEN
        RETURN FALSE;
    END IF;
    
    -- Deduct from monthly credits first, then addon credits
    IF v_monthly_credits >= p_credits THEN
        UPDATE public.profiles 
        SET monthly_credits = monthly_credits - p_credits
        WHERE id = p_user_id;
    ELSE
        -- Use all monthly credits and remaining from addon
        UPDATE public.profiles 
        SET monthly_credits = 0,
            addon_credits = addon_credits - (p_credits - v_monthly_credits)
        WHERE id = p_user_id;
    END IF;
    
    -- Log the usage
    INSERT INTO public.credits_log (user_id, action, credits_used)
    VALUES (p_user_id, p_action, p_credits);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;