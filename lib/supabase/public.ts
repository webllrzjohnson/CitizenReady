import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import type { TypedSupabaseClient } from '@/types/supabase-client'

/**
 * Anon Supabase client for public data fetches (no cookies). Use in generateStaticParams,
 * generateMetadata, and public pages so builds do not call `cookies()` outside a request.
 */
export function createPublicSupabaseClient(): TypedSupabaseClient {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  ) as TypedSupabaseClient
}
