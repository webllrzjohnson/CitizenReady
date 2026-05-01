import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import type { TypedSupabaseClient } from '@/types/supabase-client'

export function createAdminClient(): TypedSupabaseClient {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  ) as TypedSupabaseClient
}
