-- Adds manual CitizenReady Plus access request intake.

CREATE TABLE IF NOT EXISTS public.plus_access_requests (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           TEXT NOT NULL,
    email          TEXT NOT NULL,
    account_email  TEXT,
    requested_plan TEXT NOT NULL CHECK (requested_plan IN ('7day', '30day', '1year', 'lifetime')),
    message        TEXT,
    status         TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'approved', 'rejected', 'completed')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plus_access_requests_status_created
    ON public.plus_access_requests (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_plus_access_requests_email
    ON public.plus_access_requests (email);

COMMENT ON TABLE public.plus_access_requests IS
    'Manual Plus access leads submitted before online checkout is available.';
