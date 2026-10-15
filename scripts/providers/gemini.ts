import { failFromResponse, ProviderError, requireKey, type ImageProvider } from './types';

/**
 * Google Gemini image model ("Nano Banana"). The default provider: it edits a
 * reference photo while keeping the person's identity very well, supports a
 * native 4:5 aspect ratio, and is inexpensive per image.
 * Override the model with FACES_MODEL (for example a newer Gemini image model).
 */
export function geminiProvider(): ImageProvider {
  const model = process.env.FACES_MODEL || 'gemini-2.5-flash-image';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  async function call(parts: unknown[]): Promise<Buffer> {
    const key = requireKey('GEMINI_API_KEY');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '4:5' } },
      }),
    });
    if (!res.ok) await failFromResponse(res);
    const json = (await res.json()) as {
      candidates?: { content?: { parts?: { inlineData?: { data?: string }; text?: string }[] }; finishReason?: string }[];
      promptFeedback?: { blockReason?: string };
    };
    const outParts = json.candidates?.[0]?.content?.parts ?? [];
    const img = outParts.find((p) => p.inlineData?.data);
    if (!img?.inlineData?.data) {
      const why = json.promptFeedback?.blockReason || json.candidates?.[0]?.finishReason || outParts.find((p) => p.text)?.text || 'no image returned';
      throw new ProviderError(`Gemini returned no image (${why}).`, true);
    }
    return Buffer.from(img.inlineData.data, 'base64');
  }

  return {
    name: 'gemini',
    model,
    generate: (prompt) => call([{ text: prompt }]),
    edit: (prompt, reference) => call([{ text: prompt }, { inlineData: { mimeType: 'image/png', data: reference.toString('base64') } }]),
  };
}
