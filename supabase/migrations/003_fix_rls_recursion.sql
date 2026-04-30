-- =====================================================
-- FIX: Infinite recursion in RLS policies
-- =====================================================
-- The issue: Policies on profiles table were querying profiles table
-- to check admin role, causing infinite recursion.
--
-- Solution: Create a security definer function that bypasses RLS
-- to check if current user is an admin.
-- =====================================================

-- Drop existing problematic policies (only the ones that exist)
DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_delete" ON profiles;
DROP POLICY IF EXISTS "topics_admin_insert" ON topics;
DROP POLICY IF EXISTS "topics_admin_update" ON topics;
DROP POLICY IF EXISTS "topics_admin_delete" ON topics;
DROP POLICY IF EXISTS "questions_admin_insert" ON questions;
DROP POLICY IF EXISTS "questions_admin_update" ON questions;
DROP POLICY IF EXISTS "questions_admin_delete" ON questions;
DROP POLICY IF EXISTS "question_attempts_admin_select" ON question_attempts;
DROP POLICY IF EXISTS "quiz_sessions_admin_select" ON quiz_sessions;

-- Create a security definer function to check admin role
-- This function runs with the privileges of the function owner (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RECREATE PROFILES POLICIES (Fixed)
-- =====================================================

-- Admins can update any profile (using security definer function)
CREATE POLICY "profiles_admin_update" ON profiles
    FOR UPDATE
    USING (public.is_admin());

-- Only admins can delete profiles
CREATE POLICY "profiles_admin_delete" ON profiles
    FOR DELETE
    USING (public.is_admin());

-- =====================================================
-- RECREATE TOPICS POLICIES (Fixed)
-- =====================================================

-- Only admins can insert topics
CREATE POLICY "topics_admin_insert" ON topics
    FOR INSERT
    WITH CHECK (public.is_admin());

-- Only admins can update topics
CREATE POLICY "topics_admin_update" ON topics
    FOR UPDATE
    USING (public.is_admin());

-- Only admins can delete topics
CREATE POLICY "topics_admin_delete" ON topics
    FOR DELETE
    USING (public.is_admin());

-- =====================================================
-- RECREATE QUESTIONS POLICIES (Fixed)
-- =====================================================

-- Only admins can insert questions
CREATE POLICY "questions_admin_insert" ON questions
    FOR INSERT
    WITH CHECK (public.is_admin());

-- Only admins can update questions
CREATE POLICY "questions_admin_update" ON questions
    FOR UPDATE
    USING (public.is_admin());

-- Only admins can delete questions
CREATE POLICY "questions_admin_delete" ON questions
    FOR DELETE
    USING (public.is_admin());

-- =====================================================
-- RECREATE OTHER ADMIN POLICIES (Fixed)
-- =====================================================

-- Admins can read all question attempts
CREATE POLICY "question_attempts_admin_select" ON question_attempts
    FOR SELECT
    USING (public.is_admin());

-- Admins can read all quiz sessions
CREATE POLICY "quiz_sessions_admin_select" ON quiz_sessions
    FOR SELECT
    USING (public.is_admin());
