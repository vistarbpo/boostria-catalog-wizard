export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      addon_credits: {
        Row: {
          credits: number
          expires_at: string
          id: string
          purchased_at: string
          used_credits: number
          user_id: string
        }
        Insert: {
          credits: number
          expires_at?: string
          id?: string
          purchased_at?: string
          used_credits?: number
          user_id: string
        }
        Update: {
          credits?: number
          expires_at?: string
          id?: string
          purchased_at?: string
          used_credits?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "addon_credits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_name: string
          last_used_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_name: string
          last_used_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_name?: string
          last_used_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      api_request_logs: {
        Row: {
          api_key_id: string | null
          created_at: string
          endpoint: string
          error_message: string | null
          id: string
          ip_address: string | null
          method: string
          request_body: Json | null
          response_body: Json | null
          status_code: number
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string
          endpoint: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          method: string
          request_body?: Json | null
          response_body?: Json | null
          status_code: number
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string
          endpoint?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          method?: string
          request_body?: Json | null
          response_body?: Json | null
          status_code?: number
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_request_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_request_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_configurations: {
        Row: {
          android_app_links_domain: string | null
          android_custom_scheme: string | null
          android_package_name: string | null
          android_play_store_id: string | null
          android_sha256_fingerprint: string | null
          app_description: string | null
          app_icon_url: string | null
          app_name: string | null
          created_at: string
          custom_url_scheme: string | null
          deep_linking_enabled: boolean
          default_currency: string | null
          id: string
          ios_app_store_id: string | null
          ios_bundle_id: string | null
          ios_custom_scheme: string | null
          ios_team_id: string | null
          universal_links_domain: string | null
          updated_at: string
          user_id: string
          web_domain: string | null
          web_fallback_url: string
        }
        Insert: {
          android_app_links_domain?: string | null
          android_custom_scheme?: string | null
          android_package_name?: string | null
          android_play_store_id?: string | null
          android_sha256_fingerprint?: string | null
          app_description?: string | null
          app_icon_url?: string | null
          app_name?: string | null
          created_at?: string
          custom_url_scheme?: string | null
          deep_linking_enabled?: boolean
          default_currency?: string | null
          id?: string
          ios_app_store_id?: string | null
          ios_bundle_id?: string | null
          ios_custom_scheme?: string | null
          ios_team_id?: string | null
          universal_links_domain?: string | null
          updated_at?: string
          user_id: string
          web_domain?: string | null
          web_fallback_url?: string
        }
        Update: {
          android_app_links_domain?: string | null
          android_custom_scheme?: string | null
          android_package_name?: string | null
          android_play_store_id?: string | null
          android_sha256_fingerprint?: string | null
          app_description?: string | null
          app_icon_url?: string | null
          app_name?: string | null
          created_at?: string
          custom_url_scheme?: string | null
          deep_linking_enabled?: boolean
          default_currency?: string | null
          id?: string
          ios_app_store_id?: string | null
          ios_bundle_id?: string | null
          ios_custom_scheme?: string | null
          ios_team_id?: string | null
          universal_links_domain?: string | null
          updated_at?: string
          user_id?: string
          web_domain?: string | null
          web_fallback_url?: string
        }
        Relationships: []
      }
      billing: {
        Row: {
          created_at: string
          id: string
          invoices: Json | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          status: Database["public"]["Enums"]["billing_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invoices?: Json | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          status?: Database["public"]["Enums"]["billing_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invoices?: Json | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          status?: Database["public"]["Enums"]["billing_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogs: {
        Row: {
          created_at: string
          google_feed_url: string | null
          id: string
          meta_feed_url: string | null
          name: string
          product_count: number
          snapchat_feed_url: string | null
          source: Database["public"]["Enums"]["catalog_source"]
          status: Database["public"]["Enums"]["catalog_status"]
          tiktok_feed_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          google_feed_url?: string | null
          id?: string
          meta_feed_url?: string | null
          name: string
          product_count?: number
          snapchat_feed_url?: string | null
          source: Database["public"]["Enums"]["catalog_source"]
          status?: Database["public"]["Enums"]["catalog_status"]
          tiktok_feed_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          google_feed_url?: string | null
          id?: string
          meta_feed_url?: string | null
          name?: string
          product_count?: number
          snapchat_feed_url?: string | null
          source?: Database["public"]["Enums"]["catalog_source"]
          status?: Database["public"]["Enums"]["catalog_status"]
          tiktok_feed_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalogs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credits_log: {
        Row: {
          action: string
          created_at: string
          credits_used: number
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          credits_used: number
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          credits_used?: number
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credits_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      external_feed_cache: {
        Row: {
          created_at: string
          external_feed_id: string
          id: string
          item_data: Json
          item_index: number
          user_id: string
        }
        Insert: {
          created_at?: string
          external_feed_id: string
          id?: string
          item_data: Json
          item_index: number
          user_id: string
        }
        Update: {
          created_at?: string
          external_feed_id?: string
          id?: string
          item_data?: Json
          item_index?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_feed_cache_external_feed_id_fkey"
            columns: ["external_feed_id"]
            isOneToOne: false
            referencedRelation: "external_feeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_feed_cache_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      external_feed_products: {
        Row: {
          created_at: string
          external_data: Json | null
          external_feed_id: string
          external_id: string
          id: string
          last_synced_at: string | null
          product_id: string | null
          sync_error: string | null
          sync_status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          external_data?: Json | null
          external_feed_id: string
          external_id: string
          id?: string
          last_synced_at?: string | null
          product_id?: string | null
          sync_error?: string | null
          sync_status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          external_data?: Json | null
          external_feed_id?: string
          external_id?: string
          id?: string
          last_synced_at?: string | null
          product_id?: string | null
          sync_error?: string | null
          sync_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_feed_products_external_feed_id_fkey"
            columns: ["external_feed_id"]
            isOneToOne: false
            referencedRelation: "external_feeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_feed_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      external_feeds: {
        Row: {
          auto_sync: boolean | null
          cache_created_at: string | null
          cache_hash: string | null
          created_at: string
          feed_description: string | null
          feed_format: string | null
          feed_link: string | null
          feed_title: string | null
          feed_type: string
          feed_url: string
          field_mappings: Json | null
          id: string
          import_filter: Json | null
          is_active: boolean | null
          last_sync_error: string | null
          last_sync_product_count: number | null
          last_sync_status: string | null
          last_synced_at: string | null
          name: string
          sync_interval_hours: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_sync?: boolean | null
          cache_created_at?: string | null
          cache_hash?: string | null
          created_at?: string
          feed_description?: string | null
          feed_format?: string | null
          feed_link?: string | null
          feed_title?: string | null
          feed_type: string
          feed_url: string
          field_mappings?: Json | null
          id?: string
          import_filter?: Json | null
          is_active?: boolean | null
          last_sync_error?: string | null
          last_sync_product_count?: number | null
          last_sync_status?: string | null
          last_synced_at?: string | null
          name: string
          sync_interval_hours?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_sync?: boolean | null
          cache_created_at?: string | null
          cache_hash?: string | null
          created_at?: string
          feed_description?: string | null
          feed_format?: string | null
          feed_link?: string | null
          feed_title?: string | null
          feed_type?: string
          feed_url?: string
          field_mappings?: Json | null
          id?: string
          import_filter?: Json | null
          is_active?: boolean | null
          last_sync_error?: string | null
          last_sync_product_count?: number | null
          last_sync_status?: string | null
          last_synced_at?: string | null
          name?: string
          sync_interval_hours?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_feeds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_import_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          external_feed_id: string
          failed_count: number | null
          field_mappings: Json | null
          id: string
          import_filter: Json | null
          imported_count: number | null
          progress_current: number | null
          progress_total: number | null
          skipped_count: number | null
          started_at: string | null
          status: string
          updated_at: string
          updated_count: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          external_feed_id: string
          failed_count?: number | null
          field_mappings?: Json | null
          id?: string
          import_filter?: Json | null
          imported_count?: number | null
          progress_current?: number | null
          progress_total?: number | null
          skipped_count?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
          updated_count?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          external_feed_id?: string
          failed_count?: number | null
          field_mappings?: Json | null
          id?: string
          import_filter?: Json | null
          imported_count?: number | null
          progress_current?: number | null
          progress_total?: number | null
          skipped_count?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
          updated_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_import_jobs_external_feed_id_fkey"
            columns: ["external_feed_id"]
            isOneToOne: false
            referencedRelation: "external_feeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_import_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_images: {
        Row: {
          created_at: string
          file_size: number | null
          height: number | null
          id: string
          image_url: string
          platform_image_id: string | null
          product_id: string
          storage_type: string
          template_id: string
          user_id: string
          width: number | null
        }
        Insert: {
          created_at?: string
          file_size?: number | null
          height?: number | null
          id?: string
          image_url: string
          platform_image_id?: string | null
          product_id: string
          storage_type: string
          template_id: string
          user_id: string
          width?: number | null
        }
        Update: {
          created_at?: string
          file_size?: number | null
          height?: number | null
          id?: string
          image_url?: string
          platform_image_id?: string | null
          product_id?: string
          storage_type?: string
          template_id?: string
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_images_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_images_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      image_generation_jobs: {
        Row: {
          completed_at: string | null
          completed_count: number | null
          created_at: string
          error_message: string | null
          failed_count: number | null
          id: string
          options: Json | null
          product_ids: string[]
          progress_current: number | null
          progress_total: number
          started_at: string | null
          status: string
          template_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_count?: number | null
          created_at?: string
          error_message?: string | null
          failed_count?: number | null
          id?: string
          options?: Json | null
          product_ids: string[]
          progress_current?: number | null
          progress_total: number
          started_at?: string | null
          status?: string
          template_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_count?: number | null
          created_at?: string
          error_message?: string | null
          failed_count?: number | null
          id?: string
          options?: Json | null
          product_ids?: string[]
          progress_current?: number | null
          progress_total?: number
          started_at?: string | null
          status?: string
          template_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "image_generation_jobs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_generation_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          catalog_id: string
          created_at: string
          id: string
          type: Database["public"]["Enums"]["media_type"]
          url: string
        }
        Insert: {
          catalog_id: string
          created_at?: string
          id?: string
          type: Database["public"]["Enums"]["media_type"]
          url: string
        }
        Update: {
          catalog_id?: string
          created_at?: string
          id?: string
          type?: Database["public"]["Enums"]["media_type"]
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "catalogs"
            referencedColumns: ["id"]
          },
        ]
      }
      product_feeds: {
        Row: {
          additional_images_config: Json | null
          created_at: string
          feed_type: string
          feed_url: string | null
          file_size: number | null
          id: string
          is_active: boolean | null
          last_generated_at: string | null
          last_generation_error: string | null
          last_generation_status: string | null
          main_image_template_id: string | null
          name: string
          platform: string
          product_count: number | null
          product_filter: Json | null
          storage_path: string | null
          updated_at: string
          use_original_main_image: boolean | null
          user_id: string
        }
        Insert: {
          additional_images_config?: Json | null
          created_at?: string
          feed_type?: string
          feed_url?: string | null
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          last_generated_at?: string | null
          last_generation_error?: string | null
          last_generation_status?: string | null
          main_image_template_id?: string | null
          name: string
          platform: string
          product_count?: number | null
          product_filter?: Json | null
          storage_path?: string | null
          updated_at?: string
          use_original_main_image?: boolean | null
          user_id: string
        }
        Update: {
          additional_images_config?: Json | null
          created_at?: string
          feed_type?: string
          feed_url?: string | null
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          last_generated_at?: string | null
          last_generation_error?: string | null
          last_generation_status?: string | null
          main_image_template_id?: string | null
          name?: string
          platform?: string
          product_count?: number | null
          product_filter?: Json | null
          storage_path?: string | null
          updated_at?: string
          use_original_main_image?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_feeds_main_image_template_id_fkey"
            columns: ["main_image_template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_feeds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sync_details: {
        Row: {
          error_message: string | null
          id: string
          platform: string | null
          product_id: string | null
          response_data: Json | null
          salla_product_id: string | null
          shopify_product_id: string
          status: string
          sync_log_id: string
          synced_at: string
        }
        Insert: {
          error_message?: string | null
          id?: string
          platform?: string | null
          product_id?: string | null
          response_data?: Json | null
          salla_product_id?: string | null
          shopify_product_id: string
          status: string
          sync_log_id: string
          synced_at?: string
        }
        Update: {
          error_message?: string | null
          id?: string
          platform?: string | null
          product_id?: string | null
          response_data?: Json | null
          salla_product_id?: string | null
          shopify_product_id?: string
          status?: string
          sync_log_id?: string
          synced_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_sync_details_sync_log_id_fkey"
            columns: ["sync_log_id"]
            isOneToOne: false
            referencedRelation: "sync_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          additional_images: string[] | null
          availability: string | null
          bestseller: boolean | null
          brand: string | null
          catalog_id: string | null
          category: string | null
          color: string | null
          condition: string | null
          created_at: string
          currency: string | null
          custom_details: Json | null
          custom_labels: Json | null
          description: string | null
          discount_price: number | null
          gender: string | null
          id: string
          main_image_url: string | null
          manual_image: string | null
          material: string | null
          meta_description: string | null
          meta_title: string | null
          off_percent: number | null
          price: number | null
          product_id: string | null
          product_url: string | null
          sale_price: number | null
          save_price: number | null
          season: string | null
          size: string | null
          sku: string
          stock_quantity: number | null
          target_country: string[] | null
          title: string
          updated_at: string
          user_id: string
          video_urls: string[] | null
          weight: string | null
        }
        Insert: {
          additional_images?: string[] | null
          availability?: string | null
          bestseller?: boolean | null
          brand?: string | null
          catalog_id?: string | null
          category?: string | null
          color?: string | null
          condition?: string | null
          created_at?: string
          currency?: string | null
          custom_details?: Json | null
          custom_labels?: Json | null
          description?: string | null
          discount_price?: number | null
          gender?: string | null
          id?: string
          main_image_url?: string | null
          manual_image?: string | null
          material?: string | null
          meta_description?: string | null
          meta_title?: string | null
          off_percent?: number | null
          price?: number | null
          product_id?: string | null
          product_url?: string | null
          sale_price?: number | null
          save_price?: number | null
          season?: string | null
          size?: string | null
          sku: string
          stock_quantity?: number | null
          target_country?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          video_urls?: string[] | null
          weight?: string | null
        }
        Update: {
          additional_images?: string[] | null
          availability?: string | null
          bestseller?: boolean | null
          brand?: string | null
          catalog_id?: string | null
          category?: string | null
          color?: string | null
          condition?: string | null
          created_at?: string
          currency?: string | null
          custom_details?: Json | null
          custom_labels?: Json | null
          description?: string | null
          discount_price?: number | null
          gender?: string | null
          id?: string
          main_image_url?: string | null
          manual_image?: string | null
          material?: string | null
          meta_description?: string | null
          meta_title?: string | null
          off_percent?: number | null
          price?: number | null
          product_id?: string | null
          product_url?: string | null
          sale_price?: number | null
          save_price?: number | null
          season?: string | null
          size?: string | null
          sku?: string
          stock_quantity?: number | null
          target_country?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          video_urls?: string[] | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "catalogs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          addon_credits: number
          created_at: string
          email: string
          id: string
          monthly_credits: number
          plan: Database["public"]["Enums"]["subscription_plan"]
          renewal_date: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          addon_credits?: number
          created_at?: string
          email: string
          id: string
          monthly_credits?: number
          plan?: Database["public"]["Enums"]["subscription_plan"]
          renewal_date?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          addon_credits?: number
          created_at?: string
          email?: string
          id?: string
          monthly_credits?: number
          plan?: Database["public"]["Enums"]["subscription_plan"]
          renewal_date?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      salla_integrations: {
        Row: {
          access_token: string
          created_at: string
          id: string
          is_active: boolean | null
          is_pending: boolean | null
          last_sync_at: string | null
          merchant_id: string
          next_sync_at: string | null
          pending_email: string | null
          refresh_token: string | null
          scope: string
          store_domain: string
          sync_enabled: boolean | null
          sync_schedule: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string | null
          webhook_api_key_encrypted: string | null
          webhook_enabled: boolean | null
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          access_token: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_pending?: boolean | null
          last_sync_at?: string | null
          merchant_id: string
          next_sync_at?: string | null
          pending_email?: string | null
          refresh_token?: string | null
          scope: string
          store_domain: string
          sync_enabled?: boolean | null
          sync_schedule?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string | null
          webhook_api_key_encrypted?: string | null
          webhook_enabled?: boolean | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_pending?: boolean | null
          last_sync_at?: string | null
          merchant_id?: string
          next_sync_at?: string | null
          pending_email?: string | null
          refresh_token?: string | null
          scope?: string
          store_domain?: string
          sync_enabled?: boolean | null
          sync_schedule?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string | null
          webhook_api_key_encrypted?: string | null
          webhook_enabled?: boolean | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salla_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shopify_integrations: {
        Row: {
          access_token: string
          created_at: string
          id: string
          is_active: boolean | null
          is_pending: boolean | null
          last_sync_at: string | null
          next_sync_at: string | null
          pending_email: string | null
          scope: string
          shop_domain: string
          sync_enabled: boolean | null
          sync_schedule: string | null
          updated_at: string
          user_id: string
          webhook_api_key_encrypted: string | null
          webhook_enabled: boolean | null
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          access_token: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_pending?: boolean | null
          last_sync_at?: string | null
          next_sync_at?: string | null
          pending_email?: string | null
          scope: string
          shop_domain: string
          sync_enabled?: boolean | null
          sync_schedule?: string | null
          updated_at?: string
          user_id: string
          webhook_api_key_encrypted?: string | null
          webhook_enabled?: boolean | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_pending?: boolean | null
          last_sync_at?: string | null
          next_sync_at?: string | null
          pending_email?: string | null
          scope?: string
          shop_domain?: string
          sync_enabled?: boolean | null
          sync_schedule?: string | null
          updated_at?: string
          user_id?: string
          webhook_api_key_encrypted?: string | null
          webhook_enabled?: boolean | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopify_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: string
          integration_id: string
          metadata: Json | null
          platform: string | null
          products_failed: number | null
          products_synced: number | null
          started_at: string
          status: string
          sync_type: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          integration_id: string
          metadata?: Json | null
          platform?: string | null
          products_failed?: number | null
          products_synced?: number | null
          started_at?: string
          status: string
          sync_type: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          integration_id?: string
          metadata?: Json | null
          platform?: string | null
          products_failed?: number | null
          products_synced?: number | null
          started_at?: string
          status?: string
          sync_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "shopify_integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          canvas_data: Json
          canvas_height: number
          canvas_width: number
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          canvas_data: Json
          canvas_height: number
          canvas_width: number
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          canvas_data?: Json
          canvas_height?: number
          canvas_width?: number
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_my_sample_products: { Args: never; Returns: string }
      create_sample_products: { Args: never; Returns: string }
      create_sample_products_for_user: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      create_sync_log:
        | {
            Args: {
              p_integration_id: string
              p_status?: string
              p_sync_type: string
              p_user_id: string
            }
            Returns: string
          }
        | {
            Args: {
              p_integration_id: string
              p_platform?: string
              p_status?: string
              p_sync_type: string
              p_user_id: string
            }
            Returns: string
          }
      deduct_credits: {
        Args: { p_action: string; p_credits: number; p_user_id: string }
        Returns: boolean
      }
      get_next_sync_time: { Args: { p_schedule: string }; Returns: string }
      log_api_request: {
        Args: {
          p_api_key_id: string
          p_endpoint: string
          p_error_message?: string
          p_ip_address?: string
          p_method: string
          p_request_body?: Json
          p_response_body?: Json
          p_status_code: number
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      update_sync_log: {
        Args: {
          p_error_message?: string
          p_log_id: string
          p_products_failed?: number
          p_products_synced?: number
          p_status: string
        }
        Returns: undefined
      }
      validate_api_key: {
        Args: { p_key_hash: string }
        Returns: {
          api_key_id: string
          user_id: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "member"
      billing_status: "active" | "expired" | "canceled"
      catalog_source:
        | "salla"
        | "zid"
        | "shopify"
        | "woocommerce"
        | "xml"
        | "csv"
      catalog_status: "active" | "in_sync" | "error"
      media_type:
        | "template_square"
        | "template_story"
        | "manual_image"
        | "manual_video"
      subscription_plan: "basic" | "pro" | "advanced" | "enterprise"
      user_role: "admin" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "member"],
      billing_status: ["active", "expired", "canceled"],
      catalog_source: ["salla", "zid", "shopify", "woocommerce", "xml", "csv"],
      catalog_status: ["active", "in_sync", "error"],
      media_type: [
        "template_square",
        "template_story",
        "manual_image",
        "manual_video",
      ],
      subscription_plan: ["basic", "pro", "advanced", "enterprise"],
      user_role: ["admin", "member"],
    },
  },
} as const
