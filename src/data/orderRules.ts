/** The first 20 new emotions: the five the user already knows, then strong, clear anchor faces. */
export const START_ORDER: readonly string[] = [
  'stress', 'shame', 'frustration', 'hurt', 'confusion', 'joy', 'sadness', 'anger', 'fear', 'surprise',
  'disgust', 'contempt', 'calm', 'embarrassment', 'pride', 'curiosity', 'anxiety', 'relief', 'boredom', 'guilt',
];

/** Look-alikes must be at least this many sessions apart in the default order (after the fixed start). */
export const MIN_LOOKALIKE_GAP = 3;
/** Never more than this many from the same group in a row. */
export const MAX_SAME_GROUP_RUN = 2;
