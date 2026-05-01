/**
 * n8n Code node — after Google Drive Download. Converts file binary to JSON object.
 * Expects binary property name "data" (n8n default for Drive download).
 */
const bin = items[0].binary?.data;
if (!bin?.data) throw new Error('No binary.data on item');

const text = Buffer.from(bin.data, 'base64').toString('utf8');
let draft;
try {
  draft = JSON.parse(text);
} catch (e) {
  throw new Error(`Invalid JSON in Drive file: ${String(e)}`);
}

const meta = items[0].json;
const driveFileId =
  meta.id || meta.fileId || meta.file?.id || $('SplitInBatches').first()?.json?.id;

return [{ json: { ...draft, _driveFileId: driveFileId } }];
