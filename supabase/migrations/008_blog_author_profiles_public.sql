-- Allow anyone (including anonymous) to read profile rows that have published blog posts,
-- so public /blog pages can show author names without embedding hints.
CREATE POLICY "profiles_select_published_blog_authors" ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.blog_posts bp
      WHERE bp.author_id = profiles.id
      AND bp.status = 'published'
    )
  );
