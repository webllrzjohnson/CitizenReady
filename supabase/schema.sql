-- =====================================================
-- CitizenReady — Consolidated Schema
-- Fresh-deployment reference. Represents the final
-- state of all 13 individual migration files.
-- Apply this to a brand-new Supabase project instead
-- of running the numbered migrations one by one.
-- =====================================================

-- =====================================================
-- EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES
-- =====================================================
CREATE TYPE user_role          AS ENUM ('user', 'admin');
CREATE TYPE question_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE answer_option       AS ENUM ('a', 'b', 'c', 'd');
CREATE TYPE exam_status         AS ENUM ('in_progress', 'completed', 'abandoned');
CREATE TYPE blog_post_status    AS ENUM ('draft', 'published');

-- =====================================================
-- HELPER FUNCTION: updated_at trigger
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- HELPER FUNCTION: is_admin() — SECURITY DEFINER so it
-- bypasses RLS when checking the profiles table,
-- preventing infinite recursion in policy expressions.
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- =====================================================
-- TABLE: profiles
-- =====================================================
CREATE TABLE profiles (
    id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email        TEXT        NOT NULL UNIQUE,
    role         user_role   NOT NULL DEFAULT 'user',
    display_name TEXT,
    avatar_url   TEXT,
    is_premium   BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN profiles.is_premium IS
  'Paid / full access for member-only features. Not user-editable; only admins or webhooks may change it.';

CREATE INDEX idx_profiles_role  ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: topics
-- =====================================================
CREATE TABLE topics (
    id            UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          TEXT    NOT NULL UNIQUE,
    description   TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_topics_display_order ON topics(display_order);

CREATE TRIGGER update_topics_updated_at
    BEFORE UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: questions
-- =====================================================
CREATE TABLE questions (
    id             UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id       UUID                NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    question_text  TEXT                NOT NULL,
    option_a       TEXT                NOT NULL,
    option_b       TEXT                NOT NULL,
    option_c       TEXT                NOT NULL,
    option_d       TEXT                NOT NULL,
    correct_answer answer_option       NOT NULL,
    explanation    TEXT,
    difficulty     question_difficulty NOT NULL DEFAULT 'medium',
    is_active      BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    created_by     UUID                NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_questions_topic_id   ON questions(topic_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_created_by ON questions(created_by);
CREATE INDEX idx_questions_is_active  ON questions(is_active);

CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: user_answers  (Practice Mode)
-- =====================================================
CREATE TABLE user_answers (
    id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    question_id     UUID          NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_answer answer_option NOT NULL,
    is_correct      BOOLEAN       NOT NULL,
    answered_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_answers_user_id     ON user_answers(user_id);
CREATE INDEX idx_user_answers_question_id ON user_answers(question_id);
CREATE INDEX idx_user_answers_answered_at ON user_answers(answered_at DESC);
-- One answer per question per user in practice mode
CREATE UNIQUE INDEX idx_user_answers_unique ON user_answers(user_id, question_id);

-- =====================================================
-- TABLE: exam_sessions
-- =====================================================
CREATE TABLE exam_sessions (
    id                 UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id            UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    started_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at       TIMESTAMPTZ,
    time_limit_minutes INTEGER     NOT NULL DEFAULT 30,
    status             exam_status NOT NULL DEFAULT 'in_progress'
);

CREATE INDEX idx_exam_sessions_user_id    ON exam_sessions(user_id);
CREATE INDEX idx_exam_sessions_status     ON exam_sessions(status);
CREATE INDEX idx_exam_sessions_started_at ON exam_sessions(started_at DESC);

-- =====================================================
-- TABLE: exam_answers
-- =====================================================
CREATE TABLE exam_answers (
    id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_session_id UUID          NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
    question_id     UUID          NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_answer answer_option NOT NULL,
    is_correct      BOOLEAN       NOT NULL,
    answered_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exam_answers_exam_session_id ON exam_answers(exam_session_id);
CREATE INDEX idx_exam_answers_question_id     ON exam_answers(question_id);
CREATE UNIQUE INDEX idx_exam_answers_unique   ON exam_answers(exam_session_id, question_id);

-- =====================================================
-- TABLE: exam_scores
-- =====================================================
CREATE TABLE exam_scores (
    id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_session_id UUID         NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
    user_id         UUID         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    total_questions INTEGER      NOT NULL,
    correct_answers INTEGER      NOT NULL,
    score_percentage NUMERIC(5,2) NOT NULL,
    passed          BOOLEAN      NOT NULL,
    completed_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exam_scores_user_id      ON exam_scores(user_id);
CREATE INDEX idx_exam_scores_completed_at ON exam_scores(completed_at DESC);
CREATE INDEX idx_exam_scores_passed       ON exam_scores(passed);
CREATE UNIQUE INDEX idx_exam_scores_exam_session ON exam_scores(exam_session_id);

-- =====================================================
-- TABLE: blog_posts
-- =====================================================
CREATE TABLE blog_posts (
    id           UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
    title        TEXT             NOT NULL,
    slug         TEXT             NOT NULL UNIQUE,
    excerpt      TEXT,
    cover_image  TEXT,
    content      JSONB            NOT NULL DEFAULT '{}'::jsonb,
    author_id    UUID             NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status       blog_post_status NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug               ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status_published_at ON blog_posts(status, published_at DESC NULLS LAST);

CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: contact_messages
-- =====================================================
CREATE TABLE contact_messages (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT        NOT NULL,
    email      TEXT        NOT NULL,
    subject    TEXT        NOT NULL,
    message    TEXT        NOT NULL,
    is_read    BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABLE: site_settings
-- =====================================================
CREATE TABLE site_settings (
    key        TEXT        PRIMARY KEY,
    value      TEXT        NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TRIGGER: auto-create profile on auth signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- TRIGGER: prevent non-admins from changing is_premium
-- =====================================================
CREATE OR REPLACE FUNCTION public.profiles_preserve_is_premium_for_non_admins()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF NOT public.is_admin() AND NEW.is_premium IS DISTINCT FROM OLD.is_premium THEN
            NEW.is_premium := OLD.is_premium;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_preserve_is_premium
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.profiles_preserve_is_premium_for_non_admins();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics          ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_answers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_scores     ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings   ENABLE ROW LEVEL SECURITY;

-- ── profiles ────────────────────────────────────────
-- Authenticated users can read any profile
CREATE POLICY "profiles_select_all" ON profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Anonymous users can read profiles of published blog authors
CREATE POLICY "profiles_select_published_blog_authors" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.blog_posts bp
            WHERE bp.author_id = profiles.id AND bp.status = 'published'
        )
    );

CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_admin_update" ON profiles
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "profiles_admin_delete" ON profiles
    FOR DELETE USING (public.is_admin());

-- ── topics ───────────────────────────────────────────
-- Public read (guests can browse topics)
CREATE POLICY "topics_select_all" ON topics
    FOR SELECT USING (true);

CREATE POLICY "topics_admin_insert" ON topics
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "topics_admin_update" ON topics
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "topics_admin_delete" ON topics
    FOR DELETE USING (public.is_admin());

-- ── questions ────────────────────────────────────────
-- Public read of active questions (guests can practice)
CREATE POLICY "questions_select_guest_active" ON questions
    FOR SELECT USING (is_active = true);

CREATE POLICY "questions_admin_insert" ON questions
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "questions_admin_update" ON questions
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "questions_admin_delete" ON questions
    FOR DELETE USING (public.is_admin());

-- ── user_answers ─────────────────────────────────────
CREATE POLICY "user_answers_select_own" ON user_answers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_answers_admin_select" ON user_answers
    FOR SELECT USING (public.is_admin());

CREATE POLICY "user_answers_insert_own" ON user_answers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_answers_delete_own" ON user_answers
    FOR DELETE USING (auth.uid() = user_id);

-- ── exam_sessions ────────────────────────────────────
CREATE POLICY "exam_sessions_select_own" ON exam_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "exam_sessions_admin_select" ON exam_sessions
    FOR SELECT USING (public.is_admin());

CREATE POLICY "exam_sessions_insert_own" ON exam_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "exam_sessions_update_own" ON exam_sessions
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── exam_answers ─────────────────────────────────────
CREATE POLICY "exam_answers_select_own" ON exam_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM exam_sessions
            WHERE exam_sessions.id = exam_answers.exam_session_id
              AND exam_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "exam_answers_admin_select" ON exam_answers
    FOR SELECT USING (public.is_admin());

CREATE POLICY "exam_answers_insert_own" ON exam_answers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM exam_sessions
            WHERE exam_sessions.id = exam_answers.exam_session_id
              AND exam_sessions.user_id = auth.uid()
        )
    );

-- ── exam_scores ──────────────────────────────────────
CREATE POLICY "exam_scores_select_own" ON exam_scores
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "exam_scores_admin_select" ON exam_scores
    FOR SELECT USING (public.is_admin());

CREATE POLICY "exam_scores_insert_own" ON exam_scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── blog_posts ───────────────────────────────────────
CREATE POLICY "blog_posts_select_published" ON blog_posts
    FOR SELECT USING (status = 'published');

CREATE POLICY "blog_posts_admin_select" ON blog_posts
    FOR SELECT USING (public.is_admin());

CREATE POLICY "blog_posts_admin_insert" ON blog_posts
    FOR INSERT WITH CHECK (public.is_admin() AND author_id = auth.uid());

CREATE POLICY "blog_posts_admin_update" ON blog_posts
    FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "blog_posts_admin_delete" ON blog_posts
    FOR DELETE USING (public.is_admin());

-- ── contact_messages ─────────────────────────────────
CREATE POLICY "contact_messages_insert_public" ON contact_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "contact_messages_admin_select" ON contact_messages
    FOR SELECT USING (public.is_admin());

CREATE POLICY "contact_messages_admin_update" ON contact_messages
    FOR UPDATE USING (public.is_admin());

-- ── site_settings ────────────────────────────────────
CREATE POLICY "site_settings_select_public" ON site_settings
    FOR SELECT USING (true);

CREATE POLICY "site_settings_admin_update" ON site_settings
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "site_settings_admin_insert" ON site_settings
    FOR INSERT WITH CHECK (public.is_admin());

-- =====================================================
-- SEED: default site settings
-- =====================================================
INSERT INTO site_settings (key, value) VALUES
    ('ads_enabled',             'false'),
    ('adsense_client_id',       ''),
    ('ads_show_to_guests_only', 'true');
