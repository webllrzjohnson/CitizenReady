"use client"

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  grantPlusForRequest,
  resendPlusRequestEmail,
  updatePlusRequestAdminNotes,
  updatePlusRequestStatus,
} from '@/actions/plus-requests'
import {
  formatPlusRequestPlanLabel,
  getPlusRequestStatusBadgeVariant,
  plusRequestPlanToPremiumGrant,
  type PlusRequestPlan,
  type PlusRequestPremiumGrant,
  type PlusRequestStatus,
} from '@/lib/plus-requests'
import { formatPremiumExpiry } from '@/lib/premium'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type PlusRequest = {
  id: string
  name: string
  email: string
  account_email: string | null
  requested_plan: PlusRequestPlan
  message: string | null
  admin_notes: string | null
  status: PlusRequestStatus
  created_at: string | Date
  matched_user_id: string | null
  matched_user_email: string | null
  matched_user_is_premium: boolean | null
  matched_user_premium_expires_at: string | Date | null
}

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function StatusButton({ id, status, label }: { id: string; status: PlusRequestStatus; label: string }) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function action() {
    setMessage(null)
    startTransition(async () => {
      const formData = new FormData()
      formData.set('id', id)
      formData.set('status', status)
      const result = await updatePlusRequestStatus(formData)
      setMessage(result.error ?? 'Updated')
      if (!result.error) router.refresh()
    })
  }

  return (
    <div className="space-y-1">
      <Button type="button" size="sm" variant="outline" onClick={action} disabled={isPending}>{isPending ? 'Saving…' : label}</Button>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  )
}

function GrantButton({
  id,
  grant,
  label,
  primary = false,
}: {
  id: string
  grant: PlusRequestPremiumGrant
  label: string
  primary?: boolean
}) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function action() {
    setMessage(null)
    startTransition(async () => {
      const formData = new FormData()
      formData.set('id', id)
      formData.set('grant', grant)
      const result = await grantPlusForRequest(formData)
      setMessage(result.error ?? 'Granted')
      if (!result.error) router.refresh()
    })
  }

  return (
    <div className="space-y-1">
      <Button type="button" size="sm" variant={primary ? 'default' : 'outline'} onClick={action} disabled={isPending}>{isPending ? 'Granting…' : label}</Button>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  )
}

function ResendEmailButton({ id }: { id: string }) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function action() {
    setMessage(null)
    startTransition(async () => {
      const formData = new FormData()
      formData.set('id', id)
      const result = await resendPlusRequestEmail(formData)
      setMessage(result.error ?? 'Email sent')
      if (!result.error) router.refresh()
    })
  }

  return (
    <div className="space-y-1">
      <Button type="button" size="sm" variant="secondary" onClick={action} disabled={isPending}>{isPending ? 'Sending…' : 'Resend email'}</Button>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  )
}

function AdminNotesForm({ id, notes }: { id: string; notes: string | null }) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function action(formData: FormData) {
    setMessage(null)
    formData.set('id', id)
    startTransition(async () => {
      const result = await updatePlusRequestAdminNotes(formData)
      setMessage(result.error ?? 'Note saved')
      if (!result.error) router.refresh()
    })
  }

  return (
    <form action={action} className="mt-3 space-y-2">
      <Textarea
        name="adminNotes"
        defaultValue={notes ?? ''}
        maxLength={2000}
        rows={3}
        placeholder="Internal admin note — not emailed to the user"
        aria-label="Internal admin note"
        className="min-h-20 text-sm"
      />
      <Button type="submit" size="sm" variant="outline" disabled={isPending}>{isPending ? 'Saving…' : 'Save note'}</Button>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </form>
  )
}

export function PlusRequestsTable({ requests }: { requests: PlusRequest[] }) {
  if (requests.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
        No Plus access requests yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left">
        <thead className="border-b bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Requester</th>
            <th className="px-4 py-3">Account Email</th>
            <th className="px-4 py-3">Match</th>
            <th className="px-4 py-3">Plan</th>
            <th className="px-4 py-3">Message / Notes</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => {
            const matchedExpiry = formatPremiumExpiry(request.matched_user_premium_expires_at)
            return (
              <tr key={request.id} className="border-b align-top last:border-b-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-sm">{request.name}</p>
                  <p className="text-sm text-muted-foreground">{request.email}</p>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {request.account_email || 'Same as contact'}
                </td>
                <td className="px-4 py-3 text-sm">
                  {request.matched_user_id ? (
                    <div>
                      <Badge variant="secondary">Matched</Badge>
                      <p className="mt-1 text-xs text-muted-foreground">{request.matched_user_email}</p>
                      {request.matched_user_is_premium && (
                        <p className="mt-1 text-xs text-green-700">
                          Plus {matchedExpiry ? `until ${matchedExpiry}` : 'lifetime'}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Badge variant="destructive">No account</Badge>
                      <p className="mt-1 max-w-[180px] text-xs text-muted-foreground">
                        Ask user to create a free account with this email first.
                      </p>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {formatPlusRequestPlanLabel(request.requested_plan)}
                </td>
                <td className="max-w-[320px] px-4 py-3 text-sm text-muted-foreground">
                  <div className="whitespace-pre-wrap">{request.message || '—'}</div>
                  <div className="mt-3 rounded-md border bg-muted/30 p-3 text-xs text-foreground">
                    <p className="font-medium">Admin note</p>
                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{request.admin_notes || 'No internal note yet.'}</p>
                  </div>
                  <AdminNotesForm id={request.id} notes={request.admin_notes} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                  {formatDate(request.created_at)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={getPlusRequestStatusBadgeVariant(request.status)}>
                    {request.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex max-w-[280px] flex-wrap gap-2">
                    {request.matched_user_id && request.status !== 'completed' && (
                      <>
                        <GrantButton
                          id={request.id}
                          grant={plusRequestPlanToPremiumGrant(request.requested_plan)}
                          label={`Grant ${formatPlusRequestPlanLabel(request.requested_plan)}`}
                          primary
                        />
                        <GrantButton id={request.id} grant="7d" label="7d" />
                        <GrantButton id={request.id} grant="30d" label="30d" />
                        <GrantButton id={request.id} grant="1y" label="1y" />
                        <GrantButton id={request.id} grant="lifetime" label="Lifetime" />
                      </>
                    )}
                    {request.status !== 'waiting_payment' && <StatusButton id={request.id} status="waiting_payment" label="Waiting payment" />}
                    {request.status !== 'waiting_account' && <StatusButton id={request.id} status="waiting_account" label="Waiting account" />}
                    {request.status !== 'follow_up' && <StatusButton id={request.id} status="follow_up" label="Follow up" />}
                    {request.status !== 'approved' && <StatusButton id={request.id} status="approved" label="Approve" />}
                    {request.status !== 'completed' && <StatusButton id={request.id} status="completed" label="Complete" />}
                    {request.status !== 'rejected' && <StatusButton id={request.id} status="rejected" label="Reject" />}
                    <ResendEmailButton id={request.id} />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
