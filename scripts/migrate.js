#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')
const postgres = require('postgres')

const root = path.resolve(__dirname, '..')
const migrationsDir = path.join(root, 'db', 'migrations')
const dryRun = process.argv.includes('--dry-run')

function getDatabaseSsl() {
  const explicit = String(process.env.DATABASE_SSL || '').trim().toLowerCase()
  if (explicit === 'require' || explicit === 'true' || explicit === '1') return 'require'
  const url = String(process.env.DATABASE_URL || '')
  if (/[?&]sslmode=require/i.test(url)) return 'require'
  return false
}

function getMigrationFiles() {
  if (!fs.existsSync(migrationsDir)) return []
  return fs
    .readdirSync(migrationsDir)
    .filter((name) => /^\d+.*\.sql$/i.test(name))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => path.join(migrationsDir, name))
}

async function main() {
  const files = getMigrationFiles()
  if (files.length === 0) {
    console.log('No migration files found.')
    return
  }

  if (dryRun) {
    console.log('Migrations that would run:')
    for (const file of files) console.log(`- ${path.relative(root, file)}`)
    return
  }

  const databaseUrl = String(process.env.DATABASE_URL || '').trim()
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to run migrations')
  }

  const sql = postgres(databaseUrl, { ssl: getDatabaseSsl(), max: 1 })
  try {
    for (const file of files) {
      const relative = path.relative(root, file)
      const content = fs.readFileSync(file, 'utf8')
      console.log(`Running ${relative}...`)
      await sql.unsafe(content)
      console.log(`Done ${relative}`)
    }
  } finally {
    await sql.end({ timeout: 5 })
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
