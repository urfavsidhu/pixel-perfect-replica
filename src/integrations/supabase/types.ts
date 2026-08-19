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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      access_requests: {
        Row: {
          access_key_used_hash: string
          created_at: string
          expires_at: string | null
          id: string
          requester_email: string
          requester_name: string
          requester_organization: string | null
          status: Database["public"]["Enums"]["access_request_status"]
          student_id: string
        }
        Insert: {
          access_key_used_hash: string
          created_at?: string
          expires_at?: string | null
          id?: string
          requester_email: string
          requester_name: string
          requester_organization?: string | null
          status?: Database["public"]["Enums"]["access_request_status"]
          student_id: string
        }
        Update: {
          access_key_used_hash?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          requester_email?: string
          requester_name?: string
          requester_organization?: string | null
          status?: Database["public"]["Enums"]["access_request_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          target_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          target_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          target_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_hash: string | null
          certificate_id: string
          created_at: string
          degree: string | null
          department: string | null
          grade_or_cgpa: string | null
          graduation_year: number | null
          id: string
          institution_id: string | null
          issue_date: string | null
          last_verified_at: string | null
          qr_code_data: string | null
          revocation_reason: string | null
          status: Database["public"]["Enums"]["certificate_status"]
          student_id: string | null
          student_name: string
          trust_score: number
          uploaded_by: Database["public"]["Enums"]["upload_source"]
          verification_count: number
        }
        Insert: {
          certificate_hash?: string | null
          certificate_id: string
          created_at?: string
          degree?: string | null
          department?: string | null
          grade_or_cgpa?: string | null
          graduation_year?: number | null
          id?: string
          institution_id?: string | null
          issue_date?: string | null
          last_verified_at?: string | null
          qr_code_data?: string | null
          revocation_reason?: string | null
          status?: Database["public"]["Enums"]["certificate_status"]
          student_id?: string | null
          student_name: string
          trust_score?: number
          uploaded_by?: Database["public"]["Enums"]["upload_source"]
          verification_count?: number
        }
        Update: {
          certificate_hash?: string | null
          certificate_id?: string
          created_at?: string
          degree?: string | null
          department?: string | null
          grade_or_cgpa?: string | null
          graduation_year?: number | null
          id?: string
          institution_id?: string | null
          issue_date?: string | null
          last_verified_at?: string | null
          qr_code_data?: string | null
          revocation_reason?: string | null
          status?: Database["public"]["Enums"]["certificate_status"]
          student_id?: string | null
          student_name?: string
          trust_score?: number
          uploaded_by?: Database["public"]["Enums"]["upload_source"]
          verification_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "certificates_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_cases: {
        Row: {
          assigned_to: string | null
          certificate_id: string | null
          created_at: string
          id: string
          issue_description: string
          resolved_at: string | null
          status: Database["public"]["Enums"]["fraud_case_status"]
        }
        Insert: {
          assigned_to?: string | null
          certificate_id?: string | null
          created_at?: string
          id?: string
          issue_description: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["fraud_case_status"]
        }
        Update: {
          assigned_to?: string | null
          certificate_id?: string | null
          created_at?: string
          id?: string
          issue_description?: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["fraud_case_status"]
        }
        Relationships: [
          {
            foreignKeyName: "fraud_cases_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_cases_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "certificates"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          accreditation_id: string | null
          api_key_hash: string | null
          contact_email: string | null
          created_at: string
          id: string
          name: string
          status: string
        }
        Insert: {
          accreditation_id?: string | null
          api_key_hash?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          name: string
          status?: string
        }
        Update: {
          accreditation_id?: string | null
          api_key_hash?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          name?: string
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          access_key_hash: string | null
          access_key_last_regenerated_at: string | null
          created_at: string
          display_id: string
          email: string
          id: string
          institution_id: string | null
          name: string
        }
        Insert: {
          access_key_hash?: string | null
          access_key_last_regenerated_at?: string | null
          created_at?: string
          display_id: string
          email: string
          id: string
          institution_id?: string | null
          name: string
        }
        Update: {
          access_key_hash?: string | null
          access_key_last_regenerated_at?: string | null
          created_at?: string
          display_id?: string
          email?: string
          id?: string
          institution_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verify_rate_limits: {
        Row: {
          ip_address: string
          request_count: number
          window_start: string
        }
        Insert: {
          ip_address: string
          request_count?: number
          window_start?: string
        }
        Update: {
          ip_address?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_institution_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      public_verify_certificate: {
        Args: { _certificate_id: string; _ip: string }
        Returns: string
      }
    }
    Enums: {
      access_request_status: "pending" | "allowed" | "denied" | "expired"
      app_role: "student" | "institution" | "admin"
      certificate_status: "pending" | "verified" | "revoked" | "rejected"
      fraud_case_status: "open" | "investigating" | "resolved"
      upload_source: "self" | "institution"
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
      access_request_status: ["pending", "allowed", "denied", "expired"],
      app_role: ["student", "institution", "admin"],
      certificate_status: ["pending", "verified", "revoked", "rejected"],
      fraud_case_status: ["open", "investigating", "resolved"],
      upload_source: ["self", "institution"],
    },
  },
} as const
