-- =====================================================
-- HOTFIX: force-remove recursive profiles policies
-- =====================================================
-- Use a new migration so already-applied environments receive the fix.
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
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

DO $$
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "profiles_admin_delete" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles';

    EXECUTE 'CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (auth.uid() IS NOT NULL)';
    EXECUTE 'CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id)';
    EXECUTE 'CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id)';
    EXECUTE 'CREATE POLICY "profiles_admin_update" ON public.profiles FOR UPDATE USING (public.is_admin())';
    EXECUTE 'CREATE POLICY "profiles_admin_delete" ON public.profiles FOR DELETE USING (public.is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.topics') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "topics_admin_insert" ON public.topics';
    EXECUTE 'DROP POLICY IF EXISTS "topics_admin_update" ON public.topics';
    EXECUTE 'DROP POLICY IF EXISTS "topics_admin_delete" ON public.topics';
    EXECUTE 'CREATE POLICY "topics_admin_insert" ON public.topics FOR INSERT WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY "topics_admin_update" ON public.topics FOR UPDATE USING (public.is_admin())';
    EXECUTE 'CREATE POLICY "topics_admin_delete" ON public.topics FOR DELETE USING (public.is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.questions') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "questions_admin_insert" ON public.questions';
    EXECUTE 'DROP POLICY IF EXISTS "questions_admin_update" ON public.questions';
    EXECUTE 'DROP POLICY IF EXISTS "questions_admin_delete" ON public.questions';
    EXECUTE 'CREATE POLICY "questions_admin_insert" ON public.questions FOR INSERT WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY "questions_admin_update" ON public.questions FOR UPDATE USING (public.is_admin())';
    EXECUTE 'CREATE POLICY "questions_admin_delete" ON public.questions FOR DELETE USING (public.is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.user_answers') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "user_answers_admin_select" ON public.user_answers';
    EXECUTE 'CREATE POLICY "user_answers_admin_select" ON public.user_answers FOR SELECT USING (public.is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.exam_sessions') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "exam_sessions_admin_select" ON public.exam_sessions';
    EXECUTE 'CREATE POLICY "exam_sessions_admin_select" ON public.exam_sessions FOR SELECT USING (public.is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.exam_answers') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "exam_answers_admin_select" ON public.exam_answers';
    EXECUTE 'CREATE POLICY "exam_answers_admin_select" ON public.exam_answers FOR SELECT USING (public.is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.exam_scores') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "exam_scores_admin_select" ON public.exam_scores';
    EXECUTE 'CREATE POLICY "exam_scores_admin_select" ON public.exam_scores FOR SELECT USING (public.is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.quiz_sessions') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "quiz_sessions_admin_select" ON public.quiz_sessions';
    EXECUTE 'CREATE POLICY "quiz_sessions_admin_select" ON public.quiz_sessions FOR SELECT USING (public.is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.question_attempts') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "question_attempts_admin_select" ON public.question_attempts';
    EXECUTE 'CREATE POLICY "question_attempts_admin_select" ON public.question_attempts FOR SELECT USING (public.is_admin())';
  END IF;
END $$;
