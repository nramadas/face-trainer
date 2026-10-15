import { describe, expect, it } from 'vitest';
import { EMOTIONS, RAW_EMOTIONS, getEmotion, lookAlikeIds } from './emotions';
import { gold } from './emotions/gold';
import { ALL_IDS, GROUPS, GROUP_MEMBERS } from './groups';
import { DEFAULT_ORDER } from './order';
import { START_ORDER, MIN_LOOKALIKE_GAP, MAX_SAME_GROUP_RUN } from './orderRules';
import { validateEmotion, faceKey } from './validate';
import { FACE_KEYS, PARAM_SPECS } from '../face/params';

/** The table from the brief, by display name. */
const TABLE: Record<string, string[]> = {
  uncertain: ['Stress', 'Overwhelm', 'Anxiety', 'Worry', 'Avoidance', 'Excitement', 'Dread', 'Fear', 'Vulnerability'],
  compare: ['Comparison', 'Admiration', 'Reverence', 'Envy', 'Jealousy', 'Resentment', 'Schadenfreude', 'Freudenfreude'],
  unplanned: ['Boredom', 'Disappointment', 'Expectations', 'Regret', 'Discouragement', 'Resignation', 'Frustration'],
  beyond: ['Awe', 'Wonder', 'Confusion', 'Curiosity', 'Interest', 'Surprise'],
  'not-what-they-seem': ['Amusement', 'Bittersweetness', 'Nostalgia', 'Cognitive Dissonance', 'Paradox', 'Irony', 'Sarcasm'],
  hurting: ['Anguish', 'Hopelessness', 'Despair', 'Sadness', 'Grief'],
  'with-others': ['Compassion', 'Pity', 'Empathy', 'Sympathy', 'Boundaries', 'Comparative Suffering'],
  'fall-short': ['Shame', 'Self-Compassion', 'Perfectionism', 'Guilt', 'Humiliation', 'Embarrassment'],
  connection: ['Belonging', 'Fitting In', 'Connection', 'Disconnection', 'Insecurity', 'Invisibility', 'Loneliness'],
  'heart-open': ['Love', 'Lovelessness', 'Heartbreak', 'Trust', 'Self-Trust', 'Betrayal', 'Defensiveness', 'Flooding', 'Hurt'],
  'life-good': ['Joy', 'Happiness', 'Calm', 'Contentment', 'Gratitude', 'Foreboding Joy', 'Relief', 'Tranquility'],
  wronged: ['Anger', 'Contempt', 'Disgust', 'Dehumanization', 'Hate', 'Self-Righteousness'],
  'self-assess': ['Pride', 'Hubris', 'Humility'],
};

