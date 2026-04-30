# CitizenReady

A Canadian citizenship exam prep platform where users practice questions by topic, take timed mock exams modeled on the real IRCC test, and track their improvement over time.

## Features

- 📚 Practice questions by topic (Discover Canada chapters)
- ⏱️ Timed mock exam - 20 questions, 30 minutes, 75% pass threshold
- 📊 Score history and progress tracking per user
- 🔐 User authentication with email/password
- 👨‍💼 Admin panel for question bank management

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Validation:** Zod

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/          # Next.js app router pages
components/   # React components
actions/      # Server actions
lib/          # Utilities and Supabase clients
types/        # TypeScript type definitions
hooks/        # Custom React hooks
```

## Database Setup

Refer to `BLUEPRINT.md` for SQL scripts to:
1. Create tables
2. Set up RLS policies
3. Create auth triggers
4. Seed sample data

## License

MIT
