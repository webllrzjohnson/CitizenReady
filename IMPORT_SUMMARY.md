# Question Import Summary

## Overview

Your JSON file (`canadaquiz_questions.json`) has been successfully processed and prepared for import into your CitizenReady database.

## What You Have

- **Total Questions**: 1,001
- **Topics**: 11 (matching Discover Canada study guide)
- **Question Types**: 4 (single, multiple, boolean, fill)
- **Difficulty Levels**: 3 (Easy, Medium, Hard)

## What Was Created

### 1. Seed Script (`scripts/seed-questions.ts`)

A comprehensive TypeScript script that:
- Creates all 11 topics with slugs and descriptions
- Transforms JSON questions to match your database schema
- Handles all 4 question types correctly
- Inserts questions in batches (100 at a time) for reliability
- Includes safety confirmation before deleting existing data

### 2. NPM Script (`package.json`)

Added a new script:
```bash
npm run seed
```

### 3. Documentation (`scripts/README.md`)

Complete instructions and troubleshooting guide.

## Question Type Breakdown

### Single Choice (e.g., "What are three responsibilities...")
```json
{
  "type": "single",
  "question": "What are three responsibilities...",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "correctAnswer": "B",
  "explanation": "...",
  "topic": "Rights and Responsibilities",
  "difficulty": "Easy"
}
```

### Multiple Choice (e.g., "Which of the following are fundamental freedoms...")
```json
{
  "type": "multiple",
  "question": "Which of the following...",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "correctAnswer": ["A", "C", "D"],
  "explanation": "...",
  "topic": "Rights and Responsibilities",
  "difficulty": "Medium"
}
```

### Boolean (True/False)
```json
{
  "type": "boolean",
  "question": "Voting in elections is both a right and responsibility.",
  "correctAnswer": "True",
  "explanation": "...",
  "topic": "Rights and Responsibilities",
  "difficulty": "Easy"
}
```

### Fill in the Blank
```json
{
  "type": "fill",
  "question": "The Charter is part of the ________ of 1982.",
  "correctAnswer": "Constitution",
  "explanation": "...",
  "topic": "Rights and Responsibilities",
  "difficulty": "Medium"
}
```

## Database Schema Alignment

Your database schema perfectly supports all question types:

```typescript
{
  question_text: string      // The question
  type: string               // 'single' | 'multiple' | 'boolean' | 'fill'
  options: Json              // Array for single/multiple/boolean, null for fill
  correct_answers: Json      // String or array of strings
  explanation: string | null // Explanation text
  difficulty: string         // 'easy' | 'medium' | 'hard' (normalized to lowercase)
  topic_id: string           // UUID foreign key
  is_active: boolean         // All set to true by default
}
```

## Topics Created

| # | Topic Name | Slug | Questions |
|---|------------|------|-----------|
| 1 | Rights and Responsibilities | `rights-and-responsibilities` | ~91 |
| 2 | Who Are Canadians | `who-are-canadians` | ~91 |
| 3 | Canada's History | `canadas-history` | ~91 |
| 4 | Government | `government` | ~91 |
| 5 | Federal Elections | `federal-elections` | ~91 |
| 6 | Justice System | `justice-system` | ~91 |
| 7 | Canadian Symbols | `canadian-symbols` | ~91 |
| 8 | Canada's Regions | `canadas-regions` | ~91 |
| 9 | Canada's Economy | `canadas-economy` | ~91 |
| 10 | Modern Canada | `modern-canada` | ~91 |
| 11 | Applying for Citizenship | `applying-for-citizenship` | ~91 |

## How to Import

### Step 1: Verify Environment Variables

Check `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=https://wovnebxijuouewwjlpjy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

✅ **Already configured!**

### Step 2: Run the Seed Script

```bash
npm run seed
```

You'll see a confirmation prompt:
```
⚠️  This will clear ALL existing questions and insert 1001 new ones.
   Add --yes or -y to skip this confirmation.

   Press Ctrl+C to cancel, or press Enter to continue...
```

Press Enter to proceed, or use `npm run seed -- --yes` to skip the prompt.

### Step 3: Watch the Progress

```
🚀 Starting seed process...
🗑️  Clearing existing questions...
✅ Cleared existing questions
🌱 Seeding topics...
✅ Inserted 11 new topics (or "All topics already exist")
📚 Loading questions from JSON...
Found 1001 questions
🗺️  Getting topic mappings...
📝 Transforming questions...
💾 Inserting questions...
  Inserted 100/1001 questions
  Inserted 200/1001 questions
  ...
  Inserted 1001/1001 questions
✅ Successfully inserted all 1001 questions

✨ Seed completed successfully!
```

### Step 4: Verify in Supabase

1. Go to your Supabase dashboard
2. Navigate to Table Editor
3. Check:
   - `topics` table → 11 rows
   - `questions` table → 1,001 rows

## Next Steps

After importing, you can:

1. **Test the Questions**
   - Build your practice mode UI
   - Create quiz sessions
   - Test different question types

2. **Admin Panel**
   - View all questions by topic
   - Edit questions if needed
   - Add/remove questions

3. **Quiz Engine**
   - Random question selection
   - Mock exam generation (20 questions)
   - Progress tracking

## Schema Flexibility

Your current schema is more flexible than the initial migration:

**Initial Migration** (restrictive):
- 4 separate columns: `option_a`, `option_b`, `option_c`, `option_d`
- `correct_answer` as ENUM('a','b','c','d')
- Only supports single-choice questions

**Current Schema** (flexible):
- `options` as JSONB → supports any number of options
- `correct_answers` as JSONB → supports multiple correct answers
- `type` field → supports single, multiple, boolean, fill

This is perfect for your JSON data! 🎉

## Troubleshooting

### If you get an error about topics not existing:
```bash
# Run the script again, it will create topics first
npm run seed
```

### If you get RLS errors:
- Verify `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- The service key bypasses RLS (this is correct for seeding)

### If you get timeout errors:
- Reduce batch size in `scripts/seed-questions.ts`
- Change `const batchSize = 100` to `const batchSize = 50`

## Safety Notes

⚠️ **Important**:
- This script **DELETES ALL** existing questions before importing
- Always backup your database before running in production
- Use `--yes` flag only in development
- The script uses service role key (bypasses RLS) - this is safe for seeding

## Questions?

Check:
1. `scripts/README.md` - Detailed documentation
2. `scripts/seed-questions.ts` - The source code (well-commented)
3. Your database types in `types/database.types.ts`

---

**Ready to import?** Run:
```bash
npm run seed
```
