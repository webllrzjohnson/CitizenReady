import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/** `Database['public']` is hand-maintained; schema param `any` avoids GenericSchema drift breaking all queries. */
export type TypedSupabaseClient = SupabaseClient<Database, 'public', any>
