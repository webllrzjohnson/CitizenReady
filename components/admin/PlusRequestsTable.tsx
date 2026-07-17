import { updatePlusRequestStatus } from '@/actions/plus-requests'
import {
  formatPlusRequestPlanLabel,
  getPlusRequestStatusBadgeVariant,
  type PlusRequestPlan,
  type PlusRequestStatus,
} from '@/lib/plus-requests'
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
            <th className="px-4 py-3">Plan</th>
            <th className="px-4 py-3">Message</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id} className="border-b align-top last:border-b-0">
              <td className="px-4 py-3">
                <p className="font-medium text-sm">{request.name}</p>
                <p className="text-sm text-muted-foreground">{request.email}</p>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {request.account_email || 'Same as contact'}
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
                <div className="flex flex-wrap gap-2">
                  {request.status !== 'approved' && <StatusButton id={request.id} status="approved" label="Approve" />}
                  {request.status !== 'completed' && <StatusButton id={request.id} status="completed" label="Complete" />}
                  {request.status !== 'rejected' && <StatusButton id={request.id} status="rejected" label="Reject" />}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
