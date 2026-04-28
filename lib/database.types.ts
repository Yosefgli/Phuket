// Auto-generate accurate types with:
//   npx supabase gen types typescript --project-id pautliovnrxlepptcgnu > lib/database.types.ts
// Types below match the actual Supabase schema as of 2026-04-28.

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
          id: number
          full_name: string | null
          phone: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          full_name?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          full_name?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      donations: {
        Row: {
          id: number
          person_id: number | null
          full_name: string | null
          phone: string | null
          email: string | null
          amount: number | null
          currency: string | null
          terminal_id: string | null
          terminal_name: string | null
          product_name: string | null
          product_id: string | null
          low_profile_code: string | null
          make: string | null
          payment_id: string | null
          payment_date: string | null
          donor_note: string | null
          recurring: boolean
          recurring_id: string | null
          raw_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          person_id?: number | null
          full_name?: string | null
          phone?: string | null
          email?: string | null
          amount?: number | null
          currency?: string | null
          terminal_id?: string | null
          terminal_name?: string | null
          product_name?: string | null
          product_id?: string | null
          low_profile_code?: string | null
          make?: string | null
          payment_id?: string | null
          payment_date?: string | null
          donor_note?: string | null
          recurring?: boolean
          recurring_id?: string | null
          raw_data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          person_id?: number | null
          full_name?: string | null
          phone?: string | null
          email?: string | null
          amount?: number | null
          currency?: string | null
          terminal_id?: string | null
          terminal_name?: string | null
          product_name?: string | null
          product_id?: string | null
          low_profile_code?: string | null
          make?: string | null
          payment_id?: string | null
          payment_date?: string | null
          donor_note?: string | null
          recurring?: boolean
          recurring_id?: string | null
          raw_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      event_registrations: {
        Row: {
          id: number
          person_id: number | null
          shabbat_id: number | null
          full_name: string | null
          phone: string | null
          email: string | null
          shabbat: string | null
          event_id: string | null
          lang: string | null
          location: string | null
          event_date: string | null
          event_time: string | null
          reg_evening: number | null
          reg_morning: number | null
          reg_donation_success: boolean
          raw_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          person_id?: number | null
          shabbat_id?: number | null
          full_name?: string | null
          phone?: string | null
          email?: string | null
          shabbat?: string | null
          event_id?: string | null
          lang?: string | null
          location?: string | null
          event_date?: string | null
          event_time?: string | null
          reg_evening?: number | null
          reg_morning?: number | null
          reg_donation_success?: boolean
          raw_data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          person_id?: number | null
          shabbat_id?: number | null
          full_name?: string | null
          phone?: string | null
          email?: string | null
          shabbat?: string | null
          event_id?: string | null
          lang?: string | null
          location?: string | null
          event_date?: string | null
          event_time?: string | null
          reg_evening?: number | null
          reg_morning?: number | null
          reg_donation_success?: boolean
          raw_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      shabbatot: {
        Row: {
          id: number
          event_id: string
          shabbat: string | null
          lang: string | null
          location: string | null
          event_date: string | null
          event_time: string | null
          raw_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          event_id: string
          shabbat?: string | null
          lang?: string | null
          location?: string | null
          event_date?: string | null
          event_time?: string | null
          raw_data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          event_id?: string
          shabbat?: string | null
          lang?: string | null
          location?: string | null
          event_date?: string | null
          event_time?: string | null
          raw_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      incoming_payloads: {
        Row: {
          id: number
          payload: Json
          payload_type: string | null
          processed: boolean
          processed_at: string | null
          target_table: string | null
          target_id: number | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: number
          payload: Json
          payload_type?: string | null
          processed?: boolean
          processed_at?: string | null
          target_table?: string | null
          target_id?: number | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          payload?: Json
          payload_type?: string | null
          processed?: boolean
          processed_at?: string | null
          target_table?: string | null
          target_id?: number | null
          error_message?: string | null
          created_at?: string
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
