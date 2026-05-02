/**
 * n8n Code node — place after Webhook. Normalizes POST JSON body.
 * Handles n8n shapes: body object, stringified JSON, top-level fields, or nested data/json.
 */
function pickPayload(root) {
  let raw = root?.body ?? root?.data ?? root?.json ?? root;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      throw new Error('Webhook body must be JSON with title and context');
    }
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Invalid webhook payload: expected JSON object with title and context');
  }
  return raw;
}

const b = pickPayload($json);
const title = String(b.title ?? '').trim();
const context = String(b.context ?? '').trim();
const cover_image_url = String(b.cover_image_url ?? b.coverImageUrl ?? '').trim();
if (!title) throw new Error('title is required');
if (!context) throw new Error('context is required');
return [{ json: { title, context, cover_image_url } }];
