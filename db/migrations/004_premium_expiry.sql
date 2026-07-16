-- Adds expiry dates for manual Plus access.
-- Null premium_expires_at with is_premium=true means lifetime/manual access.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.premium_expires_at IS
  'Null means lifetime/manual Plus access when is_premium is true. Future timestamp means active until that time.';
