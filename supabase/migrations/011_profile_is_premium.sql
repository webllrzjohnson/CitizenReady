-- Premium flag for full question bank / paywalled catalog access.
-- Users cannot self-grant premium; only admins (or future webhooks) may change it.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.is_premium IS
  'Paid / full access for member-only features (e.g. complete question bank). Not user-editable.';

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

DROP TRIGGER IF EXISTS profiles_preserve_is_premium ON public.profiles;
CREATE TRIGGER profiles_preserve_is_premium
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_preserve_is_premium_for_non_admins();
