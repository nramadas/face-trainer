export const GROUPS = [
  { id: 'uncertain', short: 'Too much', label: 'Places we go when things are uncertain or too much' },
  { id: 'compare', short: 'Comparing', label: 'Places we go when we compare' },
  { id: 'unplanned', short: 'Not as planned', label: "Places we go when things don't go as planned" },
  { id: 'beyond', short: 'Beyond us', label: "Places we go when it's beyond us" },
  { id: 'not-what-they-seem', short: 'Not as it seems', label: "Places we go when things aren't what they seem" },
  { id: 'hurting', short: 'Hurting', label: "Places we go when we're hurting" },
  { id: 'with-others', short: 'With others', label: 'Places we go with others' },
  { id: 'fall-short', short: 'Falling short', label: 'Places we go when we fall short' },
  { id: 'connection', short: 'Connection', label: 'Places we go when we search for connection' },
  { id: 'heart-open', short: 'Heart open', label: 'Places we go when the heart is open' },
  { id: 'life-good', short: 'Life is good', label: 'Places we go when life is good' },
  { id: 'wronged', short: 'Wronged', label: 'Places we go when we feel wronged' },
  { id: 'self-assess', short: 'Self-assess', label: 'Places we go to self-assess' },
] as const;

export type GroupId = (typeof GROUPS)[number]['id'];

/** The 87 names, grouped exactly as in Atlas of the Heart. Order matters for display. */
export const GROUP_MEMBERS: Record<GroupId, readonly string[]> = {
  uncertain: ['stress', 'overwhelm', 'anxiety', 'worry', 'avoidance', 'excitement', 'dread', 'fear', 'vulnerability'],
  compare: ['comparison', 'admiration', 'reverence', 'envy', 'jealousy', 'resentment', 'schadenfreude', 'freudenfreude'],
  unplanned: ['boredom', 'disappointment', 'expectations', 'regret', 'discouragement', 'resignation', 'frustration'],
  beyond: ['awe', 'wonder', 'confusion', 'curiosity', 'interest', 'surprise'],
  'not-what-they-seem': ['amusement', 'bittersweetness', 'nostalgia', 'cognitive-dissonance', 'paradox', 'irony', 'sarcasm'],
  hurting: ['anguish', 'hopelessness', 'despair', 'sadness', 'grief'],
  'with-others': ['compassion', 'pity', 'empathy', 'sympathy', 'boundaries', 'comparative-suffering'],
  'fall-short': ['shame', 'self-compassion', 'perfectionism', 'guilt', 'humiliation', 'embarrassment'],
  connection: ['belonging', 'fitting-in', 'connection', 'disconnection', 'insecurity', 'invisibility', 'loneliness'],
  'heart-open': ['love', 'lovelessness', 'heartbreak', 'trust', 'self-trust', 'betrayal', 'defensiveness', 'flooding', 'hurt'],
  'life-good': ['joy', 'happiness', 'calm', 'contentment', 'gratitude', 'foreboding-joy', 'relief', 'tranquility'],
  wronged: ['anger', 'contempt', 'disgust', 'dehumanization', 'hate', 'self-righteousness'],
  'self-assess': ['pride', 'hubris', 'humility'],
};

export const ALL_IDS: readonly string[] = Object.values(GROUP_MEMBERS).flat();

const byId = new Map<string, (typeof GROUPS)[number]>(GROUPS.map((g) => [g.id, g]));
export function groupInfo(id: GroupId) {
  return byId.get(id)!;
}
