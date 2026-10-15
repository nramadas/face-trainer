/** One small adapter per image provider. */
export interface ImageProvider {
  name: string;
  model: string;
  /** Text-to-image: one image per call. Used for the neutral reference candidates. */
  generate(prompt: string): Promise<Buffer>;
  /** Image-to-image: edit the reference photo, keeping the person. Used for every emotion. */
  edit(prompt: string, reference: Buffer): Promise<Buffer>;
}

export class ProviderError extends Error {
  constructor(
    message: string,
    /** True for errors worth retrying (rate limits, server errors, network). */
    public retryable: boolean,
  ) {
    super(message);
  }
}

export function requireKey(name: string): string {
  const v = process.env[name];
  if (!v) throw new ProviderError(`Set ${name} in your environment or in a .env file (see .env.example).`, false);
  return v;
}

export async function failFromResponse(res: Response): Promise<never> {
  const text = await res.text().catch(() => '');
  const retryable = res.status === 429 || res.status >= 500;
  throw new ProviderError(`HTTP ${res.status}: ${text.slice(0, 400)}`, retryable);
}
