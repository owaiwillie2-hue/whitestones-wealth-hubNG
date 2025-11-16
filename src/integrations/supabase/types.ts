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
      account_balances: {
        Row: {
          account_active_since: string | null
          id: string
          main_balance: number | null
          profit_balance: number | null
          total_deposited: number | null
          total_withdrawn: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_active_since?: string | null
          id?: string
          main_balance?: number | null
          profit_balance?: number | null
          total_deposited?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_active_since?: string | null
          id?: string
          main_balance?: number | null
          profit_balance?: number | null
          total_deposited?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          location: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          location?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          location?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          payment_method: string | null
          proof_url: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          transaction_hash: string | null
          user_id: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          payment_method?: string | null
          proof_url?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          transaction_hash?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          payment_method?: string | null
          proof_url?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          transaction_hash?: string | null
          user_id?: string
        }
        Relationships: []
      }
      investment_plans: {
        Row: {
          created_at: string | null
          description: string | null
          duration_days: number
          id: string
          is_active: boolean | null
          max_amount: number | null
          min_amount: number
          name: string
          roi_percentage: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_days: number
          id?: string
          is_active?: boolean | null
          max_amount?: number | null
          min_amount: number
          name: string
          roi_percentage: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_days?: number
          id?: string
          is_active?: boolean | null
          max_amount?: number | null
          min_amount?: number
          name?: string
          roi_percentage?: number
        }
        Relationships: []
      }
      investments: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          end_date: string
          expected_profit: number
          id: string
          last_profit_payout: string | null
          plan_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["investment_status"] | null
          user_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          end_date: string
          expected_profit: number
          id?: string
          last_profit_payout?: string | null
          plan_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["investment_status"] | null
          user_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          end_date?: string
          expected_profit?: number
          id?: string
          last_profit_payout?: string | null
          plan_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["investment_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "investment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_documents: {
        Row: {
          id: string
          id_back_url: string | null
          id_document_url: string | null
          id_front_url: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          selfie_url: string | null
          status: Database["public"]["Enums"]["kyc_status"] | null
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          id_back_url?: string | null
          id_document_url?: string | null
          id_front_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_url?: string | null
          status?: Database["public"]["Enums"]["kyc_status"] | null
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          id_back_url?: string | null
          id_document_url?: string | null
          id_front_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_url?: string | null
          status?: Database["public"]["Enums"]["kyc_status"] | null
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          full_name: string
          id: string
          phone_number: string | null
          profile_picture: string | null
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          full_name: string
          id?: string
          phone_number?: string | null
          profile_picture?: string | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          full_name?: string
          id?: string
          phone_number?: string | null
          profile_picture?: string | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          bonus_amount: number | null
          bonus_paid: boolean | null
          created_at: string | null
          id: string
          referred_id: string
          referrer_id: string
        }
        Insert: {
          bonus_amount?: number | null
          bonus_paid?: boolean | null
          created_at?: string | null
          id?: string
          referred_id: string
          referrer_id: string
        }
        Update: {
          bonus_amount?: number | null
          bonus_paid?: boolean | null
          created_at?: string | null
          id?: string
          referred_id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      website_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      withdrawal_accounts: {
        Row: {
          account_details: Json
          account_name: string | null
          account_type: Database["public"]["Enums"]["account_type"]
          created_at: string | null
          id: string
          is_default: boolean | null
          user_id: string
        }
        Insert: {
          account_details: Json
          account_name?: string | null
          account_type: Database["public"]["Enums"]["account_type"]
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          user_id: string
        }
        Update: {
          account_details?: Json
          account_name?: string | null
          account_type?: Database["public"]["Enums"]["account_type"]
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          user_id: string
          withdrawal_account_id: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          user_id: string
          withdrawal_account_id?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          user_id?: string
          withdrawal_account_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_withdrawal_account_id_fkey"
            columns: ["withdrawal_account_id"]
            isOneToOne: false
            referencedRelation: "withdrawal_accounts"
            referencedColumns: ["id"]
          },
        ]
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
      process_investment_profits: { Args: never; Returns: undefined }
    }
    Enums: {
      account_type: "bank" | "crypto" | "paypal" | "payoneer"
      app_role: "user" | "admin"
      investment_status: "active" | "completed" | "cancelled"
      kyc_status: "pending" | "under_review" | "approved" | "rejected"
      transaction_status: "pending" | "approved" | "rejected"
      transaction_type:
        | "deposit"
        | "withdrawal"
        | "investment"
        | "profit"
        | "bonus"
        | "referral"
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
      account_type: ["bank", "crypto", "paypal", "payoneer"],
      app_role: ["user", "admin"],
      investment_status: ["active", "completed", "cancelled"],
      kyc_status: ["pending", "under_review", "approved", "rejected"],
      transaction_status: ["pending", "approved", "rejected"],
      transaction_type: [
        "deposit",
        "withdrawal",
        "investment",
        "profit",
        "bonus",
        "referral",
      ],
    },
  },
} as const
