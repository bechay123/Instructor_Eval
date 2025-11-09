import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://rkcwfdnmkxipjjhfbyhm.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrY3dmZG5ta3hpcGpqaGZieWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MjAxNjcsImV4cCI6MjA3NTI5NjE2N30.VynSm6nSQbNDbCSMXL5i6vHUGM79pPZ8XZXuAcOMC6U"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Enable session persistence
    autoRefreshToken: true, // Automatically refresh the token
    detectSessionInUrl: true, // Detect session from URL (for OAuth/magic links)
  },
});

