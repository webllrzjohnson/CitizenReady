-- Optional: run on existing databases after upgrading.
-- New installs get this from db/schema.sql.
-- Ensures each quiz session has at most one answer row per question.

DELETE FROM public.question_attempts a
USING public.question_attempts b
WHERE a.session_id = b.session_id
  AND a.question_id = b.question_id
  AND (
    a.created_at < b.created_at
    OR (a.created_at = b.created_at AND a.ctid < b.ctid)
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'idx_question_attempts_session_question_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_question_attempts_session_question_unique
      ON public.question_attempts (session_id, question_id);
  END IF;
END $$;
