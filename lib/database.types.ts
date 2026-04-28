// Auto-generate accurate types with:
//   npx supabase gen types typescript --project-id <your-project-id> > lib/database.types.ts
// The types below are a best-effort approximation based on known table structure.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      people: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          email: string | null
          created_at: string
        }
        Insert: {
          id?: string
          full_name?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          person_id: string | null
          full_name: string | null
          phone: string | null
          email: string | null
          amount: number | null
          currency: string | null
          product: string | null
          terminal_name: string | null
          payment_id: string | null
          payment_date: string | null
          donor_note: string | null
          is_recurring: boolean | null
          event_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          person_id?: string | null
          full_name?: string | null
          phone?: string | null
          email?: string | null
          amount?: number | null
          currency?: string | null
          product?: string | null
          terminal_name?: string | null
          payment_id?: string | null
          payment_date?: string | null
          donor_note?: string | null
          is_recurring?: boolean | null
          event_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          person_id?: string | null
          full_name?: string | null
          phone?: string | null
          email?: string | null
          amount?: number | null
          currency?: string | null
          product?: string | null
          terminal_name?: string | null
          payment_id?: string | null
          payment_date?: string | null
          donor_note?: string | null
          is_recurring?: boolean | null
          event_id?: string | null
          created_at?: string
        }
      }
      event_registrations: {
        Row: {
          id: string
          person_id: string | null
          event_id: string | null
          shabbat_id: string | null
          full_name: string | null
          phone: string | null
          email: string | null
          evening_count: number | null
          morning_count: number | null
          is_donor: boolean | null
          language: string | null
          location: string | null
          created_at: string
        }
        Insert: {
          id?: string
          person_id?: string | null
          event_id?: string | null
          shabbat_id?: string | null
          full_name?: string | null
          phone?: string | null
          email?: string | null
          evening_count?: number | null
          morning_count?: number | null
          is_donor?: boolean | null
          language?: string | null
          location?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          person_id?: string | null
          event_id?: string | null
          shabbat_id?: string | null
          full_name?: string | null
          phone?: string | null
          email?: string | null
          evening_count?: number | null
          morning_count?: number | null
          is_donor?: boolean | null
          language?: string | null
          location?: string | null
          created_at?: string
        }
      }
      shabbatot: {
        Row: {
          id: string
          event_id: string | null
          name: string | null
          date: string | null
          time: string | null
          location: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id?: string | null
          name?: string | null
          date?: string | null
          time?: string | null
          location?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string | null
          name?: string | null
          date?: string | null
          time?: string | null
          location?: string | null
          created_at?: string
        }
      }
      incoming_payloads: {
        Row: {
          id: string
          created_at: string
          payload_type: string | null
          processed: boolean | null
          target_table: string | null
          target_id: string | null
          error_message: string | null
          payload: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          payload_type?: string | null
          processed?: boolean | null
          target_table?: string | null
          target_id?: string | null
          error_message?: string | null
          payload?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          payload_type?: string | null
          processed?: boolean | null
          target_table?: string | null
          target_id?: string | null
          error_message?: string | null
          payload?: Json | null
        }
      }
    }
    Views: Record<never, never>
    Functions: {
      get_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_donations_sum: number
          total_donations_count: number
          total_registrations_count: number
          total_shabbatot_count: number
          current_month_donations_sum: number
          unprocessed_payloads_count: number
        }[]
      }
    }
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}

// Convenience row types
export type Person = Database['public']['Tables']['people']['Row']
export type Donation = Database['public']['Tables']['donations']['Row']
export type EventRegistration = Database['public']['Tables']['event_registrations']['Row']
export type Shabbat = Database['public']['Tables']['shabbatot']['Row']
export type IncomingPayload = Database['public']['Tables']['incoming_payloads']['Row']
