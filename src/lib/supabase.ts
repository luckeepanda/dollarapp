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

// Create Supabase client with optimized settings for authentication
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Disable email confirmation for immediate session establishment
    flowType: 'implicit'
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(15000), // 15 second timeout
      }).catch(error => {
        console.error('Supabase fetch error:', error)
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - please check your internet connection')
        }
        throw new Error('Network error - please check your connection and try again')
      })
    }
  },
})

// Enhanced connection test with session verification
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection to:', supabaseUrl)
    
    // Test basic connection
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Supabase connection test failed:', error)
      return false
    }
    
    // Test database connection
    const { error: dbError } = await supabase.from('profiles').select('count').limit(1)
    
    if (dbError && !dbError.message.includes('row-level security')) {
      console.error('Database connection test failed:', dbError)
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