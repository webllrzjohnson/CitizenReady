# Question Seeding Script

This script imports questions from `canadaquiz_questions.json` into your PostgreSQL database.

## What it does

1. **Seeds topics** - Creates 11 topics based on the Discover Canada guide
2. **Transforms questions** - Converts JSON format to match database schema
3. **Imports questions** - Inserts questions in batches
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
- `options` - JSONB array of options
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

### 3. Verify in the database

```sql
SELECT COUNT(*) FROM topics;
SELECT COUNT(*) FROM questions;
```

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
DATABASE_URL=postgresql://user:password@localhost:5432/citizenready
```

### Timeout errors

Questions are inserted in batches of 100. If you get timeouts, reduce the `batchSize` in the script.

## Safety

- **WARNING**: This script will delete ALL existing questions
- Always backup your database before running
- Use `--yes` flag only in development environments
