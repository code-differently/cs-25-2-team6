
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types 
export interface Student {
  id: string
  student_id: string
  first_name: string
  last_name: string
  grade_level: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface AttendanceRecord {
  id: string
  student_id: string
  class_id: string
  date_iso: string
  status: 'present' | 'absent' | 'late' | 'excused'
  is_late: boolean
  is_early_dismissal: boolean
  is_excused: boolean
  notes?: string
  recorded_by?: string
  created_at: string
  updated_at: string
}