export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows automatically instantiating createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      assessments: {
        Row: {
          age: string | null
          created_at: string
          expressionCheck: Json | null
          gender: string | null
          goal: string | null
          meds: string | null
          mood: string | null
          otherSymptoms: string | null
          physicalDistress: string | null
          physicalDistressNotes: string | null
          sleepQuality: number | null
          soughtHelpBefore: string | null
          soundCheck: Json | null
          stressLevel: number | null
          takingMeds: string | null
          updated_at: string
          user_id: string
          weight: number | null
          weightUnit: string | null
        }
        Insert: {
          age?: string | null
          created_at?: string
          expressionCheck?: Json | null
          gender?: string | null
          goal?: string | null
          meds?: string | null
          mood?: string | null
          otherSymptoms?: string | null
          physicalDistress?: string | null
          physicalDistressNotes?: string | null
          sleepQuality?: number | null
          soughtHelpBefore?: string | null
          soundCheck?: Json | null
          stressLevel?: number | null
          takingMeds?: string | null
          updated_at?: string
          user_id: string
          weight?: number | null
          weightUnit?: string | null
        }
        Update: {
          age?: string | null
          created_at?: string
          expressionCheck?: Json | null
          gender?: string | null
          goal?: string | null
          meds?: string | null
          mood?: string | null
          otherSymptoms?: string | null
          physicalDistress?: string | null
          physicalDistressNotes?: string | null
          sleepQuality?: number | null
          soughtHelpBefore?: string | null
          soundCheck?: Json | null
          stressLevel?: number | null
          takingMeds?: string | null
          updated_at?: string
          user_id?: string
          weight?: number | null
          weightUnit?: string | null
        }
        Relationships: []
      }
      chat_histories: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          issue_key: string
          messages: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          issue_key: string
          messages?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          issue_key?: string
          messages?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      journals: {
        Row: {
          content: string | null
          created_at: string
          id: string
          mood: string | null
          promptId: string | null
          tags: Json | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          mood?: string | null
          promptId?: string | null
          tags?: Json | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          mood?: string | null
          promptId?: string | null
          tags?: Json | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mindfulness: {
        Row: {
          created_at: string
          date_iso: string
          id: string
          note: string | null
          seconds: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_iso?: string
          id?: string
          note?: string | null
          seconds?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_iso?: string
          id?: string
          note?: string | null
          seconds?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      moods: {
        Row: {
          created_at: string
          energy: number | null
          id: string
          label: string | null
          mood: string | null
          note: string | null
          stress: number | null
          tags: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          energy?: number | null
          id?: string
          label?: string | null
          mood?: string | null
          note?: string | null
          stress?: number | null
          tags?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          energy?: number | null
          id?: string
          label?: string | null
          mood?: string | null
          note?: string | null
          stress?: number | null
          tags?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          intention: string | null | undefined
          name: string | null
          routine: string | null
          selectedIssues: Json | null
          subscription_expiry: string | null
          subscription_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          intention?: string | null
          name?: string | null
          routine?: string | null
          selectedIssues?: Json | null
          subscription_expiry?: string | null
          subscription_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          intention?: string | null
          name?: string | null
          routine?: string | null
          selectedIssues?: Json | null
          subscription_expiry?: string | null
          subscription_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sleep: {
        Row: {
          awakenings: number | null
          created_at: string
          duration: number | null
          endISO: string | null
          id: string
          notes: string | null
          quality: number | null
          startISO: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          awakenings?: number | null
          created_at?: string
          duration?: number | null
          endISO?: string | null
          id?: string
          notes?: string | null
          quality?: number | null
          startISO?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          awakenings?: number | null
          created_at?: string
          duration?: number | null
          endISO?: string | null
          id?: string
          notes?: string | null
          quality?: number | null
          startISO?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stress_histories: {
        Row: {
          created_at: string
          date: string
          exerciseId: string | null
          id: string
          title: string | null
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          exerciseId?: string | null
          id?: string
          title?: string | null
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          exerciseId?: string | null
          id?: string
          title?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stress_kits: {
        Row: {
          created_at: string
          helpfulActions: Json | null
          lastCheckIn: string | null
          level: number | null
          notes: string | null
          people: Json | null
          quickPhrase: string | null
          triggers: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          helpfulActions?: Json | null
          lastCheckIn?: string | null
          level?: number | null
          notes?: string | null
          people?: Json | null
          quickPhrase?: string | null
          triggers?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          helpfulActions?: Json | null
          lastCheckIn?: string | null
          level?: number | null
          notes?: string | null
          people?: Json | null
          quickPhrase?: string | null
          triggers?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      safe_float: { Args: { v: string }; Returns: number }
      safe_int: { Args: { v: string }; Returns: number }
      safe_ts: { Args: { v: string }; Returns: string }
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
