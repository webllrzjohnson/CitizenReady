-- Allow anonymous (guest) users to read catalog topics and active questions
-- for CitizenReady guest practice / mock exam flows. Authenticated users
-- retain full question visibility via existing policy.

DO $$
BEGIN
  IF to_regclass('public.topics') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "topics_select_all" ON public.topics';
    EXECUTE 'CREATE POLICY "topics_select_all" ON public.topics FOR SELECT USING (true)';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.questions') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "questions_select_guest_active" ON public.questions';
    EXECUTE 'CREATE POLICY "questions_select_guest_active" ON public.questions FOR SELECT USING (is_active = true)';
  END IF;
END $$;
