import { describe, expect, it } from 'vitest';
import { suggestRating } from './rating';

describe('suggestRating', () => {
  it('Again when the key cue is missed, even with all zones', () => expect(suggestRating(false, 5, 1000).grade).toBe(1));
  it('Again with fewer than 3 zones', () => expect(suggestRating(true, 2, 1000).grade).toBe(1));
  it('Hard with the key cue and 3 or 4 zones', () => {
    expect(suggestRating(true, 3, 1000).grade).toBe(2);
    expect(suggestRating(true, 4, 9000).grade).toBe(2);
  });
  it('Good with all zones over 4 seconds', () => expect(suggestRating(true, 5, 4001).grade).toBe(3));
  it('Easy with all zones in 4 seconds or under', () => {
    expect(suggestRating(true, 5, 4000).grade).toBe(4);
    expect(suggestRating(true, 5, 1500).grade).toBe(4);
  });
  it('always gives a reason', () => expect(suggestRating(true, 3, 1000).reason.length).toBeGreaterThan(5));
});
