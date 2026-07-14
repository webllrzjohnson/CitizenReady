import postgres from 'postgres'
import { getDatabaseSsl, logMissingServerEnv } from '@/lib/env'

logMissingServerEnv()

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: getDatabaseSsl(),
})

export default sql
