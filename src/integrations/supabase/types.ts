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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_my_sample_products: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      create_sample_products_for_user: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      deduct_credits: {
        Args: { p_action: string; p_credits: number; p_user_id: string }
        Returns: boolean
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