describe('emotion data', () => {
  it('has exactly 87 entries', () => {
    expect(EMOTIONS).toHaveLength(87);
    expect(RAW_EMOTIONS).toHaveLength(87);
    expect(ALL_IDS).toHaveLength(87);
  });

  it('has unique ids', () => {
    expect(new Set(RAW_EMOTIONS.map((e) => e.id)).size).toBe(87);
  });

  it('has 13 groups with exactly the right members', () => {
    expect(GROUPS).toHaveLength(13);
    for (const g of GROUPS) {
      const names = EMOTIONS.filter((e) => e.group === g.id).map((e) => e.name);
      expect(names, g.id).toEqual(TABLE[g.id]);
      expect(GROUP_MEMBERS[g.id]).toHaveLength(TABLE[g.id].length);
    }
  });

  it('passes validation for every entry (fields, tiers, ranges, links, no emoji)', () => {
    const errors = RAW_EMOTIONS.flatMap((e) => validateEmotion(e));
    expect(errors).toEqual([]);
  });

  it('only links to emotions that exist', () => {
    for (const e of EMOTIONS) for (const c of e.confusedWith) expect(getEmotion(c.id), `${e.id} -> ${c.id}`).toBeDefined();
  });

  it('gives every context entry a playable note', () => {
    for (const e of EMOTIONS.filter((x) => x.tier === 'context')) expect(e.playableNote?.trim(), e.id).toBeTruthy();
  });

  it('keeps every face parameter inside its documented range', () => {
    for (const e of EMOTIONS) {
      for (const [k, v] of Object.entries(e.face)) {
        const spec = PARAM_SPECS[k as keyof typeof PARAM_SPECS];
        expect(spec, `${e.id}.${k}`).toBeDefined();
        expect(v, `${e.id}.${k}`).toBeGreaterThanOrEqual(spec.min);
        expect(v, `${e.id}.${k}`).toBeLessThanOrEqual(spec.max);
      }
    }
  });

  it('never gives two emotions identical face parameters', () => {
    const seen = new Map<string, string>();
    for (const e of EMOTIONS) {
      const k = faceKey(e.face);
      expect(seen.get(k), `${e.id} duplicates ${seen.get(k)}`).toBeUndefined();
      seen.set(k, e.id);
    }
  });

  it('makes close pairs differ visibly in the face, not just in text', () => {
    const pairs = [
      ['envy', 'jealousy'], ['sympathy', 'empathy'], ['sympathy', 'pity'], ['empathy', 'pity'],
      ['sadness', 'grief'], ['sadness', 'despair'], ['sadness', 'anguish'], ['grief', 'despair'], ['grief', 'anguish'], ['despair', 'anguish'],
      ['joy', 'happiness'], ['calm', 'tranquility'], ['guilt', 'shame'], ['guilt', 'embarrassment'], ['shame', 'embarrassment'],
      ['pride', 'hubris'], ['anger', 'hate'], ['anger', 'contempt'], ['hate', 'contempt'],
    ];
    const dist = (a: string, b: string) => {
      const A = getEmotion(a)!.face;
      const B = getEmotion(b)!.face;
      return FACE_KEYS.reduce((s, k) => {
        const range = PARAM_SPECS[k].max - PARAM_SPECS[k].min;
        return s + Math.abs((A[k] ?? 0) - (B[k] ?? 0)) / range;
      }, 0);
    };
    for (const [a, b] of pairs) expect(dist(a, b), `${a} vs ${b}`).toBeGreaterThan(0.4);
  });

  it('keeps the five gold-standard entries exactly as given', () => {
    const stress = gold.find((e) => e.id === 'stress')!;
    expect(stress.face).toEqual({ browInner: 0.75, browOuter: 0.05, squeeze: 0.5, eyeOpen: 0.3, lowerLid: 0.35, gx: 0.25, cornerUp: -0.2, press: 0.6, stretch: 0.5, chin: 0.2, jaw: 0.9, shoulders: 1 });
    expect(stress.oneLiner).toBe('Too much is coming at you, and you are holding it together.');
    expect(gold.find((e) => e.id === 'hurt')!.line).toBe('You told them? That was mine to tell.');
    expect(gold.find((e) => e.id === 'confusion')!.confusedWith[0].id).toBe('interest');
    expect(gold.map((e) => e.id)).toEqual(['stress', 'shame', 'frustration', 'hurt', 'confusion']);
  });
});

describe('default new-emotion order', () => {
  it('contains all 87 exactly once', () => {
    expect(DEFAULT_ORDER).toHaveLength(87);
    expect(new Set(DEFAULT_ORDER)).toEqual(new Set(ALL_IDS));
  });

  it('starts with the fixed 20', () => {
    expect(DEFAULT_ORDER.slice(0, 20)).toEqual(START_ORDER);
  });

  it('puts context entries after face and face-body entries (after the start)', () => {
    const tiers = DEFAULT_ORDER.slice(20).map((id) => getEmotion(id)!.tier);
    const firstContext = tiers.indexOf('context');
    expect(tiers.slice(firstContext).every((t) => t === 'context')).toBe(true);
  });

  it(`never has more than ${MAX_SAME_GROUP_RUN} from the same group in a row (after the start)`, () => {
    for (let i = 20; i < DEFAULT_ORDER.length; i++) {
      const run = DEFAULT_ORDER.slice(i - MAX_SAME_GROUP_RUN, i + 1).map((id) => getEmotion(id)!.group);
      expect(new Set(run).size, DEFAULT_ORDER.slice(i - 2, i + 1).join(',')).toBeGreaterThan(1);
    }
  });

  it(`keeps look-alikes at least ${MIN_LOOKALIKE_GAP} places apart (after the start)`, () => {
    for (let i = 20; i < DEFAULT_ORDER.length; i++) {
      const id = DEFAULT_ORDER[i];
      for (let k = 1; k < MIN_LOOKALIKE_GAP; k++) {
        expect(lookAlikeIds(id).includes(DEFAULT_ORDER[i - k]), `${id} near ${DEFAULT_ORDER[i - k]}`).toBe(false);
      }
    }
  });
});
