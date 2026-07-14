-- Optional: run on existing databases after upgrading (new installs get these from db/schema.sql)
INSERT INTO public.site_settings (key, value) VALUES
    ('ai_blog_provider', 'anthropic'),
    ('ai_blog_model', 'claude-sonnet-4-6')
ON CONFLICT (key) DO NOTHING;
