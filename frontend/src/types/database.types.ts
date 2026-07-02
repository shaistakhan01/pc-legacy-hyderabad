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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      banquet_bookings: {
        Row: {
          add_on_ids: string[]
          booking_id: string
          end_time: string
          event_date: string
          event_type: string | null
          guest_count: number | null
          hall_id: string
          id: string
          start_time: string
        }
        Insert: {
          add_on_ids?: string[]
          booking_id: string
          end_time: string
          event_date: string
          event_type?: string | null
          guest_count?: number | null
          hall_id: string
          id?: string
          start_time: string
        }
        Update: {
          add_on_ids?: string[]
          booking_id?: string
          end_time?: string
          event_date?: string
          event_type?: string | null
          guest_count?: number | null
          hall_id?: string
          id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "banquet_bookings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banquet_bookings_hall_id_fkey"
            columns: ["hall_id"]
            isOneToOne: false
            referencedRelation: "event_halls"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          created_at: string
          guest_id: string | null
          id: string
          module_type: string
          reference_number: string
          status: string
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          guest_id?: string | null
          id?: string
          module_type: string
          reference_number: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          guest_id?: string | null
          id?: string
          module_type?: string
          reference_number?: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conference_bookings: {
        Row: {
          attendee_count: number | null
          booking_id: string
          catering_required: boolean
          date: string
          end_time: string
          id: string
          purpose: string | null
          room_id: string
          start_time: string
        }
        Insert: {
          attendee_count?: number | null
          booking_id: string
          catering_required?: boolean
          date: string
          end_time: string
          id?: string
          purpose?: string | null
          room_id: string
          start_time: string
        }
        Update: {
          attendee_count?: number | null
          booking_id?: string
          catering_required?: boolean
          date?: string
          end_time?: string
          id?: string
          purpose?: string | null
          room_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "conference_bookings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conference_bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "conference_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      conference_rooms: {
        Row: {
          capacity: number
          equipment: string[]
          hourly_rate: number
          id: string
          name: string
        }
        Insert: {
          capacity: number
          equipment?: string[]
          hourly_rate: number
          id?: string
          name: string
        }
        Update: {
          capacity?: number
          equipment?: string[]
          hourly_rate?: number
          id?: string
          name?: string
        }
        Relationships: []
      }
      event_halls: {
        Row: {
          base_price: number
          capacity_max: number | null
          capacity_min: number | null
          id: string
          layout_options: string[]
          name: string
        }
        Insert: {
          base_price: number
          capacity_max?: number | null
          capacity_min?: number | null
          id?: string
          layout_options?: string[]
          name: string
        }
        Update: {
          base_price?: number
          capacity_max?: number | null
          capacity_min?: number | null
          id?: string
          layout_options?: string[]
          name?: string
        }
        Relationships: []
      }
      guests: {
        Row: {
          created_at: string
          created_by: string | null
          email: string | null
          full_name: string
          id: string
          id_proof_number: string | null
          id_proof_type: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name: string
          id?: string
          id_proof_number?: string | null
          id_proof_type?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name?: string
          id?: string
          id_proof_number?: string | null
          id_proof_type?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hall_add_ons: {
        Row: {
          category: string | null
          id: string
          name: string
          price: number
        }
        Insert: {
          category?: string | null
          id?: string
          name: string
          price: number
        }
        Update: {
          category?: string | null
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
        }
        Insert: {
          category?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
        }
        Update: {
          category?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          gateway_reference: string | null
          id: string
          method: string | null
          status: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          gateway_reference?: string | null
          id?: string
          method?: string | null
          status?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          gateway_reference?: string | null
          id?: string
          method?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      restaurant_reservations: {
        Row: {
          booking_id: string
          id: string
          party_size: number
          reservation_date: string
          reservation_time: string
          status: string
          table_id: string | null
        }
        Insert: {
          booking_id: string
          id?: string
          party_size: number
          reservation_date: string
          reservation_time: string
          status?: string
          table_id?: string | null
        }
        Update: {
          booking_id?: string
          id?: string
          party_size?: number
          reservation_date?: string
          reservation_time?: string
          status?: string
          table_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_reservations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_reservations_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_tables: {
        Row: {
          capacity: number
          id: string
          location_zone: string | null
          status: string
          table_number: string
        }
        Insert: {
          capacity: number
          id?: string
          location_zone?: string | null
          status?: string
          table_number: string
        }
        Update: {
          capacity?: number
          id?: string
          location_zone?: string | null
          status?: string
          table_number?: string
        }
        Relationships: []
      }
      room_bookings: {
        Row: {
          booking_id: string
          check_in: string
          check_out: string
          id: string
          num_guests: number
          room_id: string
          special_requests: string | null
        }
        Insert: {
          booking_id: string
          check_in: string
          check_out: string
          id?: string
          num_guests?: number
          room_id: string
          special_requests?: string | null
        }
        Update: {
          booking_id?: string
          check_in?: string
          check_out?: string
          id?: string
          num_guests?: number
          room_id?: string
          special_requests?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_bookings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_rate_calendar: {
        Row: {
          date: string
          id: string
          rate_override: number
          room_type_id: string
        }
        Insert: {
          date: string
          id?: string
          rate_override: number
          room_type_id: string
        }
        Update: {
          date?: string
          id?: string
          rate_override?: number
          room_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_rate_calendar_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      room_types: {
        Row: {
          amenities: string[]
          base_price: number
          created_at: string
          description: string | null
          id: string
          max_occupancy: number
          name: string
        }
        Insert: {
          amenities?: string[]
          base_price: number
          created_at?: string
          description?: string | null
          id?: string
          max_occupancy: number
          name: string
        }
        Update: {
          amenities?: string[]
          base_price?: number
          created_at?: string
          description?: string | null
          id?: string
          max_occupancy?: number
          name?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          floor: number | null
          id: string
          room_number: string
          room_type_id: string
          status: string
        }
        Insert: {
          floor?: number | null
          id?: string
          room_number: string
          room_type_id: string
          status?: string
        }
        Update: {
          floor?: number | null
          id?: string
          room_number?: string
          room_type_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_invites: {
        Row: {
          created_at: string
          email: string
          id: string
          invited_by: string | null
          role: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          invited_by?: string | null
          role: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          invited_by?: string | null
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_invites_invited_by_fkey"
            columns: ["invited_by"]
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
      is_staff_or_admin: { Args: never; Returns: boolean }
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
