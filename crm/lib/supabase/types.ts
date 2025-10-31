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
      customers: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string
          secondary_phone: string | null
          address_line1: string
          address_line2: string | null
          city: string
          state: string
          postal_code: string
          country: string
          notes: string | null
          status: 'active' | 'inactive' | 'blocked'
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email?: string | null
          phone: string
          secondary_phone?: string | null
          address_line1: string
          address_line2?: string | null
          city: string
          state: string
          postal_code: string
          country?: string
          notes?: string | null
          status?: 'active' | 'inactive' | 'blocked'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string
          secondary_phone?: string | null
          address_line1?: string
          address_line2?: string | null
          city?: string
          state?: string
          postal_code?: string
          country?: string
          notes?: string | null
          status?: 'active' | 'inactive' | 'blocked'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          customer_id: string
          job_number: string
          scheduled_date: string
          scheduled_time_start: string
          scheduled_time_end: string | null
          status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'rescheduled'
          job_type: 'residential' | 'commercial' | 'construction' | 'estate-cleanout' | null
          priority: 'low' | 'normal' | 'high' | 'urgent'
          description: string | null
          estimated_duration_minutes: number | null
          assigned_staff_ids: string[]
          completed_at: string | null
          cancelled_at: string | null
          cancellation_reason: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          job_number?: string
          scheduled_date: string
          scheduled_time_start: string
          scheduled_time_end?: string | null
          status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'rescheduled'
          job_type?: 'residential' | 'commercial' | 'construction' | 'estate-cleanout' | null
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          description?: string | null
          estimated_duration_minutes?: number | null
          assigned_staff_ids?: string[]
          completed_at?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          job_number?: string
          scheduled_date?: string
          scheduled_time_start?: string
          scheduled_time_end?: string | null
          status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'rescheduled'
          job_type?: 'residential' | 'commercial' | 'construction' | 'estate-cleanout' | null
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          description?: string | null
          estimated_duration_minutes?: number | null
          assigned_staff_ids?: string[]
          completed_at?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quotes: {
        Row: {
          id: string
          job_id: string | null
          customer_id: string
          quote_number: string
          status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
          estimated_amount: number
          actual_amount: number | null
          labor_cost: number | null
          disposal_cost: number | null
          distance_fee: number | null
          notes: string | null
          valid_until: string | null
          sent_at: string | null
          accepted_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id?: string | null
          customer_id: string
          quote_number?: string
          status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
          estimated_amount: number
          actual_amount?: number | null
          labor_cost?: number | null
          disposal_cost?: number | null
          distance_fee?: number | null
          notes?: string | null
          valid_until?: string | null
          sent_at?: string | null
          accepted_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string | null
          customer_id?: string
          quote_number?: string
          status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
          estimated_amount?: number
          actual_amount?: number | null
          labor_cost?: number | null
          disposal_cost?: number | null
          distance_fee?: number | null
          notes?: string | null
          valid_until?: string | null
          sent_at?: string | null
          accepted_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          job_id: string | null
          customer_id: string
          quote_id: string | null
          invoice_number: string
          invoice_date: string
          due_date: string
          status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'
          subtotal: number
          tax_amount: number
          discount_amount: number
          total_amount: number
          paid_amount: number
          balance_amount: number
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id?: string | null
          customer_id: string
          quote_id?: string | null
          invoice_number?: string
          invoice_date?: string
          due_date: string
          status?: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'
          subtotal: number
          tax_amount?: number
          discount_amount?: number
          total_amount: number
          paid_amount?: number
          balance_amount: number
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string | null
          customer_id?: string
          quote_id?: string | null
          invoice_number?: string
          invoice_date?: string
          due_date?: string
          status?: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'
          subtotal?: number
          tax_amount?: number
          discount_amount?: number
          total_amount?: number
          paid_amount?: number
          balance_amount?: number
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          invoice_id: string
          payment_method: 'cash' | 'check' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'other'
          amount: number
          payment_date: string
          reference_number: string | null
          notes: string | null
          recorded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          payment_method: 'cash' | 'check' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'other'
          amount: number
          payment_date?: string
          reference_number?: string | null
          notes?: string | null
          recorded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          payment_method?: 'cash' | 'check' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'other'
          amount?: number
          payment_date?: string
          reference_number?: string | null
          notes?: string | null
          recorded_by?: string | null
          created_at?: string
        }
      }
      routes: {
        Row: {
          id: string
          route_date: string
          route_name: string | null
          status: 'planned' | 'in-progress' | 'completed' | 'cancelled'
          start_location: string | null
          end_location: string | null
          estimated_start_time: string | null
          estimated_end_time: string | null
          actual_start_time: string | null
          actual_end_time: string | null
          assigned_staff_ids: string[]
          vehicle_id: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          route_date: string
          route_name?: string | null
          status?: 'planned' | 'in-progress' | 'completed' | 'cancelled'
          start_location?: string | null
          end_location?: string | null
          estimated_start_time?: string | null
          estimated_end_time?: string | null
          actual_start_time?: string | null
          actual_end_time?: string | null
          assigned_staff_ids?: string[]
          vehicle_id?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          route_date?: string
          route_name?: string | null
          status?: 'planned' | 'in-progress' | 'completed' | 'cancelled'
          start_location?: string | null
          end_location?: string | null
          estimated_start_time?: string | null
          estimated_end_time?: string | null
          actual_start_time?: string | null
          actual_end_time?: string | null
          assigned_staff_ids?: string[]
          vehicle_id?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'staff' | 'accountant'
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role: 'admin' | 'staff' | 'accountant'
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'staff' | 'accountant'
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

