-- Add question_ids column to quiz_sessions table to store the list of questions for each session
ALTER TABLE quiz_sessions
ADD COLUMN question_ids JSONB DEFAULT '[]'::jsonb;

-- Add a comment to explain the column
COMMENT ON COLUMN quiz_sessions.question_ids IS 'Array of question IDs included in this quiz session';
