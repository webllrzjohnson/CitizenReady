-- Adds basic abuse protection and admin mutation audit logging.

CREATE TABLE IF NOT EXISTS public.rate_limits (
    key        TEXT PRIMARY KEY,
    attempts   INTEGER NOT NULL DEFAULT 1,
    reset_at   TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at
    ON public.rate_limits (reset_at);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id       UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
    action         TEXT NOT NULL,
    target_user_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
    metadata       JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_actor_created
    ON public.admin_audit_logs (actor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target_created
    ON public.admin_audit_logs (target_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action_created
    ON public.admin_audit_logs (action, created_at DESC);

DELETE FROM public.rate_limits WHERE reset_at < now() - interval '1 day';
