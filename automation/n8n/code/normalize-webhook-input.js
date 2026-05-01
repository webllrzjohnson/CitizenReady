/**
 * n8n Code node — place after Webhook. Normalizes POST JSON body.
 */
const b = $json.body ?? $json;
const title = String(b.title ?? '').trim();
const context = String(b.context ?? '').trim();
const cover_image_url = String(b.cover_image_url ?? b.coverImageUrl ?? '').trim();
if (!title) throw new Error('title is required');
if (!context) throw new Error('context is required');
return [{ json: { title, context, cover_image_url } }];
