# Quick Start Guide

Get your Canadian Citizenship Exam Prep app running in under 10 minutes!

## Prerequisites

- Node.js 18+ installed
- A Supabase account (sign up at [supabase.com](https://supabase.com))

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Supabase

### Create Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Name it "canadareview" (or anything you like)
3. Set a strong database password
4. Choose your region
5. Wait ~2 minutes for setup

### Get Your Credentials
1. Go to **Settings** → **API**
2. Copy these three values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: starts with `eyJhbG...`
   - **service_role key**: starts with `eyJhbG...` (different from anon key)

### Run Database Setup
1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Copy ALL contents from `supabase/migrations/001_initial_schema.sql`
4. Paste and click **RUN**
5. Should see "Success. No rows returned"

### Add Sample Data (Optional but Recommended)
1. Create another **New Query**
2. Copy ALL contents from `supabase/seed.sql`
3. Paste and click **RUN**
4. This adds 50+ practice questions!

## 3. Configure Environment Variables

Create `.env.local` file in project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...your-service-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Important**: Replace the placeholder values with YOUR actual Supabase credentials!

## 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 5. Create Your Account

1. Click **"Get Started"** or **"Sign Up"**
2. Enter your email, password, and name
3. Click **"Create Account"**
4. Check your email for confirmation link
5. Click the link to confirm
6. Return to app and login

## 6. Make Yourself Admin

To access the admin panel:

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find your user and copy the **User ID** (looks like `uuid`)
3. Go to **Table Editor** → **profiles** table
4. Find your row (matching your User ID)
5. Click to edit the **role** column
6. Change from `user` to `admin`
7. Save
8. Refresh your app
9. You should now see **"Admin"** in the header!

## 7. Start Using the App

### As a User:
- Click **"Practice"** to practice questions by topic
- Click **"Mock Exam"** to take a timed 20-question exam
- Click **"Dashboard"** to see your progress

### As an Admin:
- Click **"Admin"** in header
- **Create New Question** to add questions
- **Manage Topics** to organize question categories
- View statistics

## 🎉 That's It!

You now have a fully functional Canadian citizenship exam prep app running locally.

## Next Steps

### To Deploy to Production:
See **DEPLOYMENT.md** for detailed steps to deploy on Vercel.

### To Add More Questions:
1. Login as admin
2. Go to Admin → Create New Question
3. Fill in all fields
4. Click Create

### To Customize:
- Edit colors in `tailwind.config.ts`
- Change app name in `lib/constants.ts`
- Modify landing page in `app/page.tsx`

## Troubleshooting

**"Invalid API key" error?**
- Double-check your `.env.local` credentials
- Make sure you copied the full keys (they're long!)
- Restart your dev server: `npm run dev`

**Can't login?**
- Check your email for confirmation link
- Look in spam folder
- In Supabase Dashboard → **Authentication** → **Providers**, make sure email is enabled

**No questions showing?**
- Did you run the seed SQL? (`supabase/seed.sql`)
- Check Supabase **Table Editor** → **questions** table
- Make sure you have at least one topic

**Can't access admin panel?**
- Verify your role is set to `admin` in profiles table
- Clear cookies and login again
- Check browser console for errors

## Support

If you get stuck:
1. Read **README.md** for full documentation
2. Read **DEPLOYMENT.md** for deployment help
3. Check **PROJECT_SUMMARY.md** for technical details
4. Look at browser console for error messages
5. Check Supabase logs in the dashboard

## What's Included

✅ 50+ sample Canadian citizenship questions
✅ 5 organized topics
✅ Practice mode with instant feedback
✅ Timed mock exams (20 questions, 30 minutes)
✅ Progress tracking and statistics
✅ Admin panel for question management
✅ Beautiful, responsive UI
✅ Secure authentication
✅ Row Level Security (database-level permissions)

## Commands Reference

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Check for linting errors
npm run type-check   # Check TypeScript types
```

## File Structure

```
canadareview/
├── app/              # Pages (App Router)
├── components/       # Reusable UI components
├── actions/          # Server Actions (mutations)
├── lib/              # Utilities and helpers
├── types/            # TypeScript types
├── supabase/         # Database schema and seed
├── middleware.ts     # Route protection
└── [config files]    # Next.js, TypeScript, Tailwind
```

## Important Files

- **README.md** - Project overview and features
- **DEPLOYMENT.md** - Production deployment guide
- **PROJECT_SUMMARY.md** - Technical documentation
- **.env.example** - Example environment variables
- **supabase/migrations/001_initial_schema.sql** - Database schema
- **supabase/seed.sql** - Sample data

## Default Admin Credentials (from seed data)

The seed file creates a test admin account:
- **Email**: admin@example.com
- **Password**: (not set - you'll need to create your own)

**Note**: It's best to create your own admin account and not use the seed data admin.

## Tips

1. **Start with seed data** - Use the provided 50+ questions to test the app
2. **Make yourself admin first** - You'll need it to add more questions
3. **Test thoroughly** - Try all features before deploying
4. **Backup your data** - Supabase auto-backs up daily, but you can manually backup too
5. **Keep dependencies updated** - Run `npm audit` periodically

## Ready to Deploy?

When you're ready to go live:
1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel
4. Update Supabase Auth URLs
5. Deploy!

See **DEPLOYMENT.md** for full step-by-step instructions.

---

**Happy coding!** 🍁

Need help? Everything is documented in the README and deployment guide.
