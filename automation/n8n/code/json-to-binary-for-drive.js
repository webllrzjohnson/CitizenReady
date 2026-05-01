/**
 * n8n Code node — after Build TipTap payload. Prepares binary for Google Drive upload.
 * Drive node: Input Data Field Name = "data"
 */
const slug = String($json.slug || 'post').replace(/[^a-z0-9-]/gi, '-');
const fileName = `blog-${slug}-${Date.now()}.json`;
const jsonStr = JSON.stringify($json, null, 2);
const buf = Buffer.from(jsonStr, 'utf8');
const bin = await this.helpers.prepareBinaryData(buf, fileName, 'application/json');
return [{ json: $json, binary: { data: bin } }];
