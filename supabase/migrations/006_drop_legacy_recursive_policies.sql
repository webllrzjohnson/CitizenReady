-- =====================================================
-- CLEANUP: drop legacy recursive "Admins can ..." policies
-- =====================================================
-- These older policies query public.profiles directly inside policy
-- expressions, which can trigger infinite recursion under RLS.
-- =====================================================

DO $$
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles';
  END IF;

  IF to_regclass('public.topics') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can insert topics" ON public.topics';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can update topics" ON public.topics';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can delete topics" ON public.topics';
  END IF;

  IF to_regclass('public.questions') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can read all questions" ON public.questions';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can insert questions" ON public.questions';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can update questions" ON public.questions';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can delete questions" ON public.questions';
  END IF;

  IF to_regclass('public.quiz_sessions') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can read all sessions" ON public.quiz_sessions';
  END IF;

  IF to_regclass('public.question_attempts') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can read all attempts" ON public.question_attempts';
  END IF;

  IF to_regclass('public.user_answers') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can read all answers" ON public.user_answers';
  END IF;

  IF to_regclass('public.exam_sessions') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can read all exam sessions" ON public.exam_sessions';
  END IF;

  IF to_regclass('public.exam_answers') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can read all exam answers" ON public.exam_answers';
  END IF;

  IF to_regclass('public.exam_scores') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can read all scores" ON public.exam_scores';
  END IF;
END $$;
