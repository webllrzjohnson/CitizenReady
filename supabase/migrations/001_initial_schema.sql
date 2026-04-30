-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE question_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE answer_option AS ENUM ('a', 'b', 'c', 'd');
CREATE TYPE exam_status AS ENUM ('in_progress', 'completed', 'abandoned');

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'user',
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster role-based queries
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- =====================================================
-- TOPICS TABLE
-- =====================================================
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for ordering
CREATE INDEX idx_topics_display_order ON topics(display_order);

-- =====================================================
-- QUESTIONS TABLE
-- =====================================================
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer answer_option NOT NULL,
    explanation TEXT,
    difficulty question_difficulty NOT NULL DEFAULT 'medium',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_questions_topic_id ON questions(topic_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_created_by ON questions(created_by);

-- =====================================================
-- USER_ANSWERS TABLE (Practice Mode)
-- =====================================================
CREATE TABLE user_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_answer answer_option NOT NULL,
    is_correct BOOLEAN NOT NULL,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX idx_user_answers_question_id ON user_answers(question_id);
CREATE INDEX idx_user_answers_answered_at ON user_answers(answered_at DESC);

-- Prevent duplicate answers (user can only answer each question once in practice)
CREATE UNIQUE INDEX idx_user_answers_unique ON user_answers(user_id, question_id);

-- =====================================================
-- EXAM_SESSIONS TABLE
-- =====================================================
CREATE TABLE exam_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    time_limit_minutes INTEGER NOT NULL DEFAULT 30,
    status exam_status NOT NULL DEFAULT 'in_progress'
);

-- Indexes
CREATE INDEX idx_exam_sessions_user_id ON exam_sessions(user_id);
CREATE INDEX idx_exam_sessions_status ON exam_sessions(status);
CREATE INDEX idx_exam_sessions_started_at ON exam_sessions(started_at DESC);

-- =====================================================
-- EXAM_ANSWERS TABLE
-- =====================================================
CREATE TABLE exam_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_session_id UUID NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_answer answer_option NOT NULL,
    is_correct BOOLEAN NOT NULL,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_exam_answers_exam_session_id ON exam_answers(exam_session_id);
CREATE INDEX idx_exam_answers_question_id ON exam_answers(question_id);

-- Ensure one answer per question per exam
CREATE UNIQUE INDEX idx_exam_answers_unique ON exam_answers(exam_session_id, question_id);

-- =====================================================
-- EXAM_SCORES TABLE
-- =====================================================
CREATE TABLE exam_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_session_id UUID NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    score_percentage NUMERIC(5,2) NOT NULL,
    passed BOOLEAN NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_exam_scores_user_id ON exam_scores(user_id);
CREATE INDEX idx_exam_scores_completed_at ON exam_scores(completed_at DESC);
CREATE INDEX idx_exam_scores_passed ON exam_scores(passed);

-- Ensure one score per exam
CREATE UNIQUE INDEX idx_exam_scores_exam_session ON exam_scores(exam_session_id);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_scores ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Anyone authenticated can read all profiles (for leaderboards, etc.)
CREATE POLICY "profiles_select_all" ON profiles
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Users can insert their own profile (triggered on signup)
CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can update any profile (to change roles)
CREATE POLICY "profiles_admin_update" ON profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can delete profiles
CREATE POLICY "profiles_admin_delete" ON profiles
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- TOPICS POLICIES
-- =====================================================

-- Anyone authenticated can read topics
CREATE POLICY "topics_select_all" ON topics
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Only admins can insert topics
CREATE POLICY "topics_admin_insert" ON topics
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can update topics
CREATE POLICY "topics_admin_update" ON topics
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can delete topics
CREATE POLICY "topics_admin_delete" ON topics
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- QUESTIONS POLICIES
-- =====================================================

-- Anyone authenticated can read questions
CREATE POLICY "questions_select_all" ON questions
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Only admins can insert questions
CREATE POLICY "questions_admin_insert" ON questions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can update questions
CREATE POLICY "questions_admin_update" ON questions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can delete questions
CREATE POLICY "questions_admin_delete" ON questions
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- USER_ANSWERS POLICIES
-- =====================================================

-- Users can only read their own answers
CREATE POLICY "user_answers_select_own" ON user_answers
    FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can read all answers
CREATE POLICY "user_answers_admin_select" ON user_answers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can insert their own answers
CREATE POLICY "user_answers_insert_own" ON user_answers
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own answers (to reset progress)
CREATE POLICY "user_answers_delete_own" ON user_answers
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- EXAM_SESSIONS POLICIES
-- =====================================================

-- Users can only read their own exam sessions
CREATE POLICY "exam_sessions_select_own" ON exam_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can read all exam sessions
CREATE POLICY "exam_sessions_admin_select" ON exam_sessions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can insert their own exam sessions
CREATE POLICY "exam_sessions_insert_own" ON exam_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own exam sessions
CREATE POLICY "exam_sessions_update_own" ON exam_sessions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- EXAM_ANSWERS POLICIES
-- =====================================================

-- Users can only read answers from their own exam sessions
CREATE POLICY "exam_answers_select_own" ON exam_answers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM exam_sessions
            WHERE exam_sessions.id = exam_answers.exam_session_id
            AND exam_sessions.user_id = auth.uid()
        )
    );

-- Admins can read all exam answers
CREATE POLICY "exam_answers_admin_select" ON exam_answers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can insert answers to their own exam sessions
CREATE POLICY "exam_answers_insert_own" ON exam_answers
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM exam_sessions
            WHERE exam_sessions.id = exam_answers.exam_session_id
            AND exam_sessions.user_id = auth.uid()
        )
    );

-- =====================================================
-- EXAM_SCORES POLICIES
-- =====================================================

-- Users can only read their own scores
CREATE POLICY "exam_scores_select_own" ON exam_scores
    FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can read all scores
CREATE POLICY "exam_scores_admin_select" ON exam_scores
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can insert their own scores
CREATE POLICY "exam_scores_insert_own" ON exam_scores
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNCTION: Create profile on signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id, 
        NEW.email, 
        NEW.raw_user_meta_data->>'full_name',
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STORAGE SETUP (for user avatars)
-- =====================================================

-- This is done via Supabase UI, but documenting here:
-- 1. Create a bucket named "avatars"
-- 2. Set it to public
-- 3. Add policies:
--    - Allow authenticated users to upload: bucket_id = 'avatars' AND auth.uid() = name[1]
--    - Allow public read: bucket_id = 'avatars'
