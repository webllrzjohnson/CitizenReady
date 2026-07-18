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

type SmtpConfig = Omit<EmailNotificationConfig, 'to'>

function getSmtpConfig(env: EnvLike = process.env): SmtpConfig | null {
  const host = String(env.SMTP_HOST ?? '').trim()
  const user = String(env.SMTP_USER ?? '').trim()
  const pass = String(env.SMTP_PASS ?? '').trim()
  if (!host || !user || !pass) return null

  const parsedPort = Number.parseInt(String(env.SMTP_PORT ?? '465'), 10)
  const port = Number.isFinite(parsedPort) ? parsedPort : 465
  const secureEnv = String(env.SMTP_SECURE ?? '').trim().toLowerCase()
  const secure = secureEnv ? ['1', 'true', 'yes'].includes(secureEnv) : port === 465
  const from = String(env.SMTP_FROM ?? '').trim() || user

  return { host, port, secure, user, pass, from }
}

export function getEmailNotificationConfig(env: EnvLike = process.env): EmailNotificationConfig | null {
  const to = String(env.ADMIN_NOTIFICATION_EMAIL ?? '').trim()
  const smtp = getSmtpConfig(env)
  if (!smtp || !to) return null

  return { ...smtp, to }
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

export function buildPlusRequestStatusEmail(input: {
  name: string
  status: 'approved' | 'rejected' | 'completed'
  requestedPlanLabel: string
}): NotificationEmail {
  const greeting = `Hi ${safeLine(input.name)},`
  if (input.status === 'approved') {
    return {
      subject: 'CitizenReady: Your Plus request approved',
      text: [
        greeting,
        '',
        `Your CitizenReady Plus request for ${safeLine(input.requestedPlanLabel)} was approved.`,
        'We will finish the manual access step shortly. If you have questions, reply to this email.',
        '',
        `Sign in: ${siteUrl('/login')}`,
      ].join('\n'),
    }
  }

  if (input.status === 'rejected') {
    return {
      subject: 'CitizenReady: Plus request update',
      text: [
        greeting,
        '',
        `Thanks for requesting ${safeLine(input.requestedPlanLabel)}. We are not able to approve this Plus request right now.`,
        'If you think this was a mistake or want to discuss another option, reply to this email.',
        '',
        `CitizenReady: ${siteUrl('/')}`,
      ].join('\n'),
    }
  }

  return buildPlusAccessGrantedEmail({
    name: input.name,
    grantLabel: input.requestedPlanLabel,
  })
}

export function buildPlusAccessGrantedEmail(input: {
  name: string
  grantLabel: string
  accountEmail?: string | null
}): NotificationEmail {
  return {
    subject: 'CitizenReady: Your Plus access is active',
    text: [
      `Hi ${safeLine(input.name)},`,
      '',
      `Your CitizenReady Plus access is now active for ${safeLine(input.grantLabel)}.`,
      `Account email: ${safeLine(input.accountEmail)}`,
      '',
      'You can continue studying with your Plus access from your dashboard:',
      siteUrl('/dashboard'),
      '',
      'Good luck with your Canadian citizenship exam preparation!',
    ].join('\n'),
  }
}

async function sendNotificationTo(to: string, email: NotificationEmail, logLabel: string): Promise<void> {
  const config = getSmtpConfig()
  const recipient = String(to ?? '').trim()
  if (!config || !recipient) return

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
      to: recipient,
      subject: email.subject,
      text: email.text,
    })
  } catch (error) {
    console.error(`[CitizenReady] Failed to send ${logLabel} email:`, error instanceof Error ? error.message : error)
  }
}

export async function sendAdminNotification(email: NotificationEmail): Promise<void> {
  const config = getEmailNotificationConfig()
  if (!config) return
  await sendNotificationTo(config.to, email, 'admin notification')
}

export async function sendUserNotification(to: string, email: NotificationEmail): Promise<void> {
  await sendNotificationTo(to, email, 'user notification')
}
