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
import {
  getPremiumStatusCta,
  getPremiumStatusDescription,
  getPremiumStatusLabel,
} from '../lib/premium'
import {
  formatPlusRequestPlanLabel,
  getPlusRequestStatusBadgeVariant,
  normalizePlusRequestAdminNotes,
  normalizePlusRequestPlan,
  plusRequestPlanToPremiumGrant,
} from '../lib/plus-requests'
import { formatAdminDashboardCount } from '../lib/admin-dashboard'
import { buildLearnerRetentionSummary } from '../lib/learner-retention'
import {
  buildContactNotificationEmail,
  buildAdminTestEmail,
  buildPlusAccessGrantedEmail,
  buildPlusRequestNotificationEmail,
  buildPlusRequestStatusEmail,
  getEmailNotificationConfig,
  uniqueEmailRecipients,
} from '../lib/email'

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

test('formats user-facing Plus status copy and CTAs', () => {
  assert.equal(getPremiumStatusLabel('free'), 'Free')
  assert.equal(getPremiumStatusLabel('active'), 'Active Plus')
  assert.equal(getPremiumStatusLabel('expired'), 'Expired Plus')
  assert.equal(getPremiumStatusLabel('lifetime'), 'Lifetime Plus')
  assert.equal(getPremiumStatusLabel('admin'), 'Admin Plus')
  assert.match(getPremiumStatusDescription('active', 'Jan 1, 2027'), /Jan 1, 2027/)
  assert.equal(getPremiumStatusCta('free').href, '/plus-request')
  assert.equal(getPremiumStatusCta('expired').label, 'Request Renewal')
  assert.equal(getPremiumStatusCta('active').href, '/dashboard/study')
})

test('normalizes and labels Plus request plans', () => {
  assert.equal(normalizePlusRequestPlan('30day'), '30day')
  assert.equal(normalizePlusRequestPlan('unknown'), '30day')
  assert.equal(formatPlusRequestPlanLabel('7day'), '7-Day Sprint')
  assert.equal(formatPlusRequestPlanLabel('lifetime'), 'Lifetime / Special Access')
  assert.equal(plusRequestPlanToPremiumGrant('7day'), '7d')
  assert.equal(plusRequestPlanToPremiumGrant('30day'), '30d')
  assert.equal(plusRequestPlanToPremiumGrant('1year'), '1y')
  assert.equal(plusRequestPlanToPremiumGrant('lifetime'), 'lifetime')
})

test('normalizes Plus request admin notes for storage', () => {
  assert.equal(normalizePlusRequestAdminNotes('  Called user about payment.  '), 'Called user about payment.')
  assert.equal(normalizePlusRequestAdminNotes('   '), null)
  assert.equal(normalizePlusRequestAdminNotes(null), null)
  assert.equal(normalizePlusRequestAdminNotes('x'.repeat(2001))?.length, 2000)
})

test('maps Plus request statuses to badge variants', () => {
  assert.equal(getPlusRequestStatusBadgeVariant('new'), 'default')
  assert.equal(getPlusRequestStatusBadgeVariant('approved'), 'secondary')
  assert.equal(getPlusRequestStatusBadgeVariant('waiting_payment'), 'secondary')
  assert.equal(getPlusRequestStatusBadgeVariant('waiting_account'), 'outline')
  assert.equal(getPlusRequestStatusBadgeVariant('follow_up'), 'secondary')
  assert.equal(getPlusRequestStatusBadgeVariant('completed'), 'outline')
  assert.equal(getPlusRequestStatusBadgeVariant('rejected'), 'destructive')
})

test('builds learner retention summary from recent activity', () => {
  const summary = buildLearnerRetentionSummary({
    completedSessions: [
      { completed_at: '2026-07-18T12:00:00.000Z', type: 'practice', topic_slug: 'history' },
      { completed_at: '2026-07-17T12:00:00.000Z', type: 'mock_exam', topic_slug: null },
    ],
    now: new Date('2026-07-18T20:00:00.000Z'),
  })
  assert.equal(summary.studyStreakDays, 2)
  assert.equal(summary.continueHref, '/dashboard/practice/history')
  assert.match(summary.lastActivityLabel, /Today/)
})

