import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      polls: {
        Row: {
          id: string
          question: string
          options: string[]
          votes: number[]
          voters: string[]
          created_at: string
          expiry_date: string | null
          privacy: "public" | "private"
          creator_id: string
          access_code: string | null
        }
        Insert: {
          id?: string
          question: string
          options: string[]
          votes?: number[]
          voters?: string[]
          created_at?: string
          expiry_date?: string | null
          privacy: "public" | "private"
          creator_id: string
          access_code?: string | null
        }
        Update: {
          id?: string
          question?: string
          options?: string[]
          votes?: number[]
          voters?: string[]
          created_at?: string
          expiry_date?: string | null
          privacy?: "public" | "private"
          creator_id?: string
          access_code?: string | null
        }
      }
    }
  }
}
