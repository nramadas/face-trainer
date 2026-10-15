import type { Emotion } from '../types';
import { imagePaths } from '../types';

export const fallShort: Emotion[] = [
  {
    id: 'self-compassion',
    name: 'Self-Compassion',
    group: 'fall-short',
    definition: 'Being kind to yourself when you struggle or fail, the way you would be kind to a good friend.',
    oneLiner: 'You got it wrong, and instead of attacking yourself, you go easy.',
    tier: 'face-body',
    keyCue: 'A hand on your own chest, eyes down, and a small soft smile on a slow exhale.',
    zones: {
      brows: 'Lift the inner ends of your brows a little. A gentle, caring tent, not a worried one.',
      eyes: 'Let your upper lids soften and lower. Look down and slightly inward, as if speaking to yourself.',
      mouth: 'A small, kind smile with the lips closed. Jaw loose.',
      head: 'Place one hand flat on your own chest. Let your head drop and tilt a little. Shoulders soften and drop on the exhale.',
      breath: 'A long, slow exhale through the mouth. Then breathe low and easy.',
    },
    actionUnits: ['AU1', 'AU12', 'AU43', 'AU54', 'AU55', 'AU64'],
    confusedWith: [
      {
        id: 'compassion',
        difference: 'Compassion looks at the other person and leans toward them. Self-compassion turns the eyes down and inward, and the hand goes to your own chest.',
      },
      {
        id: 'relief',
        difference: 'Relief is a big release when a threat passes: brows up, then a big exhale with the head going back. Self-compassion is slower and quieter, with the head dropping a little and a hand on your own chest.',
      },
    ],
    line: "Hey. It's okay. You're still learning this.",
    face: { browInner: 0.4, browOuter: -0.05, lidClose: 0.45, cheekRaise: 0.2, gy: 0.8, cornerUp: 0.5, pitch: 0.3, tilt: -6, slump: 0.15 },
    images: imagePaths('self-compassion'),
  },
  {
    id: 'perfectionism',
    name: 'Perfectionism',
    group: 'fall-short',
    definition: 'The need to get everything exactly right so that no one can find a flaw in you. Nothing you do ever feels good enough.',
    oneLiner: 'You fix it one more time, because one small flaw feels unbearable.',
    tier: 'context',
    playableNote:
      'Perfectionism has no face of its own; it shows in what you do. Play a tight, controlled scrutiny: brows slightly down, eyes narrowed and locked on one small detail, lips pressed thin, a rigid upright body, and small exact corrections with the hands. Borrows from Stress, but with the narrowed, inspecting eyes of focus instead of worried brows.',
    keyCue: 'Eyes narrowed and locked on one small detail, lips pressed thin.',
    zones: {
      brows: 'Lower your brows slightly and draw them together, as if inspecting something small. Keep them there.',
      eyes: 'Narrow your eyes by tightening the lower lids. Lock your gaze on one small spot, a little below eye level. Do not let it wander.',
      mouth: 'Press your lips into a thin line. Set your jaw.',
      head: 'Sit or stand very upright and rigid, with the shoulders slightly raised. Your hands make small, exact corrections: straighten, smooth, redo.',
      breath: 'Held and shallow while you check. A short, tight exhale through the nose when you find the flaw.',
    },
    actionUnits: ['AU4', 'AU7', 'AU24', 'AU31', 'AU64'],
    confusedWith: [
      {
        id: 'stress',
        difference: 'Stress lifts the inner brows in worry and lets the eyes dart around. Perfectionism lowers the brows into scrutiny and locks the eyes on one small detail.',
      },
      {
        id: 'anxiety',
        difference: 'Anxiety is restless: darting eyes, a bitten lip, fidgeting hands. Perfectionism is controlled and still, with the eyes locked on the flaw and the hands making small, exact fixes.',
      },
    ],
    line: "Wait. One more time. It's not right yet.",
    face: { browInner: -0.25, squeeze: 0.5, eyeOpen: -0.1, lowerLid: 0.7, gy: 0.95, cornerUp: -0.05, press: 0.7, jaw: 0.35, pitch: 0.5, shoulders: 0.55, slump: -0.25 },
    images: imagePaths('perfectionism'),
  },
  {
    id: 'guilt',
    name: 'Guilt',
    group: 'fall-short',
    definition: 'Feeling bad about something you did that went against your own values. It is about the action, not about who you are.',
    oneLiner: 'You did something wrong to this person, and you know it.',
    tier: 'face-body',
    keyCue: 'Head slightly down, but the eyes come back up to the person.',
    zones: {
      brows: 'Lift the inner ends of your brows slightly and draw them a little together. A small, sorry tent, not a big one.',
      eyes: 'Let the upper lids lower a little. Look down for a beat, then bring your eyes back up to the person. This return is the key.',
      mouth: 'Press your lips together and pull them slightly in. Corners a touch down. No smile.',
      head: 'Lower your head slightly, but keep it facing the person. Do not turn away. Shoulders a little forward, hands still.',
      breath: 'A slow breath in before you speak, as if gathering yourself to own it.',
    },
    actionUnits: ['AU1', 'AU4', 'AU15', 'AU24', 'AU28', 'AU54'],
    confusedWith: [
      {
        id: 'shame',
        difference: 'Shame drops the head, turns it away and hides the eyes. Guilt keeps the head facing the person, and the eyes come back up to meet theirs.',
      },
      {
        id: 'regret',
        difference: 'Regret looks back at the past, with the eyes unfocused and off to the side. Guilt looks at the person you wronged.',
      },
    ],
    line: "I should have called you back. I'm sorry.",
    face: { browInner: 0.5, browOuter: -0.1, squeeze: 0.35, eyeOpen: -0.2, gy: -0.35, cornerUp: -0.25, press: 0.6, chin: 0.25, pitch: 0.4, slump: 0.3 },
    images: imagePaths('guilt'),
  },
  {
    id: 'humiliation',
    name: 'Humiliation',
    group: 'fall-short',
    definition: 'Being made small by someone else, usually in front of others. Part of you knows you did not deserve it, and that turns into anger.',
    oneLiner: 'Someone just made a fool of you in front of everyone.',
    tier: 'face-body',
    keyCue: 'Jaw clenched, head down and turned away, with a hot sideways glance at the person who did it.',
    zones: {
      brows: 'Pull your brows slightly down and together. Not a full frown; the anger is held under the surface.',
      eyes: 'Look down first. Then flash your eyes up and to the side at the person who did it, and hold for a beat with the lower lids tight.',
      mouth: 'Press your lips hard together, corners down. Clench your back teeth so the jaw muscles bulge.',
      head: 'Head slightly down and turned a little away, neck stiff. The body goes rigid and still, shoulders a little up. Hands may grip or form fists.',
      breath: 'Held, through the nose. Your face feels hot. When you speak, keep the voice low and tight.',
    },
    actionUnits: ['AU4', 'AU7', 'AU15', 'AU17', 'AU24', 'AU31', 'AU54'],
    confusedWith: [
      {
        id: 'shame',
        difference: 'Shame collapses and hides, and the body goes soft. Humiliation stays rigid, with the jaw clenched and a flash of anger at the person who did it.',
      },
      {
        id: 'embarrassment',
        difference: 'Embarrassment has a smile you try to hold back and loose, sheepish shoulders. Humiliation has no smile at all, a clenched jaw and a stiff body.',
      },
    ],
    line: 'Are you finished?',
    face: { browInner: -0.3, squeeze: 0.55, eyeOpen: 0.05, lowerLid: 0.55, gx: 0.9, gy: -0.1, cornerUp: -0.4, press: 0.8, chin: 0.45, jaw: 1, pitch: 0.4, turn: -0.5, shoulders: 0.4 },
    images: imagePaths('humiliation'),
  },
  {
    id: 'embarrassment',
    name: 'Embarrassment',
    group: 'fall-short',
    definition: 'The brief, awkward feeling of being seen doing something clumsy or silly. It passes, and later it can even be funny.',
    oneLiner: 'Everyone just saw you trip, and you cannot stop a little smile.',
    tier: 'face-body',
    keyCue: 'A smile you are trying to press down, with the eyes down and the head turned a little away.',
    zones: {
      brows: 'Lift the inner brows just a little. Otherwise they stay mostly relaxed.',
      eyes: 'Look down and to the side. Then flick your eyes up to check who saw, and drop them again.',
      mouth: 'A smile starts. Hold it back by pressing your lips together, so the corners go up while the lips stay tight. That fight between smile and press is the key.',
      head: 'Drop your head a little and turn it slightly away. Bring a hand to your face, forehead or the back of your neck.',
      breath: 'A short laugh or puff of air through the nose. The breath catches, then lets go.',
    },
    actionUnits: ['AU1', 'AU12', 'AU24', 'AU51', 'AU54', 'AU64'],
    confusedWith: [
      {
        id: 'shame',
        difference: 'Shame has no smile, and the eyes stay down. Embarrassment has a smile you try to press down, and the eyes flick back up to check.',
      },
      {
        id: 'guilt',
        difference: 'Guilt has no smile, and the head keeps facing the person. Embarrassment has a pressed-down smile and turns the head a little away.',
      },
      {
        id: 'humiliation',
        difference: 'Humiliation has no smile, a clenched jaw and a stiff body. Embarrassment has a pressed-down smile and loose, sheepish shoulders.',
      },
    ],
    line: 'Oh no. Please tell me nobody saw that.',
    face: { browInner: 0.2, eyeOpen: -0.2, gx: 0.6, gy: 0.75, cornerUp: 0.8, cornerAsym: 0.35, press: 0.45, pitch: 0.5, turn: 0.55, tilt: 6, shoulders: 0.25 },
    images: imagePaths('embarrassment'),
  },
];