test('formats admin dashboard counts for compact cards', () => {
  assert.equal(formatAdminDashboardCount(0), '0')
  assert.equal(formatAdminDashboardCount(999), '999')
  assert.equal(formatAdminDashboardCount(1200), '1.2k')
  assert.equal(formatAdminDashboardCount(12000), '12k')
})

test('detects optional admin email notification configuration', () => {
  assert.equal(getEmailNotificationConfig({}), null)
  assert.deepEqual(
    getEmailNotificationConfig({
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: '587',
      SMTP_USER: 'mailer@example.com',
      SMTP_PASS: 'app-password',
      SMTP_FROM: 'CitizenReady <mailer@example.com>',
      ADMIN_NOTIFICATION_EMAIL: 'admin@example.com',
    }),
    {
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      user: 'mailer@example.com',
      pass: 'app-password',
      from: 'CitizenReady <mailer@example.com>',
      to: 'admin@example.com',
    },
  )
})

test('builds admin notification emails for contact and Plus requests', () => {
  const contact = buildContactNotificationEmail({
    name: 'Jane Smith',
    email: 'jane@example.com',
    subject: 'Technical Issue',
    message: 'I need help with the mock exam timer.',
  })
  assert.match(contact.subject, /New contact message/)
  assert.match(contact.text, /Jane Smith/)
  assert.match(contact.text, /admin\/contact-messages/)

  const plus = buildPlusRequestNotificationEmail({
    name: 'Sam Lee',
    email: 'sam@example.com',
    accountEmail: 'account@example.com',
    requestedPlanLabel: '30-Day Plan',
    message: 'My test is next month.',
  })
  assert.match(plus.subject, /New Plus access request/)
  assert.match(plus.text, /30-Day Plan/)
  assert.match(plus.text, /admin\/plus-requests/)

  const testEmail = buildAdminTestEmail()
  assert.match(testEmail.subject, /SMTP test/)
  assert.match(testEmail.text, /email notifications are working/i)
})

test('builds user notification emails for Plus request decisions', () => {
  const approved = buildPlusRequestStatusEmail({
    name: 'Sam Lee',
    status: 'approved',
    requestedPlanLabel: '30-Day Plan',
  })
  assert.match(approved.subject, /Plus request approved/)
  assert.match(approved.text, /30-Day Plan/)
  assert.match(approved.text, /reply to this email/i)

  const rejected = buildPlusRequestStatusEmail({
    name: 'Sam Lee',
    status: 'rejected',
    requestedPlanLabel: '30-Day Plan',
  })
  assert.match(rejected.subject, /Plus request update/)
  assert.match(rejected.text, /not able to approve/i)

  const received = buildPlusRequestStatusEmail({
    name: 'Sam Lee',
    status: 'new',
    requestedPlanLabel: '30-Day Plan',
  })
  assert.match(received.subject, /Plus request received/)

  const waitingPayment = buildPlusRequestStatusEmail({
    name: 'Sam Lee',
    status: 'waiting_payment',
    requestedPlanLabel: '30-Day Plan',
  })
  assert.match(waitingPayment.subject, /payment/i)

  const waitingAccount = buildPlusRequestStatusEmail({
    name: 'Sam Lee',
    status: 'waiting_account',
    requestedPlanLabel: '30-Day Plan',
  })
  assert.match(waitingAccount.text, /create a free CitizenReady account/i)

  const granted = buildPlusAccessGrantedEmail({
    name: 'Sam Lee',
    grantLabel: '30-Day Plan',
    accountEmail: 'sam@example.com',
  })
  assert.match(granted.subject, /Plus access is active/)
  assert.match(granted.text, /dashboard/)
  assert.match(granted.text, /sam@example.com/)
})

test('deduplicates requester notification recipients', () => {
  assert.deepEqual(
    uniqueEmailRecipients(['sam@example.com', ' SAM@example.com ', '', null, 'account@example.com']),
    ['sam@example.com', 'account@example.com'],
  )
})
