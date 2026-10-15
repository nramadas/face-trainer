import files from 'virtual:face-photos';

export type Persona = 'male' | 'female';
const available = new Set(files);

/** URL of a generated photo, or null if it has not been generated yet. */
export function photoUrl(id: string, persona: Persona): string | null {
  const name = `${id}-${persona}.webp`;
  return available.has(name) ? `${import.meta.env.BASE_URL}faces/${name}` : null;
}

export function allPhotoUrls(): string[] {
  return [...available].map((f) => `${import.meta.env.BASE_URL}faces/${f}`);
}

export const PHOTO_CACHE = 'face-photos';
