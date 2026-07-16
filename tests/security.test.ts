import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildRateLimitKey,
  normalizeRateLimitIdentity,
  secondsUntilReset,
} from '../lib/security/rate-limit-core'
import {
  buildAdminAuditMetadata,
  redactAuditValue,
} from '../lib/security/audit-core'
import {
  formatAuditActionLabel,
  formatAuditMetadata,
  getAuditActionBadgeVariant,
} from '../lib/security/audit-view'
import { hasCurrentPassword } from '../lib/security/account-security'

test('normalizes rate limit identities consistently', () => {
  assert.equal(normalizeRateLimitIdentity('  USER@Example.COM  '), 'user@example.com')
  assert.equal(normalizeRateLimitIdentity(''), 'anonymous')
  assert.equal(buildRateLimitKey('login', ' USER@Example.COM '), 'login:user@example.com')
})

test('calculates reset seconds with a one-second floor', () => {
  const now = new Date('2026-01-01T00:00:00.000Z')
  assert.equal(secondsUntilReset(new Date('2026-01-01T00:00:10.000Z'), now), 10)
  assert.equal(secondsUntilReset(new Date('2025-12-31T23:59:59.000Z'), now), 1)
})

test('redacts sensitive audit metadata values', () => {
  assert.equal(redactAuditValue('plain'), 'plain')
  assert.equal(redactAuditValue('abc@example.com'), 'a***@example.com')
  assert.equal(redactAuditValue('secret-token-value'), '[REDACTED]')
  assert.deepEqual(
    buildAdminAuditMetadata({ email: 'USER@example.com', note: 'ok', token: 'secret-token-value' }),
    { email: 'u***@example.com', note: 'ok', token: '[REDACTED]' },
  )
})

test('formats audit log actions for admin display', () => {
  assert.equal(formatAuditActionLabel('user.role_updated'), 'User Role Updated')
  assert.equal(formatAuditActionLabel('site.ai_blog_settings_updated'), 'Site AI Blog Settings Updated')
  assert.equal(getAuditActionBadgeVariant('user.premium_updated'), 'default')
  assert.equal(getAuditActionBadgeVariant('site.settings_updated'), 'secondary')
})

test('formats audit metadata as stable key-value text', () => {
  assert.deepEqual(formatAuditMetadata({ grant: '30d', newRole: 'admin' }), [
    'grant: 30d',
    'newRole: admin',
  ])
  assert.deepEqual(formatAuditMetadata({ nested: { ok: true } }), ['nested: {"ok":true}'])
  assert.deepEqual(formatAuditMetadata({}), [])
})

test('detects whether sensitive account updates include a current password', () => {
  assert.equal(hasCurrentPassword('hunter2'), true)
  assert.equal(hasCurrentPassword('  hunter2  '), true)
  assert.equal(hasCurrentPassword(''), false)
  assert.equal(hasCurrentPassword('   '), false)
  assert.equal(hasCurrentPassword(null), false)
})
