import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import sql from '@/lib/db'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { SettingsForm } from '@/components/settings/SettingsForm'
import { DeleteAccountSection } from '@/components/settings/DeleteAccountSection'
import { updateProfile, updateEmail, updatePassword } from '@/actions/settings'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const profileRows = await sql`
    SELECT * FROM public.profiles WHERE id = ${session.id}::uuid LIMIT 1
  `
  const profile = profileRows[0] ?? null

  const memberSince = profile?.created_at
    ? format(new Date(profile.created_at), 'MMMM d, yyyy')
    : 'Unknown'

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-500">{session.email}</p>
      </div>

      <SettingsForm title="Profile" description="Update your display name" action={updateProfile} submitLabel="Save Changes">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input id="full_name" name="full_name" defaultValue={profile?.full_name ?? ''} placeholder="Your full name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email-readonly">Email</Label>
          <Input id="email-readonly" defaultValue={session.email ?? ''} readOnly className="cursor-not-allowed bg-muted text-muted-foreground" />
          <p className="text-xs text-muted-foreground">To change your email use the Email section below</p>
        </div>
        <div className="flex flex-wrap gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">Member since</p>
            <p className="text-sm text-muted-foreground">{memberSince}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">Role</p>
            <Badge variant={profile?.role === 'admin' ? 'default' : 'secondary'}>
              {profile?.role === 'admin' ? 'Admin' : 'User'}
            </Badge>
          </div>
        </div>
      </SettingsForm>

      <SettingsForm title="Email Address" description="Update your login email address." action={updateEmail} submitLabel="Update Email">
        <div className="space-y-2">
          <Label htmlFor="email">New Email</Label>
          <Input id="email" name="email" type="email" placeholder="new@example.com" autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmEmail">Confirm New Email</Label>
          <Input id="confirmEmail" name="confirmEmail" type="email" placeholder="new@example.com" autoComplete="email" />
        </div>
      </SettingsForm>

      <SettingsForm title="Password" description="Choose a strong password at least 8 characters long" action={updatePassword} submitLabel="Update Password">
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input id="newPassword" name="newPassword" type="password" placeholder="••••••••" autoComplete="new-password" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" autoComplete="new-password" />
        </div>
      </SettingsForm>

      <DeleteAccountSection />
    </div>
  )
}