import type { FaceParams } from '../face/params';
import type { GroupId } from './groups';

export type Tier = 'face' | 'face-body' | 'context';

export type ZoneKey = 'brows' | 'eyes' | 'mouth' | 'head' | 'breath';

export interface Emotion {
  /** kebab-case, e.g. 'foreboding-joy' */
  id: string;
  name: string;
  group: GroupId;
  /** Own words, one or two plain sentences. */
  definition: string;
  /** The moment to play. */
  oneLiner: string;
  tier: Tier;
  /** Required when tier === 'context': the face and body an actor would use, and what it borrows from. */
  playableNote?: string;
  /** The single most important cue. */
  keyCue: string;
  /** Build order, literal instructions, 1 to 3 sentences each. */
  zones: Record<ZoneKey, string>;
  /** FACS codes for reference and image prompts. */
  actionUnits: string[];
  /** 1 to 3 closest look-alikes and the one visible difference. */
  confusedWith: { id: string; difference: string }[];
  /** A short practice line to say in character. */
  line: string;
  face: FaceParams;
  /** Paths under public/, may not exist yet. */
  images: { male: string; female: string };
}

export const ZONE_ORDER: { key: ZoneKey; label: string; highlight: 'brows' | 'eyes' | 'mouth' | 'head' }[] = [
  { key: 'brows', label: 'Brows', highlight: 'brows' },
  { key: 'eyes', label: 'Eyes', highlight: 'eyes' },
  { key: 'mouth', label: 'Mouth and jaw', highlight: 'mouth' },
  { key: 'head', label: 'Head and body', highlight: 'head' },
  { key: 'breath', label: 'Breath', highlight: 'head' },
];

export const TIER_LABEL: Record<Tier, string> = {
  face: 'Face',
  'face-body': 'Face and body',
  context: 'Context',
};

export const CONTEXT_NOTE =
  'This one is carried mostly by context and how you say the line. Here is a playable version.';

export function imagePaths(id: string) {
  return { male: `faces/${id}-male.webp`, female: `faces/${id}-female.webp` };
}
