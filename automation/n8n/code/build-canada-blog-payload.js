/**
 * n8n Code node — run once per item, after "LLM (OpenAI or Claude)".
 * Input item 0: { llmJsonText } from call-llm-openai-or-claude.js
 * Form fields: node FORM_NODE (webhook normalize).
 */
const FORM_NODE = 'Normalize input';

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

function blocksToTiptap(blocks) {
  const content = [];
  for (const b of blocks || []) {
    if (!b || !b.type) continue;
    const t = String(b.text || '').trim();
    if (!t && b.type !== 'paragraph') continue;
    if (b.type === 'h1') {
      content.push({
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: t }],
      });
    } else if (b.type === 'h2') {
      content.push({
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: t }],
      });
    } else if (b.type === 'h3') {
      content.push({
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: t }],
      });
    } else if (b.type === 'paragraph') {
      content.push({
        type: 'paragraph',
        content: t ? [{ type: 'text', text: t }] : [],
      });
    } else if (b.type === 'image' && b.src) {
      content.push({
        type: 'image',
        attrs: {
          src: String(b.src),
          alt: b.alt ? String(b.alt) : null,
          title: null,
          layout: b.layout || 'center_large',
        },
      });
    }
  }
  return { type: 'doc', content };
}

const form = $(FORM_NODE).first().json;
const raw = items[0].json?.llmJsonText;
if (!raw || typeof raw !== 'string') {
  throw new Error('Expected llmJsonText from LLM node');
}

let ai;
try {
  ai = JSON.parse(raw);
} catch {
  throw new Error(`Model did not return valid JSON. First 300 chars: ${raw.slice(0, 300)}`);
}

const title = String(ai.title || form.title || '').trim();
const slug = slugify(ai.slug || title);
const excerpt = String(ai.excerpt || '').trim().slice(0, 300);
const coverFromForm = String(form.cover_image_url || '').trim();
const coverFromAi = String(ai.cover_image || '').trim();
const cover_image = coverFromForm || coverFromAi || null;

const content = blocksToTiptap(ai.blocks);

/** Payload written to Drive + consumed by sync workflow */
const blogDraft = {
  title,
  slug,
  excerpt: excerpt || null,
  cover_image,
  content,
  /** Sync workflow maps this to Supabase status */
  publish: ai.publish !== false,
  source: 'n8n',
  generated_at: new Date().toISOString(),
};

return [{ json: blogDraft }];
