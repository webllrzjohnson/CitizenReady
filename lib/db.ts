import postgres from 'postgres'
import { getDatabaseSsl, getDatabaseUrl, logMissingServerEnv } from '@/lib/env'

logMissingServerEnv()

const sql = postgres(getDatabaseUrl(), {
  ssl: getDatabaseSsl(),
})

export default sql
