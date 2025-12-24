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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          created_at: string
          file_name: string | null
          file_size: number | null
          file_url: string
          height: number | null
          id: string
          metadata: Json | null
          mime_type: string | null
          order_index: number
          project_id: string
          type: Database["public"]["Enums"]["asset_type"]
          width: number | null
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_url: string
          height?: number | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          order_index?: number
          project_id: string
          type: Database["public"]["Enums"]["asset_type"]
          width?: number | null
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string
          height?: number | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          order_index?: number
          project_id?: string
          type?: Database["public"]["Enums"]["asset_type"]
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      code_exports: {
        Row: {
          created_at: string
          id: string
          language: Database["public"]["Enums"]["export_language"]
          project_id: string
          zip_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          language: Database["public"]["Enums"]["export_language"]
          project_id: string
          zip_url: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: Database["public"]["Enums"]["export_language"]
          project_id?: string
          zip_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "code_exports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      keyframes: {
        Row: {
          created_at: string
          easing: string | null
          id: string
          layer_id: string
          properties: Json
          time_seconds: number
        }
        Insert: {
          created_at?: string
          easing?: string | null
          id?: string
          layer_id: string
          properties?: Json
          time_seconds: number
        }
        Update: {
          created_at?: string
          easing?: string | null
          id?: string
          layer_id?: string
          properties?: Json
          time_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "keyframes_layer_id_fkey"
            columns: ["layer_id"]
            isOneToOne: false
            referencedRelation: "timeline_layers"
            referencedColumns: ["id"]
          },
        ]
      }
      particle_configs: {
        Row: {
          camera_config: Json | null
          color_mode: string
          created_at: string
          depth_enabled: boolean
          id: string
          particle_count: number
          particle_size: number
          project_id: string
          shader_config: Json | null
          transition_style: string
          updated_at: string
        }
        Insert: {
          camera_config?: Json | null
          color_mode?: string
          created_at?: string
          depth_enabled?: boolean
          id?: string
          particle_count?: number
          particle_size?: number
          project_id: string
          shader_config?: Json | null
          transition_style?: string
          updated_at?: string
        }
        Update: {
          camera_config?: Json | null
          color_mode?: string
          created_at?: string
          depth_enabled?: boolean
          id?: string
          particle_count?: number
          particle_size?: number
          project_id?: string
          shader_config?: Json | null
          transition_style?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "particle_configs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          credits_remaining: number
          email: string | null
          full_name: string | null
          id: string
          plan: Database["public"]["Enums"]["plan_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          credits_remaining?: number
          email?: string | null
          full_name?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          credits_remaining?: number
          email?: string | null
          full_name?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["project_status"]
          thumbnail_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["project_status"]
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["project_status"]
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      render_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          fps: number
          id: string
          priority: number
          progress: number
          project_id: string
          resolution: string
          started_at: string | null
          status: Database["public"]["Enums"]["render_status"]
          user_id: string
          worker_type: Database["public"]["Enums"]["worker_type"]
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          fps?: number
          id?: string
          priority?: number
          progress?: number
          project_id: string
          resolution?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["render_status"]
          user_id: string
          worker_type?: Database["public"]["Enums"]["worker_type"]
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          fps?: number
          id?: string
          priority?: number
          progress?: number
          project_id?: string
          resolution?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["render_status"]
          user_id?: string
          worker_type?: Database["public"]["Enums"]["worker_type"]
        }
        Relationships: [
          {
            foreignKeyName: "render_jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      render_outputs: {
        Row: {
          codec: string | null
          created_at: string
          duration_seconds: number | null
          file_size: number | null
          fps: number
          id: string
          render_job_id: string
          resolution: string
          video_url: string
        }
        Insert: {
          codec?: string | null
          created_at?: string
          duration_seconds?: number | null
          file_size?: number | null
          fps: number
          id?: string
          render_job_id: string
          resolution: string
          video_url: string
        }
        Update: {
          codec?: string | null
          created_at?: string
          duration_seconds?: number | null
          file_size?: number | null
          fps?: number
          id?: string
          render_job_id?: string
          resolution?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "render_outputs_render_job_id_fkey"
            columns: ["render_job_id"]
            isOneToOne: false
            referencedRelation: "render_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          credits_monthly: number
          credits_used: number
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: Database["public"]["Enums"]["plan_type"]
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_monthly?: number
          credits_used?: number
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_type"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_monthly?: number
          credits_used?: number
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_type"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      timeline_layers: {
        Row: {
          created_at: string
          id: string
          layer_type: Database["public"]["Enums"]["layer_type"]
          locked: boolean
          name: string | null
          order_index: number
          timeline_id: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          layer_type: Database["public"]["Enums"]["layer_type"]
          locked?: boolean
          name?: string | null
          order_index?: number
          timeline_id: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          layer_type?: Database["public"]["Enums"]["layer_type"]
          locked?: boolean
          name?: string | null
          order_index?: number
          timeline_id?: string
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "timeline_layers_timeline_id_fkey"
            columns: ["timeline_id"]
            isOneToOne: false
            referencedRelation: "timelines"
            referencedColumns: ["id"]
          },
        ]
      }
      timelines: {
        Row: {
          background_color: string
          created_at: string
          duration_seconds: number
          fps: number
          id: string
          project_id: string
          updated_at: string
        }
        Insert: {
          background_color?: string
          created_at?: string
          duration_seconds?: number
          fps?: number
          id?: string
          project_id: string
          updated_at?: string
        }
        Update: {
          background_color?: string
          created_at?: string
          duration_seconds?: number
          fps?: number
          id?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timelines_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_logs: {
        Row: {
          action: Database["public"]["Enums"]["usage_action"]
          created_at: string
          credits_used: number
          id: string
          metadata: Json | null
          project_id: string | null
          user_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["usage_action"]
          created_at?: string
          credits_used?: number
          id?: string
          metadata?: Json | null
          project_id?: string | null
          user_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["usage_action"]
          created_at?: string
          credits_used?: number
          id?: string
          metadata?: Json | null
          project_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "admin" | "moderator" | "user"
      asset_type: "image" | "audio" | "frame" | "video" | "code"
      export_language: "js" | "ts" | "react" | "html"
      layer_type: "image" | "particle" | "camera" | "effect"
      plan_type: "free" | "pro" | "studio" | "enterprise"
      project_status: "draft" | "rendering" | "completed" | "failed"
      render_status: "queued" | "processing" | "completed" | "failed"
      subscription_status: "active" | "cancelled" | "expired" | "past_due"
      usage_action: "render" | "upload" | "export" | "preview"
      worker_type: "cpu" | "gpu"
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
      app_role: ["admin", "moderator", "user"],
      asset_type: ["image", "audio", "frame", "video", "code"],
      export_language: ["js", "ts", "react", "html"],
      layer_type: ["image", "particle", "camera", "effect"],
      plan_type: ["free", "pro", "studio", "enterprise"],
      project_status: ["draft", "rendering", "completed", "failed"],
      render_status: ["queued", "processing", "completed", "failed"],
      subscription_status: ["active", "cancelled", "expired", "past_due"],
      usage_action: ["render", "upload", "export", "preview"],
      worker_type: ["cpu", "gpu"],
    },
  },
} as const
