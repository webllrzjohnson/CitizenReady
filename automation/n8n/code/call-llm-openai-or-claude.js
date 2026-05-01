/**
 * n8n Code node — place after "Normalize input".
 * Env:
 *   BLOG_LLM_PROVIDER   — "openai" (default) or "anthropic" / "claude"
 *   OPENAI_API_KEY      — when using OpenAI
 *   OPENAI_MODEL        — optional, default gpt-4o-mini
 *   ANTHROPIC_API_KEY   — when using Claude
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
const SYSTEM = `You are an editor for a Canada-focused travel and culture blog (CitizenReady). Write accurate, friendly, practical articles grounded in the user's context.

Rules:
- Topics must relate to Canada: travel, cities, nature, wildlife, tourism, weather, history, current events with clear Canadian angle, culture, immigration tips, etc.
- Use a warm, informative tone. No clickbait. If you are unsure of a fact, qualify it or avoid specifics rather than inventing statistics.
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
const userMessage = `Title hint: ${input.title}

Context:
${input.context}

Optional cover image URL: ${input.cover_image_url || 'none'}`;

const provider = String($env.BLOG_LLM_PROVIDER || 'openai').toLowerCase();
const useAnthropic = provider === 'anthropic' || provider === 'claude';

let llmJsonText;

if (useAnthropic) {
  const key = String($env.ANTHROPIC_API_KEY || '');
  if (!key) throw new Error('ANTHROPIC_API_KEY is required when BLOG_LLM_PROVIDER is anthropic or claude');
  const model = String($env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514');
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
      system: SYSTEM,
      messages: [{ role: 'user', content: userMessage }],
    },
    json: true,
  });
  const block = Array.isArray(res.content) ? res.content.find((c) => c.type === 'text') : null;
  llmJsonText = stripJsonFence(block?.text);
  if (!llmJsonText) throw new Error('Claude response missing text content');
} else {
  const key = String($env.OPENAI_API_KEY || '');
  if (!key) throw new Error('OPENAI_API_KEY is required when BLOG_LLM_PROVIDER is openai (or unset)');
  const model = String($env.OPENAI_MODEL || 'gpt-4o-mini');
  const res = await this.helpers.httpRequest({
    method: 'POST',
    url: 'https://api.openai.com/v1/chat/completions',
    headers: {
      authorization: `Bearer ${key}`,
      'content-type': 'application/json',
    },
    body: {
      model,
      response_format: { type: 'json_object' },
      temperature: 0.7,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: userMessage },
      ],
    },
    json: true,
  });
  llmJsonText = res.choices?.[0]?.message?.content;
  if (!llmJsonText) throw new Error('OpenAI response missing choices[0].message.content');
  llmJsonText = stripJsonFence(llmJsonText);
}

return [
  {
    json: {
      llmJsonText,
      _llmProvider: useAnthropic ? 'anthropic' : 'openai',
    },
  },
];
