import { createClient } from '@/lib/supabase/server'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single<{ full_name: string | null }>()

  const email = user.email ?? ''
  const fullName = profile?.full_name?.trim() ?? ''

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Account settings are coming soon. For now, contact us if you need
            to make changes to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="settings-email">Email</Label>
            <Input
              id="settings-email"
              readOnly
              value={email}
              className="bg-muted/50 cursor-default"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-full-name">Full name</Label>
            <Input
              id="settings-full-name"
              readOnly
              value={fullName || '—'}
              className="bg-muted/50 cursor-default"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
