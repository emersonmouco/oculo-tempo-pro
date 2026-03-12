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
      customers: {
        Row: {
          id: string
          person_id: string
          created_at: string
        }
        Insert: {
          id?: string
          person_id: string
          created_at?: string
        }
        Update: {
          id?: string
          person_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: true
            referencedRelation: "persons"
            referencedColumns: ["id"]
          }
        ]
      }
      legal_persons: {
        Row: {
          business_activity_code: string | null
          cnpj: string | null
          company_name: string
          contact_email: string | null
          contact_person: string | null
          created_at: string
          delivery_time: string | null
          fax_number: string | null
          id: string
          is_active: boolean
          is_tax_exempt: boolean
          legal_representative_name: string | null
          legal_representative_phone: string | null
          municipal_registration: string | null
          observations: string | null
          payment_terms: string | null
          person_id: string
          state_registration: string | null
          supplier_code: string | null
          supplier_id: string | null
          supplier_since: string | null
          tax_regime: string | null
          trade_name: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          business_activity_code?: string | null
          cnpj?: string | null
          company_name: string
          contact_email?: string | null
          contact_person?: string | null
          created_at?: string
          delivery_time?: string | null
          fax_number?: string | null
          id?: string
          is_active?: boolean
          is_tax_exempt?: boolean
          legal_representative_name?: string | null
          legal_representative_phone?: string | null
          municipal_registration?: string | null
          observations?: string | null
          payment_terms?: string | null
          person_id: string
          state_registration?: string | null
          supplier_code?: string | null
          supplier_id?: string | null
          supplier_since?: string | null
          tax_regime?: string | null
          trade_name?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          business_activity_code?: string | null
          cnpj?: string | null
          company_name?: string
          contact_email?: string | null
          contact_person?: string | null
          created_at?: string
          delivery_time?: string | null
          fax_number?: string | null
          id?: string
          is_active?: boolean
          is_tax_exempt?: boolean
          legal_representative_name?: string | null
          legal_representative_phone?: string | null
          municipal_registration?: string | null
          observations?: string | null
          payment_terms?: string | null
          person_id?: string
          state_registration?: string | null
          supplier_code?: string | null
          supplier_id?: string | null
          supplier_since?: string | null
          tax_regime?: string | null
          trade_name?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_persons_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
        ]
      }
      persons: {
        Row: {
          birth_date: string
          created_at: string
          email: string | null
          id: string
          mobile_phone: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          birth_date: string
          created_at?: string
          email?: string | null
          id?: string
          mobile_phone: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string
          created_at?: string
          email?: string | null
          id?: string
          mobile_phone?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          barcode: string | null
          brand: string | null
          category: string | null
          color: string | null
          cost_price: number | null
          created_at: string
          description: string | null
          dimensions: string | null
          has_serial_number: boolean
          id: string
          is_active: boolean
          material: string | null
          max_stock_level: number | null
          min_stock_level: number | null
          model: string | null
          name: string
          observations: string | null
          sale_price: number
          size: string | null
          sku: string | null
          stock_quantity: number
          supplier_id: string | null
          unit_of_measure: string | null
          updated_at: string
          warranty_period_months: number | null
          weight: number | null
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          category?: string | null
          color?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          has_serial_number?: boolean
          id?: string
          is_active?: boolean
          material?: string | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          model?: string | null
          name: string
          observations?: string | null
          sale_price: number
          size?: string | null
          sku?: string | null
          stock_quantity?: number
          supplier_id?: string | null
          unit_of_measure?: string | null
          updated_at?: string
          warranty_period_months?: number | null
          weight?: number | null
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          category?: string | null
          color?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          has_serial_number?: boolean
          id?: string
          is_active?: boolean
          material?: string | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          model?: string | null
          name?: string
          observations?: string | null
          sale_price?: number
          size?: string | null
          sku?: string | null
          stock_quantity?: number
          supplier_id?: string | null
          unit_of_measure?: string | null
          updated_at?: string
          warranty_period_months?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "legal_persons"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          product_id: string
          quantity: number
          unit_price: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          sale_id: string
          product_id: string
          quantity?: number
          unit_price: number
          subtotal: number
          created_at?: string
        }
        Update: {
          id?: string
          sale_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          subtotal?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      sales: {
        Row: {
          id: string
          sale_number: string | null
          person_id: string | null
          total: number
          status: string
          payment_method: string | null
          payment_details: string | null
          seller_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sale_number?: string | null
          person_id?: string | null
          total?: number
          status?: string
          payment_method?: string | null
          payment_details?: string | null
          seller_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sale_number?: string | null
          person_id?: string | null
          total?: number
          status?: string
          payment_method?: string | null
          payment_details?: string | null
          seller_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
