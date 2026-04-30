-- =====================================================
-- FINAL FIX: Infinite recursion in RLS policies
-- =====================================================
-- Some environments use the older exam_* / user_answers schema,
-- while others use quiz_sessions / question_attempts. This migration
-- handles both shapes safely and removes all profile self-lookups.
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
    EXECUTE 'DROP POLICY IF EXISTS "topics_select_all" ON public.topics';
    EXECUTE 'DROP POLICY IF EXISTS "topics_admin_insert" ON public.topics';
    EXECUTE 'DROP POLICY IF EXISTS "topics_admin_update" ON public.topics';
    EXECUTE 'DROP POLICY IF EXISTS "topics_admin_delete" ON public.topics';

    EXECUTE 'CREATE POLICY "topics_select_all" ON public.topics FOR SELECT USING (auth.uid() IS NOT NULL)';
    EXECUTE 'CREATE POLICY "topics_admin_insert" ON public.topics FOR INSERT WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY "topics_admin_update" ON public.topics FOR UPDATE USING (public.is_admin())';
    EXECUTE 'CREATE POLICY "topics_admin_delete" ON public.topics FOR DELETE USING (public.is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.questions') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "questions_select_all" ON public.questions';
    EXECUTE 'DROP POLICY IF EXISTS "questions_admin_insert" ON public.questions';
    EXECUTE 'DROP POLICY IF EXISTS "questions_admin_update" ON public.questions';
    EXECUTE 'DROP POLICY IF EXISTS "questions_admin_delete" ON public.questions';

    EXECUTE 'CREATE POLICY "questions_select_all" ON public.questions FOR SELECT USING (auth.uid() IS NOT NULL)';
    EXECUTE 'CREATE POLICY "questions_admin_insert" ON public.questions FOR INSERT WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY "questions_admin_update" ON public.questions FOR UPDATE USING (public.is_admin())';
    EXECUTE 'CREATE POLICY "questions_admin_delete" ON public.questions FOR DELETE USING (public.is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.quiz_sessions') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "quiz_sessions_select_own" ON public.quiz_sessions';
    EXECUTE 'DROP POLICY IF EXISTS "quiz_sessions_insert_own" ON public.quiz_sessions';
    EXECUTE 'DROP POLICY IF EXISTS "quiz_sessions_update_own" ON public.quiz_sessions';
    EXECUTE 'DROP POLICY IF EXISTS "quiz_sessions_admin_select" ON public.quiz_sessions';

    EXECUTE 'CREATE POLICY "quiz_sessions_select_own" ON public.quiz_sessions FOR SELECT USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "quiz_sessions_insert_own" ON public.quiz_sessions FOR INSERT WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "quiz_sessions_update_own" ON public.quiz_sessions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "quiz_sessions_admin_select" ON public.quiz_sessions FOR SELECT USING (public.is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.question_attempts') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "question_attempts_select_own" ON public.question_attempts';
    EXECUTE 'DROP POLICY IF EXISTS "question_attempts_insert_own" ON public.question_attempts';
    EXECUTE 'DROP POLICY IF EXISTS "question_attempts_admin_select" ON public.question_attempts';

    IF to_regclass('public.quiz_sessions') IS NOT NULL THEN
      EXECUTE 'CREATE POLICY "question_attempts_select_own" ON public.question_attempts FOR SELECT USING (EXISTS (SELECT 1 FROM public.quiz_sessions WHERE public.quiz_sessions.id = public.question_attempts.session_id AND public.quiz_sessions.user_id = auth.uid()))';
      EXECUTE 'CREATE POLICY "question_attempts_insert_own" ON public.question_attempts FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.quiz_sessions WHERE public.quiz_sessions.id = public.question_attempts.session_id AND public.quiz_sessions.user_id = auth.uid()))';
    END IF;

    EXECUTE 'CREATE POLICY "question_attempts_admin_select" ON public.question_attempts FOR SELECT USING (public.is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.user_answers') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "user_answers_select_own" ON public.user_answers';
    EXECUTE 'DROP POLICY IF EXISTS "user_answers_admin_select" ON public.user_answers';
    EXECUTE 'DROP POLICY IF EXISTS "user_answers_insert_own" ON public.user_answers';
    EXECUTE 'DROP POLICY IF EXISTS "user_answers_delete_own" ON public.user_answers';

    EXECUTE 'CREATE POLICY "user_answers_select_own" ON public.user_answers FOR SELECT USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "user_answers_admin_select" ON public.user_answers FOR SELECT USING (public.is_admin())';
    EXECUTE 'CREATE POLICY "user_answers_insert_own" ON public.user_answers FOR INSERT WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "user_answers_delete_own" ON public.user_answers FOR DELETE USING (auth.uid() = user_id)';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.exam_sessions') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "exam_sessions_select_own" ON public.exam_sessions';
    EXECUTE 'DROP POLICY IF EXISTS "exam_sessions_admin_select" ON public.exam_sessions';
    EXECUTE 'DROP POLICY IF EXISTS "exam_sessions_insert_own" ON public.exam_sessions';
    EXECUTE 'DROP POLICY IF EXISTS "exam_sessions_update_own" ON public.exam_sessions';

    EXECUTE 'CREATE POLICY "exam_sessions_select_own" ON public.exam_sessions FOR SELECT USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "exam_sessions_admin_select" ON public.exam_sessions FOR SELECT USING (public.is_admin())';
    EXECUTE 'CREATE POLICY "exam_sessions_insert_own" ON public.exam_sessions FOR INSERT WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "exam_sessions_update_own" ON public.exam_sessions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.exam_answers') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "exam_answers_select_own" ON public.exam_answers';
    EXECUTE 'DROP POLICY IF EXISTS "exam_answers_admin_select" ON public.exam_answers';
    EXECUTE 'DROP POLICY IF EXISTS "exam_answers_insert_own" ON public.exam_answers';

    IF to_regclass('public.exam_sessions') IS NOT NULL THEN
      EXECUTE 'CREATE POLICY "exam_answers_select_own" ON public.exam_answers FOR SELECT USING (EXISTS (SELECT 1 FROM public.exam_sessions WHERE public.exam_sessions.id = public.exam_answers.exam_session_id AND public.exam_sessions.user_id = auth.uid()))';
      EXECUTE 'CREATE POLICY "exam_answers_insert_own" ON public.exam_answers FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.exam_sessions WHERE public.exam_sessions.id = public.exam_answers.exam_session_id AND public.exam_sessions.user_id = auth.uid()))';
    END IF;

    EXECUTE 'CREATE POLICY "exam_answers_admin_select" ON public.exam_answers FOR SELECT USING (public.is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.exam_scores') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "exam_scores_select_own" ON public.exam_scores';
    EXECUTE 'DROP POLICY IF EXISTS "exam_scores_admin_select" ON public.exam_scores';
    EXECUTE 'DROP POLICY IF EXISTS "exam_scores_insert_own" ON public.exam_scores';

    EXECUTE 'CREATE POLICY "exam_scores_select_own" ON public.exam_scores FOR SELECT USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "exam_scores_admin_select" ON public.exam_scores FOR SELECT USING (public.is_admin())';
    EXECUTE 'CREATE POLICY "exam_scores_insert_own" ON public.exam_scores FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;
