import type { Emotion } from '../src/data/types';

/** The edit prompt for one emotion, built from its data. Same template for both personas. */
export function emotionPrompt(e: Emotion): string {
  return `Use the person in the reference photo. Keep their identity, hair, clothing, background,
lighting, framing and camera angle exactly the same. Change only the facial expression
and head/shoulder posture.

Expression: ${e.name} — ${e.oneLiner}
Brows: ${e.zones.brows}
Eyes: ${e.zones.eyes}
Mouth and jaw: ${e.zones.mouth}
Head and body: ${e.zones.head}
Facial action units: ${e.actionUnits.join(', ')}

Intensity: clear and readable, like a stage actor in a well-lit close-up, but natural,
not a cartoon or caricature. Photorealistic portrait photograph.`;
}
