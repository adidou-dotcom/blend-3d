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
      dish_orders: {
        Row: {
          created_at: string
          cuisine_type: string | null
          currency: string
          delivery_note: string | null
          delivery_url: string | null
          description: string | null
          dish_name: string
          id: string
          internal_reference: string | null
          is_demo: boolean
          price_charged: number
          restaurant_profile_id: string
          status: Database["public"]["Enums"]["dish_order_status"]
          target_use_case: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cuisine_type?: string | null
          currency?: string
          delivery_note?: string | null
          delivery_url?: string | null
          description?: string | null
          dish_name: string
          id?: string
          internal_reference?: string | null
          is_demo?: boolean
          price_charged?: number
          restaurant_profile_id: string
          status?: Database["public"]["Enums"]["dish_order_status"]
          target_use_case?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cuisine_type?: string | null
          currency?: string
          delivery_note?: string | null
          delivery_url?: string | null
          description?: string | null
          dish_name?: string
          id?: string
          internal_reference?: string | null
          is_demo?: boolean
          price_charged?: number
          restaurant_profile_id?: string
          status?: Database["public"]["Enums"]["dish_order_status"]
          target_use_case?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dish_orders_restaurant_profile_id_fkey"
            columns: ["restaurant_profile_id"]
            isOneToOne: false
            referencedRelation: "restaurant_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dish_photos: {
        Row: {
          created_at: string
          dish_order_id: string
          id: string
          image_url: string
        }
        Insert: {
          created_at?: string
          dish_order_id: string
          id?: string
          image_url: string
        }
        Update: {
          created_at?: string
          dish_order_id?: string
          id?: string
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "dish_photos_dish_order_id_fkey"
            columns: ["dish_order_id"]
            isOneToOne: false
            referencedRelation: "dish_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_records: {
        Row: {
          amount: number
          created_at: string
          currency: string
          dish_order_id: string
          id: string
          provider: string | null
          provider_payment_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          dish_order_id: string
          id?: string
          provider?: string | null
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          dish_order_id?: string
          id?: string
          provider?: string | null
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_records_dish_order_id_fkey"
            columns: ["dish_order_id"]
            isOneToOne: false
            referencedRelation: "dish_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_profiles: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          logo_url: string | null
          onboarding_completed: boolean
          restaurant_name: string
          updated_at: string
          user_id: string
          website_url: string | null
          whatsapp_number: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          onboarding_completed?: boolean
          restaurant_name: string
          updated_at?: string
          user_id: string
          website_url?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          onboarding_completed?: boolean
          restaurant_name?: string
          updated_at?: string
          user_id?: string
          website_url?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "restaurant_owner"
      dish_order_status:
        | "NEW"
        | "IN_PRODUCTION"
        | "READY"
        | "DELIVERED"
        | "CANCELLED"
      payment_status: "PENDING" | "PAID" | "FAILED"
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
      app_role: ["admin", "restaurant_owner"],
      dish_order_status: [
        "NEW",
        "IN_PRODUCTION",
        "READY",
        "DELIVERED",
        "CANCELLED",
      ],
      payment_status: ["PENDING", "PAID", "FAILED"],
    },
  },
} as const
