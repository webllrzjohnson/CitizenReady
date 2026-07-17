import nodemailer from 'nodemailer'
import { siteUrl } from '@/lib/site-url'

type EnvLike = Record<string, string | undefined>

export type EmailNotificationConfig = {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
  to: string
}

export type NotificationEmail = {
  subject: string
  text: string
}

export function getEmailNotificationConfig(env: EnvLike = process.env): EmailNotificationConfig | null {
  const host = String(env.SMTP_HOST ?? '').trim()
  const user = String(env.SMTP_USER ?? '').trim()
  const pass = String(env.SMTP_PASS ?? '').trim()
  const to = String(env.ADMIN_NOTIFICATION_EMAIL ?? '').trim()
  if (!host || !user || !pass || !to) return null

  const parsedPort = Number.parseInt(String(env.SMTP_PORT ?? '465'), 10)
  const port = Number.isFinite(parsedPort) ? parsedPort : 465
  const secureEnv = String(env.SMTP_SECURE ?? '').trim().toLowerCase()
  const secure = secureEnv ? ['1', 'true', 'yes'].includes(secureEnv) : port === 465
  const from = String(env.SMTP_FROM ?? '').trim() || user

  return { host, port, secure, user, pass, from, to }
}

function safeLine(value: string | null | undefined): string {
  return String(value ?? '—').trim() || '—'
}

export function buildContactNotificationEmail(input: {
  name: string
  email: string
  subject: string
  message: string
}): NotificationEmail {
  return {
    subject: `CitizenReady: New contact message from ${input.name}`,
    text: [
      'A new contact message was submitted on CitizenReady.',
      '',
      `Name: ${safeLine(input.name)}`,
      `Email: ${safeLine(input.email)}`,
      `Subject: ${safeLine(input.subject)}`,
      '',
      'Message:',
      safeLine(input.message),
      '',
      `Admin inbox: ${siteUrl('/admin/contact-messages')}`,
    ].join('\n'),
  }
}

export function buildPlusRequestNotificationEmail(input: {
  name: string
  email: string
  accountEmail?: string | null
  requestedPlanLabel: string
  message?: string | null
}): NotificationEmail {
  return {
    subject: `CitizenReady: New Plus access request from ${input.name}`,
    text: [
      'A new manual Plus access request was submitted on CitizenReady.',
      '',
      `Name: ${safeLine(input.name)}`,
      `Contact email: ${safeLine(input.email)}`,
      `Account email: ${safeLine(input.accountEmail || 'Same as contact email')}`,
      `Requested plan: ${safeLine(input.requestedPlanLabel)}`,
      '',
      'Notes:',
      safeLine(input.message),
      '',
      `Admin queue: ${siteUrl('/admin/plus-requests')}`,
    ].join('\n'),
  }
}

export async function sendAdminNotification(email: NotificationEmail): Promise<void> {
  const config = getEmailNotificationConfig()
  if (!config) return

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    })

    await transporter.sendMail({
      from: config.from,
      to: config.to,
      subject: email.subject,
      text: email.text,
    })
  } catch (error) {
    console.error('[CitizenReady] Failed to send admin notification email:', error instanceof Error ? error.message : error)
  }
}
