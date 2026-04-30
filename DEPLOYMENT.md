# Deployment Guide

This guide will walk you through deploying the Canadian Citizenship Exam Prep app from scratch.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- A Vercel account (free tier works)
- Git installed

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

### 2.1 Create a New Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Set project name: `canadareview` (or your choice)
5. Set database password (save this securely!)
6. Choose a region close to your users
7. Click "Create new project"
8. Wait ~2 minutes for project to be ready

### 2.2 Get Your API Credentials

1. Go to Project Settings → API
2. Copy these values (you'll need them):
   - Project URL: `https://xxxx.supabase.co`
   - Anon (public) key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Service role key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep this secret!)

### 2.3 Run Database Migrations

1. In Supabase Dashboard → SQL Editor
2. Click "New query"
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

### 2.4 (Optional) Add Sample Data

1. Still in SQL Editor, create another new query
2. Copy contents of `supabase/seed.sql`
3. Paste and run
4. This adds 50+ sample questions across 5 topics

### 2.5 Set Up Storage Bucket (for avatars)

1. Go to Storage
2. Create new bucket:
   - Name: `avatars`
   - Public bucket: Yes
3. Click "Create bucket"
4. Go to Policies tab
5. Add policy for INSERT:
   ```
   Policy name: Allow authenticated users to upload avatars
   Target roles: authenticated
   WITH CHECK: bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
   ```
6. Add policy for SELECT:
   ```
   Policy name: Allow public to view avatars
   Target roles: public, authenticated
   USING: bucket_id = 'avatars'
   ```

## Step 3: Configure Environment Variables

Create `.env.local` file in project root:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 4: Test Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4.1 Create Your First Account

1. Click "Get Started" or "Sign Up"
2. Enter email, password, and name
3. Check email for confirmation link
4. Click confirmation link
5. Login with your credentials

### 4.2 Make Yourself an Admin

1. Go to Supabase Dashboard → Authentication → Users
2. Find your user, copy the User ID
3. Go to Table Editor → profiles
4. Find your profile row
5. Edit the `role` column to `admin` (instead of `user`)
6. Save
7. Refresh your app - you should now see "Admin" in the header

### 4.3 Add Questions

1. Click "Admin" in header
2. Click "Create New Question"
3. Fill out the form
4. Click "Create Question"
5. Repeat to add more questions

Alternatively, if you ran the seed script, you already have 50+ questions!

## Step 5: Deploy to Vercel

### 5.1 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/canadareview.git
git push -u origin main
```

### 5.2 Deploy on Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Framework Preset: Next.js (auto-detected)
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (keep private!)
   - `NEXT_PUBLIC_SITE_URL`: https://your-app.vercel.app (your Vercel URL)
6. Click "Deploy"
7. Wait ~2 minutes
8. Your app is live!

### 5.3 Update Supabase Auth Settings

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Site URL: `https://your-app.vercel.app`
3. Redirect URLs:
   - Add: `https://your-app.vercel.app/**`
   - Add: `http://localhost:3000/**` (for local dev)
4. Save

## Step 6: Test Production

1. Visit your Vercel URL
2. Test signup/login
3. Test practice mode
4. Test taking an exam
5. Test admin panel (as admin user)

## Step 7: Create More Admin Users (Optional)

To give admin access to other users:

1. Have them sign up normally
2. Go to Supabase Dashboard → Table Editor → profiles
3. Find their profile
4. Change `role` to `admin`
5. Save

## Troubleshooting

### "Invalid API key" error
- Check that your environment variables are correct
- Make sure you're using the anon key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your dev server after changing `.env.local`

### Authentication not working
- Verify Supabase Auth URL configuration
- Check that email confirmation is enabled (or disabled if testing)
- Look at browser console for errors

### RLS policy errors
- Make sure you ran the entire migration SQL
- Check that RLS is enabled on all tables
- Verify policies are created correctly

### Questions not showing
- Check that you have questions in the database
- Run the seed script if needed
- Verify the topic exists

### Can't access admin panel
- Verify your user has `role = 'admin'` in the profiles table
- Clear cookies and login again
- Check middleware.ts is running correctly

## Production Checklist

Before going live:

- [ ] Run all database migrations
- [ ] Set up proper environment variables in Vercel
- [ ] Configure Supabase Auth URLs
- [ ] Test all features (signup, login, practice, exam, admin)
- [ ] Create your admin account and verify role
- [ ] Add initial questions (or run seed script)
- [ ] Set up custom domain (optional)
- [ ] Configure email provider (optional, for custom emails)
- [ ] Set up error monitoring (Sentry)
- [ ] Set up analytics (PostHog or Vercel Analytics)
- [ ] Remove test admin user from seed.sql
- [ ] Update robots.txt with your domain
- [ ] Add sitemap.xml (or use next-sitemap package)

## Updating After Deployment

To deploy updates:

```bash
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically redeploy!

## Database Backups

Supabase automatically backs up your database daily. To manually backup:

1. Supabase Dashboard → Database → Backups
2. Click "Download backup"

## Monitoring

### Vercel
- View logs: Vercel Dashboard → Your Project → Logs
- View analytics: Vercel Dashboard → Analytics

### Supabase
- View auth users: Authentication → Users
- View database: Table Editor
- View logs: Logs → Postgres Logs

## Custom Domain (Optional)

### On Vercel:
1. Your Project → Settings → Domains
2. Add your domain
3. Configure DNS records (Vercel provides instructions)

### Update Environment Variables:
- Change `NEXT_PUBLIC_SITE_URL` to your custom domain
- Update Supabase Auth URLs

## Email Configuration (Optional)

By default, Supabase sends emails. To use custom email provider (Resend):

1. Get Resend API key from [resend.com](https://resend.com)
2. Add to Vercel environment variables:
   ```
   RESEND_API_KEY=re_your_key_here
   ```
3. Implement email sending in your server actions

## Scaling Considerations

The free tiers support:
- **Vercel**: 100GB bandwidth, unlimited requests
- **Supabase**: 500MB database, 2GB bandwidth, 50,000 monthly active users

For larger scale:
- Upgrade Supabase to Pro ($25/month) for more resources
- Upgrade Vercel to Pro ($20/month) for advanced features
- Consider Redis for caching (Upstash free tier)
- Add CDN for static assets (Cloudflare)

## Support

If you encounter issues:
1. Check Vercel logs
2. Check Supabase logs
3. Check browser console
4. Review the error messages
5. Check that all environment variables are set correctly

## Security Best Practices

1. **Never commit `.env.local` to git** (it's in .gitignore)
2. **Keep service role key secret** (never expose client-side)
3. **Use RLS policies** (already implemented)
4. **Validate all inputs** (Zod schemas are in place)
5. **Use HTTPS only** (Vercel provides this)
6. **Keep dependencies updated**: `npm audit` regularly
7. **Monitor for suspicious activity** in Supabase Dashboard

## Next Steps

After deployment:
1. Share the app with users
2. Gather feedback
3. Add more questions
4. Monitor usage and performance
5. Consider adding features from the roadmap (see README.md)

## Maintenance

Regular tasks:
- Review and moderate user-generated content (if applicable)
- Update questions based on latest study guide
- Monitor error logs
- Update dependencies monthly
- Backup database monthly (manually)
- Review Supabase usage to avoid hitting limits

---

**Congratulations!** Your app is now live. 🎉

For questions or issues, refer to:
- Next.js docs: [nextjs.org/docs](https://nextjs.org/docs)
- Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Vercel docs: [vercel.com/docs](https://vercel.com/docs)
