-- Blog posts (Tiptap JSON in content)
CREATE TYPE blog_post_status AS ENUM ('draft', 'published');

CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    cover_image TEXT,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status blog_post_status NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status_published_at ON blog_posts(status, published_at DESC NULLS LAST);

CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Anonymous and authenticated users can read published posts
CREATE POLICY "blog_posts_select_published" ON blog_posts
    FOR SELECT
    USING (status = 'published');

-- Admins can read all posts (drafts + published)
CREATE POLICY "blog_posts_admin_select" ON blog_posts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "blog_posts_admin_insert" ON blog_posts
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
        AND author_id = auth.uid()
    );

CREATE POLICY "blog_posts_admin_update" ON blog_posts
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "blog_posts_admin_delete" ON blog_posts
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
