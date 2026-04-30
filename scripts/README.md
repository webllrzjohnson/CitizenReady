# Question Seeding Script

This script imports questions from `canadaquiz_questions.json` into your Supabase database.

## What it does

1. **Seeds topics** - Creates 11 topics based on the Discover Canada guide
2. **Transforms questions** - Converts JSON format to match database schema
3. **Imports questions** - Inserts 1,001 questions in batches
4. **Clears existing data** - Removes old questions before importing (with confirmation)

## Question Types Supported

- **single** - Single-choice questions (A, B, C, D)
- **multiple** - Multiple-choice questions (select multiple correct answers)
- **boolean** - True/False questions
- **fill** - Fill-in-the-blank questions

## Database Schema

Questions are stored with:
- `question_text` - The question
- `type` - Question type (single|multiple|boolean|fill)
- `options` - JSONB array of options (null for fill-in-the-blank)
- `correct_answers` - JSONB with correct answer(s)
- `explanation` - Explanation text
- `difficulty` - easy|medium|hard
- `topic_id` - Foreign key to topics table
- `is_active` - Boolean flag

## Usage

### 1. Install dependencies

```bash
npm install
```

### 2. Run the seed script

```bash
# With confirmation prompt
npm run seed

# Skip confirmation (auto-yes)
npm run seed -- --yes
```

### 3. Verify in Supabase

Check your Supabase dashboard:
- **topics** table should have 11 rows
- **questions** table should have 1,001 rows

## Topics Imported

1. Rights and Responsibilities
2. Who Are Canadians
3. Canada's History
4. Government
5. Federal Elections
6. Justice System
7. Canadian Symbols
8. Canada's Regions
9. Canada's Economy
10. Modern Canada
11. Applying for Citizenship

## Troubleshooting

### Missing environment variables

Ensure `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### RLS errors

The script uses the service role key which bypasses Row Level Security (RLS). This is safe for seed scripts.

### Timeout errors

Questions are inserted in batches of 100. If you get timeouts, reduce the `batchSize` in the script.

## Safety

- **⚠️ WARNING**: This script will delete ALL existing questions
- Always backup your database before running
- Use `--yes` flag only in development environments
