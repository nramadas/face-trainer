import type { Emotion } from '../types';
import { imagePaths } from '../types';

export const selfAssess: Emotion[] = [
  {
    id: 'pride',
    name: 'Pride',
    group: 'self-assess',
    definition: 'A good feeling about something you did or worked hard for. You stand a little taller because of it.',
    oneLiner: 'You did something hard, and you did it well.',
    tier: 'face-body',
    keyCue: 'A small, real smile with the head tipped back a little and the chest open.',
    zones: {
      brows: 'Brows relaxed and level, maybe a slight lift.',
      eyes: 'Let the cheeks rise a little so the eyes soften. Keep the lids relaxed and look out at people, not away.',
      mouth: 'A small, real smile, lips closed or just parted. Even on both sides.',
      head: 'Tip your head back a little and lift the chin. Open your chest and pull the shoulders back. The hands may go to the hips.',
      breath: 'A full breath in that lifts and widens the chest. Hold it lightly.',
    },
    actionUnits: ['AU6', 'AU12', 'AU53'],
    confusedWith: [
      {
        id: 'hubris',
        difference: 'Hubris tips the head further back, half-closes the eyes and smirks on one side, with no warmth in the cheeks. Pride smiles evenly, with the cheeks lifted and the eyes open.',
      },
      {
        id: 'self-trust',
        difference: 'Self-trust stays level and steady, with a calm face and little or no smile. Pride lifts the chin, opens the chest and shows a small, real smile.',
      },
    ],
    line: 'I built that. Every bit of it.',
    face: { browOuter: 0.1, cheekRaise: 0.4, cornerUp: 0.55, pitch: -0.35, slump: -0.8 },
    images: imagePaths('pride'),
  },
  {
    id: 'hubris',
    name: 'Hubris',
    group: 'self-assess',
    definition: 'An inflated belief in your own ability or importance. You act as if the rules and risks do not apply to you.',
    oneLiner: 'No one here is as good as you, and you know it.',
    tier: 'face-body',
    keyCue: 'Head tipped well back, looking down the nose through half-closed eyes, with a one-sided smirk.',
    zones: {
      brows: 'Lift your brows slightly, one a little higher than the other. Smooth and unbothered.',
      eyes: 'Lower your lids halfway, lazy and unimpressed. Look down your nose at people.',
      mouth: 'Pull one corner up into a smirk. Keep the cheeks still, so the smile never reaches the eyes.',
      head: 'Tip your head well back. Take up space: chest out, shoulders back, leaning back with the arms spread.',
      breath: 'Slow and easy. A small laugh through the nose at other people\'s ideas.',
    },
    actionUnits: ['AU2 (one side)', 'AU12 (one side)', 'AU43', 'AU53'],
    confusedWith: [
      {
        id: 'pride',
        difference: 'Pride tips the head back only a little, with an even, real smile and the cheeks lifted. Hubris tips the head further back, half-closes the eyes and smirks on one side.',
      },
      {
        id: 'self-righteousness',
        difference: 'Self-righteousness purses the lips and judges what someone else did wrong. Hubris is pleased with itself: lazy lids and a one-sided smirk.',
      },
      {
        id: 'contempt',
        difference: 'Contempt is aimed at another person: the head turns a little away and the body stays still. Hubris is about yourself, so the body spreads out and takes up space.',
      },
    ],
    line: "Relax. I don't need the notes. I never have.",
    face: { asym: 0.45, browOuter: 0.15, lidClose: 0.45, gy: 0.45, cornerAsym: 0.8, cornerUp: 0.15, pitch: -0.7, slump: -0.9, tilt: 5 },
    images: imagePaths('hubris'),
  },
  {
    id: 'humility',
    name: 'Humility',
    group: 'self-assess',
    definition: 'Seeing yourself honestly, without puffing yourself up or putting yourself down. You stay open to learning from others.',
    oneLiner: 'Someone praises you, and you take it simply and share the credit.',
    tier: 'face-body',
    keyCue: 'Head slightly bowed, eyes still meeting others, with a soft, small smile.',
    zones: {
      brows: 'Relaxed brows, with the inner ends lifted just slightly. Open, not worried.',
      eyes: 'Soft lids. Look down briefly, then come back up and meet the person\'s eyes.',
      mouth: 'A small, soft smile with the lips closed. Even on both sides.',
      head: 'Bow your head slightly. Keep the shoulders relaxed and down, the chest neither puffed up nor caved in. Hands open.',
      breath: 'Easy and quiet. A small nod as you speak.',
    },
    actionUnits: ['AU1', 'AU12', 'AU43', 'AU54'],
    confusedWith: [
      {
        id: 'shame',
        difference: 'Shame drops the head, turns away and keeps the eyes down, with no smile. Humility bows only slightly, keeps a soft smile and lets the eyes meet people.',
      },
      {
        id: 'gratitude',
        difference: 'Gratitude puts a hand to the chest and closes the eyes for a moment, moved by a gift. Humility keeps the eyes open and meets people with a level, easy gaze.',
      },
      {
        id: 'pride',
        difference: 'Pride lifts the chin and opens the chest. Humility lowers the head a little and keeps the body relaxed, neither puffed up nor shrinking.',
      },
    ],
    line: "I had a lot of help. Honestly, I'm still learning.",
    face: { browInner: 0.1, lidClose: 0.25, cheekRaise: 0.25, gy: -0.2, cornerUp: 0.4, pitch: 0.35, tilt: -3 },
    images: imagePaths('humility'),
  },
];
