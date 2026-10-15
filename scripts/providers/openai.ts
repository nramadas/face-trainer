import { failFromResponse, ProviderError, requireKey, type ImageProvider } from './types';

/**
 * OpenAI image model. Uses the edits endpoint with high input fidelity to keep
 * the face. Output is 2:3 and is cropped to 4:5 afterwards.
 * Override the model with FACES_MODEL.
 */
export function openaiProvider(): ImageProvider {
  const model = process.env.FACES_MODEL || 'gpt-image-1';

  async function parse(res: Response): Promise<Buffer> {
    if (!res.ok) await failFromResponse(res);
    const json = (await res.json()) as { data?: { b64_json?: string }[] };
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) throw new ProviderError('OpenAI returned no image.', true);
    return Buffer.from(b64, 'base64');
  }

  return {
    name: 'openai',
    model,
    async generate(prompt) {
      const key = requireKey('OPENAI_API_KEY');
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model, prompt, size: '1024x1536', quality: 'high', n: 1 }),
      });
      return parse(res);
    },
    async edit(prompt, reference) {
      const key = requireKey('OPENAI_API_KEY');
      const form = new FormData();
      form.append('model', model);
      form.append('prompt', prompt);
      form.append('size', '1024x1536');
      form.append('quality', 'high');
      form.append('input_fidelity', 'high');
      form.append('image[]', new Blob([new Uint8Array(reference)], { type: 'image/png' }), 'reference.png');
      const res = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: form });
      return parse(res);
    },
  };
}
