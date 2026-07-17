import { grantPlusForRequest, updatePlusRequestStatus } from '@/actions/plus-requests'
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

type PlusRequest = {
  id: string
  name: string
  email: string
  account_email: string | null
  requested_plan: PlusRequestPlan
  message: string | null
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
  async function action(formData: FormData) {
    'use server'
    await updatePlusRequestStatus(formData)
  }

  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" size="sm" variant="outline">{label}</Button>
    </form>
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
  async function action(formData: FormData) {
    'use server'
    await grantPlusForRequest(formData)
  }

  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="grant" value={grant} />
      <Button type="submit" size="sm" variant={primary ? 'default' : 'outline'}>{label}</Button>
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
            <th className="px-4 py-3">Message</th>
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
                <td className="max-w-[320px] whitespace-pre-wrap px-4 py-3 text-sm text-muted-foreground">
                  {request.message || '—'}
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
                    {request.status !== 'approved' && <StatusButton id={request.id} status="approved" label="Approve" />}
                    {request.status !== 'completed' && <StatusButton id={request.id} status="completed" label="Complete" />}
                    {request.status !== 'rejected' && <StatusButton id={request.id} status="rejected" label="Reject" />}
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
