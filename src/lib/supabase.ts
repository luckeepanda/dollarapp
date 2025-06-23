import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Validate Supabase URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  console.error('Invalid Supabase URL format:', supabaseUrl)
  throw new Error('Invalid Supabase URL format. Please check your VITE_SUPABASE_URL in .env file.')
}

// Create Supabase client with additional options for better error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
})

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('games').select('count').limit(1)
    if (error) {
      console.error('Supabase connection test failed:', error)
      return false
    }
    console.log('Supabase connection successful')
    return true
  } catch (err) {
    console.error('Supabase connection error:', err)
    return false
  }
}

// Database types
export interface User {
  id: string
  email: string
  username: string
  accountType: 'player' | 'restaurant'
  balance: number
  isKYCVerified?: boolean
  created_at: string
  updated_at: string
}

export interface Game {
  id: string
  name: string
  description: string
  prize_pool: number
  max_players: number
  current_players: number
  min_score: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  category: string
  ends_at: string
  created_at: string
  is_active: boolean
}

export interface GameEntry {
  id: string
  user_id: string
  game_id: string
  score: number
  qualified: boolean
  created_at: string
}

export interface QRCode {
  id: string
  code: string
  user_id: string
  game_id: string
  amount: number
  is_redeemed: boolean
  redeemed_by?: string
  redeemed_at?: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: 'deposit' | 'withdrawal' | 'game_entry' | 'prize_win'
  amount: number
  status: 'pending' | 'completed' | 'failed'
  payment_method?: string
  created_at: string
}