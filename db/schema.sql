-- CitizenReady — PostgreSQL schema (VPS / Coolify)
-- Fresh-database reference matching the current app (direct Postgres + JWT auth).
-- Apply: psql "$DATABASE_URL" -f db/schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- profiles (email/password auth via JWT cookies)
-- =====================================================
CREATE TABLE public.profiles (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT NOT NULL UNIQUE,
    full_name     TEXT,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_premium    BOOLEAN NOT NULL DEFAULT FALSE,
    session_version INTEGER NOT NULL DEFAULT 1,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON public.profiles (role);
CREATE INDEX idx_profiles_email ON public.profiles (email);
CREATE INDEX idx_profiles_session_version ON public.profiles (id, session_version);

COMMENT ON COLUMN public.profiles.is_premium IS
  'Paid / full access for member-only features. Only admins should change this.';
COMMENT ON COLUMN public.profiles.session_version IS
  'Increment to invalidate existing JWT cookies for this user after credential, identity, or role changes.';

-- =====================================================
-- topics
-- =====================================================
CREATE TABLE public.topics (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL UNIQUE,
    slug        TEXT NOT NULL UNIQUE,
    description TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_topics_sort_order ON public.topics (sort_order);

-- =====================================================
-- questions
-- =====================================================
CREATE TABLE public.questions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id        UUID NOT NULL REFERENCES public.topics (id) ON DELETE CASCADE,
    type            TEXT NOT NULL,
    question_text   TEXT NOT NULL,
    options         JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
    explanation     TEXT,
    difficulty      TEXT NOT NULL DEFAULT 'medium',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (question_text, topic_id)
);

CREATE INDEX idx_questions_topic_id ON public.questions (topic_id);
CREATE INDEX idx_questions_is_active ON public.questions (is_active);

-- =====================================================
-- quiz_sessions
-- =====================================================
CREATE TABLE public.quiz_sessions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    type          TEXT NOT NULL,
    topic_id      UUID REFERENCES public.topics (id) ON DELETE SET NULL,
    total_q       INTEGER NOT NULL,
    question_ids  JSONB NOT NULL DEFAULT '[]'::jsonb,
    score         INTEGER,
    completed_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quiz_sessions_user_id ON public.quiz_sessions (user_id);
CREATE INDEX idx_quiz_sessions_completed_at ON public.quiz_sessions (completed_at DESC);

-- =====================================================
-- question_attempts
-- =====================================================
CREATE TABLE public.question_attempts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id    UUID NOT NULL REFERENCES public.quiz_sessions (id) ON DELETE CASCADE,
    question_id   UUID NOT NULL REFERENCES public.questions (id) ON DELETE CASCADE,
    user_answer   JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_correct    BOOLEAN NOT NULL,
    time_spent_ms INTEGER,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_question_attempts_session_id ON public.question_attempts (session_id);
CREATE UNIQUE INDEX idx_question_attempts_session_question_unique
    ON public.question_attempts (session_id, question_id);

-- =====================================================
-- blog_posts
-- =====================================================
CREATE TABLE public.blog_posts (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title        TEXT NOT NULL,
    slug         TEXT NOT NULL UNIQUE,
    excerpt      TEXT,
    cover_image  TEXT,
    content      JSONB NOT NULL DEFAULT '{}'::jsonb,
    author_id    UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    published_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug ON public.blog_posts (slug);
CREATE INDEX idx_blog_posts_status_published_at ON public.blog_posts (status, published_at DESC NULLS LAST);

-- =====================================================
-- contact_messages
-- =====================================================
CREATE TABLE public.contact_messages (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    subject    TEXT NOT NULL,
    message    TEXT NOT NULL,
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_messages_is_read ON public.contact_messages (is_read);

-- =====================================================
-- site_settings
-- =====================================================
CREATE TABLE public.site_settings (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.site_settings (key, value) VALUES
    ('ads_enabled', 'false'),
    ('adsense_client_id', ''),
    ('ads_show_to_guests_only', 'true'),
    ('ai_blog_provider', 'anthropic'),
    ('ai_blog_model', 'claude-sonnet-4-6')
ON CONFLICT (key) DO NOTHING;
