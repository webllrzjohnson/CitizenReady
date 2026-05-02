/**
 * n8n Code node — place after "Normalize input". Calls Claude Messages API only.
 * Env:
 *   ANTHROPIC_API_KEY   — required
 *   ANTHROPIC_MODEL     — optional, default claude-sonnet-4-20250514
 * Sync with prompts in automation/n8n/prompts/openai-blog-system.txt
 */
function stripJsonFence(s) {
  let t = String(s || '').trim();
  t = t.replace(/^```(?:json)?\s*/i, '');
  t = t.replace(/\s*```$/i, '');
  return t.trim();
}

// Keep aligned with automation/n8n/prompts/openai-blog-system.txt
const SYSTEM = `You are an editor for a Canada-focused travel and culture blog (CitizenReady).

CRITICAL: The user message includes a Title hint and a Context block. Write the article ONLY from that Context. Expand, organize, and polish the ideas already in the Context. Do not switch to unrelated Canadian topics, places, or stories. Do not replace the user's topic with generic "Canada travel" filler. If the Context is brief, stay on that topic and develop it sensibly rather than inventing a different theme.

Rules:
- Every section must clearly follow from the supplied Context. Title and excerpt must match this specific topic.
- Keep content appropriate for Canada-focused readers (travel, cities, culture, etc.) only as it fits the Context.
- Warm, informative tone. No clickbait. If unsure of a fact, qualify it or avoid inventing statistics.
- Output ONLY valid JSON (no markdown fences). Schema:
{
  "title": "string, compelling and specific",
  "slug": "optional string, lowercase hyphenated; may be omitted",
  "excerpt": "string, max 300 chars, summary for listings",
  "cover_image": "optional absolute https URL if user did not supply one and you suggest a placeholder from a reputable free stock/CDN — only https URLs",
  "publish": true,
  "blocks": [
    { "type": "h2", "text": "Section title" },
    { "type": "paragraph", "text": "Body ..." },
    { "type": "image", "src": "https://...", "alt": "...", "layout": "center_large" }
  ]
}
- Include at least 3 h2 sections and several paragraphs. You may add one or two h3s where useful.
- blocks must represent the full article in reading order.`;

const input = $json;
const userMessage = `Write the full blog post using ONLY the information and angle below.

Title hint: ${input.title}

Context — sole source for topics, facts, and emphasis (stay faithful):
${input.context}

Optional cover image URL (use in output when provided): ${input.cover_image_url || 'none'}`;

const key = String($env.ANTHROPIC_API_KEY || '').trim();
if (!key) throw new Error('ANTHROPIC_API_KEY is required');
const model = String($env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514').trim();

const res = await this.helpers.httpRequest({
  method: 'POST',
  url: 'https://api.anthropic.com/v1/messages',
  headers: {
    'x-api-key': key,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  },
  body: {
    model,
    max_tokens: 8192,
    temperature: 0.35,
    system: SYSTEM,
    messages: [{ role: 'user', content: userMessage }],
  },
  json: true,
});

const block = Array.isArray(res.content) ? res.content.find((c) => c.type === 'text') : null;
const llmJsonText = stripJsonFence(block?.text);
if (!llmJsonText) throw new Error('Claude response missing text content');

return [
  {
    json: {
      llmJsonText,
      _llmProvider: 'anthropic',
    },
  },
];
