import type { Emotion } from '../types';
import { imagePaths } from '../types';

/**
 * The five gold-standard entries, tested with the user. Text in oneLiner,
 * zones, confusedWith, line and the face parameters is copied exactly from the
 * prototype. Use these as the model for tone and detail.
 */
export const gold: Emotion[] = [
  {
    id: 'stress',
    name: 'Stress',
    group: 'uncertain',
    definition: 'Feeling that more is being asked of you than you can handle right now. Your body stays braced to get through it.',
    oneLiner: 'Too much is coming at you, and you are holding it together.',
    tier: 'face-body',
    keyCue: 'Lips pressed shut and pulled sideways, with the shoulders up.',
    zones: {
      brows: 'Lift the inner ends of your brows a little and pull them toward each other. It should look worried, not angry.',
      eyes: 'Open a touch wider than normal. Keep the lower lids slightly tight. Let the eyes dart to the side now and then.',
      mouth: 'Press your lips together and pull the corners slightly sideways, like saying "eee" with your mouth shut. Clench your back teeth.',
      head: 'Shoulders creep up toward your ears. Neck stiff. Head stays rigid and still.',
      breath: 'High and shallow, in the upper chest. Hold the breath between lines.',
    },
    actionUnits: ['AU1', 'AU4', 'AU5', 'AU7', 'AU20', 'AU24', 'AU31'],
    confusedWith: [
      { id: 'fear', difference: 'Fear opens the eyes and mouth wide and pulls back. Stress keeps the mouth shut and holds the tension in.' },
    ],
    line: "Fine. It's fine. I just need five minutes.",
    face: { browInner: 0.75, browOuter: 0.05, squeeze: 0.5, eyeOpen: 0.3, lowerLid: 0.35, gx: 0.25, cornerUp: -0.2, press: 0.6, stretch: 0.5, chin: 0.2, jaw: 0.9, shoulders: 1 },
    images: imagePaths('stress'),
  },
  {
    id: 'shame',
    name: 'Shame',
    group: 'fall-short',
    definition: 'The painful feeling that you are bad or flawed as a person, not just that you did something bad.',
    oneLiner: 'You feel that you are bad, and you want to disappear.',
    tier: 'face-body',
    keyCue: 'Head down and turned away, eyes down.',
    zones: {
      brows: 'Lift the inner ends very slightly. The brows feel heavy, not busy.',
      eyes: "Lower your upper eyelids. Look down and away. Do not meet the other person's eyes.",
      mouth: 'Lips pressed, corners turned a little down. No smile at all.',
      head: 'Drop your head and turn it away. Round your shoulders forward. Make your body smaller.',
      breath: 'Slow, held and quiet. If you speak, the voice gets small.',
    },
    actionUnits: ['AU1', 'AU15', 'AU24', 'AU41', 'AU51', 'AU54', 'AU64'],
    confusedWith: [
      {
        id: 'embarrassment',
        difference: 'Embarrassment has a smile you are trying to hold back, and the eyes flick back up. Shame has no smile, and the eyes stay down.',
      },
    ],
    line: "I know. You don't have to say it.",
    face: { browInner: 0.35, browOuter: -0.15, squeeze: 0.3, eyeOpen: -0.55, gx: -0.6, gy: 1, cornerUp: -0.4, press: 0.5, chin: 0.35, pitch: 0.9, turn: -0.5, tilt: -5, slump: 1 },
    images: imagePaths('shame'),
  },
  {
    id: 'frustration',
    name: 'Frustration',
    group: 'unplanned',
    definition: 'Feeling stuck because something keeps getting in your way and you cannot fix it.',
    oneLiner: 'Something keeps blocking you, and your patience is running out.',
    tier: 'face',
    keyCue: 'Brows pulled down hard and together, eyes glancing up or away.',
    zones: {
      brows: 'Pull your brows down hard and squeeze them together, so vertical lines form between them.',
      eyes: 'Narrow your eyes by tightening the lower lids. Glance up or to the side, as if asking for patience.',
      mouth: 'Press your lips firmly together. Corners slightly down. Jaw set.',
      head: 'Short, sharp movements: a small head shake, hands that grip or drop. Shoulders tense.',
      breath: 'A big exhale through the nose or a sharp sigh. This is the signature sound of frustration.',
    },
    actionUnits: ['AU4', 'AU7', 'AU15', 'AU17', 'AU24', 'AU31'],
    confusedWith: [
      {
        id: 'anger',
        difference: 'Anger is aimed at a person, with a hard, direct stare. Frustration is aimed at the situation, so the eyes look away from people.',
      },
    ],
    line: 'I have explained this three times.',
    face: { browInner: -0.7, browOuter: -0.1, squeeze: 1, eyeOpen: -0.2, lowerLid: 0.75, gx: 0.5, gy: -0.5, cornerUp: -0.25, press: 1, stretch: 0.1, chin: 0.5, jaw: 0.7, shoulders: 0.35 },
    images: imagePaths('frustration'),
  },
  {
    id: 'hurt',
    name: 'Hurt',
    group: 'heart-open',
    definition: 'The sharp pain of being let down or treated badly by someone you care about or trust.',
    oneLiner: 'Someone you trusted just did something that stung.',
    tier: 'face',
    keyCue: 'Inner brow ends up and together (a tent shape).',
    zones: {
      brows: "Lift the inner ends of your brows up and together, so the brows slant like a tent. This is the key cue. Most people can't do it on command at first, so practice it alone before adding anything else.",
      eyes: 'A beat wider at the moment of the blow. Then tighten the lower lids, as if holding back tears.',
      mouth: 'Pull the corners down. Push your chin up so the lower lip pushes up and the chin wrinkles.',
      head: 'The head pulls back slightly, like a small flinch. Then stillness. Keep looking at the person who hurt you.',
      breath: 'A catch: one quick, sharp breath in, then hold it.',
    },
    actionUnits: ['AU1', 'AU4', 'AU5', 'AU7', 'AU15', 'AU17'],
    confusedWith: [
      {
        id: 'sadness',
        difference: 'Sadness is heavy and turns inward, and the eyes drop. Hurt has the flinch, and the eyes stay on the person who caused it.',
      },
    ],
    line: 'You told them? That was mine to tell.',
    face: { browInner: 0.95, browOuter: -0.25, squeeze: 0.55, eyeOpen: 0.15, lowerLid: 0.4, gy: 0.2, cornerUp: -0.75, chin: 0.95, pitch: -0.2, tilt: 3 },
    images: imagePaths('hurt'),
  },
  {
    id: 'confusion',
    name: 'Confusion',
    group: 'beyond',
    definition: 'Not understanding what is happening or what something means, while you try to work it out.',
    oneLiner: 'What you are seeing or hearing does not make sense yet.',
    tier: 'face-body',
    keyCue: 'Head tilted, with one brow higher than the other.',
    zones: {
      brows: 'Lower your brows and draw them together, then lift one brow higher than the other. The uneven brows sell it.',
      eyes: 'Narrow your eyes a little, as if trying to see more clearly. Look slightly off to the side, then back.',
      mouth: 'Pull your lips to one side, or let them part slightly. Keep the mouth loose, not tight.',
      head: 'Tilt your head to the side. This is the strongest confusion signal from a distance.',
      breath: 'A paused breath, like a silent "hm?" before you speak.',
    },
    actionUnits: ['AU4', 'AU7', 'AU2 (one side)', 'AU14', 'AU55'],
    confusedWith: [
      {
        id: 'interest',
        difference:
          'Interest keeps the brows even and lifted a little, with the eyes open and steady and the body leaning in. Confusion lowers the brows, makes them uneven, and adds the head tilt.',
      },
    ],
    line: 'Wait. Which Tuesday?',
    face: { browInner: -0.45, squeeze: 0.7, asym: 0.95, eyeOpen: -0.15, lowerLid: 0.55, gx: -0.35, gy: -0.15, cornerUp: -0.1, press: 0.25, shift: 0.8, tilt: 13 },
    images: imagePaths('confusion'),
  },
];
