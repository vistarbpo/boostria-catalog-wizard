import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AppConfig {
  id?: string;
  user_id: string;
  
  // iOS Configuration
  ios_bundle_id?: string;
  ios_app_store_id?: string;
  ios_custom_scheme?: string;
  ios_team_id?: string;
  
  // Android Configuration  
  android_package_name?: string;
  android_play_store_id?: string;
  android_custom_scheme?: string;
  android_sha256_fingerprint?: string;
  
  // Web Configuration
  web_domain?: string;
  web_fallback_url: string;
  
  // Universal Links / App Links
  universal_links_domain?: string;
  android_app_links_domain?: string;
  
  // App Details
  app_name?: string;
  app_description?: string;
  app_icon_url?: string;
  
  // Deep Link Settings
  deep_linking_enabled: boolean;
  custom_url_scheme?: string;
  
  // Currency Settings
  default_currency?: string;
  currency_display_type?: 'code' | 'symbol';
  
  created_at?: string;
  updated_at?: string;
}

export const useAppConfig = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_configurations')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig(data);
      } else {
        // Create default config if none exists
        // Detect user's country and set default currency
        const { detectUserCountry, getDefaultCurrencyByCountry } = await import('@/utils/currencies');
        const userCountry = await detectUserCountry();
        const defaultCurrency = getDefaultCurrencyByCountry(userCountry);
        
        const defaultConfig = {
          user_id: user.id,
          web_fallback_url: window.location.origin,
          deep_linking_enabled: false,
          default_currency: defaultCurrency,
          currency_display_type: 'symbol' as const,
        };

        const { data: newConfig, error: createError } = await supabase
          .from('app_configurations')
          .insert(defaultConfig)
          .select()
          .single();

        if (createError) throw createError;
        setConfig(newConfig);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching app config:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<AppConfig>) => {
    if (!user || !config) return;

    try {
      const { data, error } = await supabase
        .from('app_configurations')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setConfig(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const resetConfig = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('app_configurations')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Recreate default config
      await fetchConfig();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [user]);

  return {
    config,
    loading,
    error,
    updateConfig,
    resetConfig,
    refetch: fetchConfig,
  };
};