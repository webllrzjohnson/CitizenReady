/**
 * n8n Code node — after Google Drive Download of a blog JSON file.
 * Environment variables (Settings → Variables):
 *   SUPABASE_URL         — https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY — service_role JWT (never expose to browsers)
 *   CITIZENREADY_BLOG_AUTHOR_ID — UUID of an existing profiles.id to attribute posts
 *
 * Output: { inserted, skipped, slug, driveFileId, reason? }
 * Wire IF on `inserted` then Drive → Move to "posted" folder.
 */
let supabaseUrl = String($env.SUPABASE_URL || '').trim();
if (supabaseUrl.endsWith('/')) supabaseUrl = supabaseUrl.slice(0, -1);
const key = String($env.SUPABASE_SERVICE_ROLE_KEY || '');
const authorId = String($env.CITIZENREADY_BLOG_AUTHOR_ID || '');

if (!supabaseUrl || !key || !authorId) {
  throw new Error('Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CITIZENREADY_BLOG_AUTHOR_ID in n8n variables');
}

const bin = items[0].binary?.data;
if (!bin?.data) throw new Error('Expected binary.data from Drive download');

const text = Buffer.from(bin.data, 'base64').toString('utf8');
const draft = JSON.parse(text);

const slug = String(draft.slug || '').trim();
if (!slug) throw new Error('Draft missing slug');

const driveFileId = String($('Keep Drive file id').first().json.driveFileId || '').trim();
if (!driveFileId) {
  throw new Error('Missing driveFileId from node Keep Drive file id (run Set before Download).');
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
};

const checkUrl = `${supabaseUrl}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(slug)}&select=id`;

const existing = await this.helpers.httpRequest({
  method: 'GET',
  url: checkUrl,
  headers,
  json: true,
});

if (Array.isArray(existing) && existing.length > 0) {
  return [
    {
      json: {
        skipped: true,
        inserted: false,
        reason: 'slug_already_exists',
        slug,
        driveFileId,
      },
    },
  ];
}

const publish = draft.publish !== false;
const row = {
  title: draft.title,
  slug: draft.slug,
  excerpt: draft.excerpt ?? null,
  cover_image: draft.cover_image ?? null,
  content: draft.content,
  author_id: authorId,
  status: publish ? 'published' : 'draft',
  published_at: publish ? new Date().toISOString() : null,
};

await this.helpers.httpRequest({
  method: 'POST',
  url: `${supabaseUrl}/rest/v1/blog_posts`,
  headers: {
    ...headers,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
  },
  body: row,
  json: true,
});

return [{ json: { inserted: true, skipped: false, slug, driveFileId } }];
