-- Adds a per-user session version used to invalidate existing JWT cookies
-- after password, profile identity, or role changes.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 1;

UPDATE public.profiles
SET session_version = 1
WHERE session_version IS NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_session_version
  ON public.profiles (id, session_version);

COMMENT ON COLUMN public.profiles.session_version IS
  'Increment to invalidate existing JWT cookies for this user after credential, identity, or role changes.';
