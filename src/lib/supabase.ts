import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type EntePublico = {
  id?: number
  nombre: string
  ambitoGobierno: 'Federal' | 'Estatal' | 'Municipal'
  poderGobierno: 'Ejecutivo' | 'Legislativo' | 'Judicial'
  controlOIC: boolean
  controlTribunal: boolean
  sistema1: boolean
  sistema2: boolean
  sistema3: boolean
  sistema6: boolean
  entidad: {
    nombre: string
  }
  municipio: string | null
  created_at?: string
  updated_at?: string
}