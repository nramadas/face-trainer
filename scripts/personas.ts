/**
 * The two people used for every photo. Edit the descriptions freely, then
 * regenerate the reference images (npm run faces:reference).
 *
 * Everything except the expression must stay the same across all 87 emotions,
 * so the user can compare faces. Keep wardrobe, background, framing and
 * lighting identical for both personas.
 */
export type PersonaId = 'male' | 'female';

export interface Persona {
  id: PersonaId;
  /** Who this is. Age, hair, skin, eyes, build. Keep hair off the forehead so the brows always show. */
  description: string;
}

export const PERSONAS: Record<PersonaId, Persona> = {
  male: {
    id: 'male',
    description:
      'a man about 30 years old, with short dark brown hair cut neatly above the ears and swept back off the forehead, clean-shaven, medium-olive skin, dark brown eyes, natural eyebrows, average build',
  },
  female: {
    id: 'female',
    description:
      'a woman about 30 years old, with dark brown hair pulled back into a low ponytail so the forehead, brows and ears are fully visible, light-medium skin, hazel eyes, natural eyebrows, average build',
  },
};

/** Shared by both personas and every image. */
export const SHOT = {
  wardrobe: 'Wearing a plain mid-grey crew-neck t-shirt.',
  background: 'Plain, even mid-grey studio backdrop with no texture or gradient.',
  framing: 'Head and shoulders, facing the camera straight on, camera at eye level, centered, vertical 4:5 portrait.',
  lighting: 'Soft, even, frontal studio light. No dramatic shadows, no rim light, no color cast.',
  grooming: 'No visible makeup beyond natural, no jewelry, no glasses. Hair kept off the face so the brows and forehead are always visible.',
};

export function referencePrompt(p: Persona): string {
  return [
    `Photorealistic studio portrait photograph of ${p.description}.`,
    SHOT.wardrobe,
    SHOT.background,
    SHOT.framing,
    SHOT.lighting,
    SHOT.grooming,
    'Neutral, relaxed expression: brows relaxed, jaw loose, lips gently closed, eyes looking straight into the camera. Shoulders level and relaxed.',
    'Sharp focus, natural skin texture, true-to-life color.',
  ].join(' ');
}
