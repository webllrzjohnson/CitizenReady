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
