import type { Emotion } from '../types';
import { imagePaths } from '../types';

export const hurting: Emotion[] = [
  {
    id: 'anguish',
    name: 'Anguish',
    group: 'hurting',
    definition: 'Pain so strong that it takes you over, mixed with shock and a sense that you cannot do anything. It can be hard to stand or think.',
    oneLiner: 'The worst has happened, and the pain is too big to hold in.',
    tier: 'face',
    keyCue: 'Brows tented and squeezed hard, eyes squeezed, mouth stretched open and square.',
    zones: {
      brows: 'Pull the inner ends of your brows up and squeeze them together as hard as you can. This is the strongest tent of any emotion.',
      eyes: 'Squeeze your eyes nearly shut, pushing the cheeks up so the lower lids bunch. Tears push out at the corners.',
      mouth: 'Drop your jaw and stretch your lips wide and square, corners pulled down and out. The cords in your neck show.',
      head: 'Curl forward: shoulders up and in, head bending down or rocking. Hands grip your head, chest or stomach.',
      breath: 'Ragged and broken. A sob in, then a cry or a silent scream out.',
    },
    actionUnits: ['AU1', 'AU4', 'AU6', 'AU7', 'AU15', 'AU20', 'AU25', 'AU26', 'AU54'],
    confusedWith: [
      {
        id: 'grief',
        difference: 'Grief is heavy and slow, with the mouth mostly closed and the head bowed. Anguish breaks open: the mouth stretched wide and square and the eyes squeezed shut.',
      },
      {
        id: 'despair',
        difference: 'In Despair, the face goes slack and the eyes lose focus. Anguish is all effort: every muscle squeezed tight.',
      },
    ],
    line: 'Tell me you checked again.',
    face: { browInner: 1, browOuter: -0.3, squeeze: 0.95, eyeOpen: -0.5, lowerLid: 0.6, lidClose: 0.3, cheekRaise: 0.6, cornerUp: -0.7, stretch: 1, open: 0.9, teeth: 0.6, chin: 0.2, pitch: 0.3, shoulders: 0.7, slump: 0.4 },
    images: imagePaths('anguish'),
  },
  {
    id: 'hopelessness',
    name: 'Hopelessness',
    group: 'hurting',
    definition: 'Believing that things will not get better and that nothing you do will change them.',
    oneLiner: 'You have stopped believing anything will change.',
    tier: 'face-body',
    keyCue: 'Heavy lids and eyes down and unfocused, with no energy anywhere in the face.',
    zones: {
      brows: 'Let your brows go flat and still. At most, the inner ends lift a little.',
      eyes: 'Let your upper lids drop heavy. Look down at nothing in particular, and let the eyes lose focus.',
      mouth: 'Let the corners sag down. Keep the lips loose and closed, not pressed. Jaw slack.',
      head: 'Let your head drop a little forward. Shoulders drop and round. Hands lie limp, and nothing moves.',
      breath: 'Shallow and slow. Words come out flat and tired, with long pauses.',
    },
    actionUnits: ['AU1', 'AU15', 'AU41', 'AU54', 'AU64'],
    confusedWith: [
      {
        id: 'despair',
        difference: 'Despair still hurts: the brows tent and the mouth falls open as the body collapses. Hopelessness has gone flat: brows still, mouth closed, nothing left to show.',
      },
      {
        id: 'resignation',
        difference: 'In Resignation, the chin lifts a little and the lips press, with a small shrug that says "fine, whatever." Hopelessness drops the head and lets the mouth go loose.',
      },
    ],
    line: "Leave it. It won't change anything.",
    face: { browInner: 0.15, eyeOpen: -0.75, lidClose: 0.15, gy: 0.8, cornerUp: -0.45, pitch: 0.35, slump: 0.6 },
    images: imagePaths('hopelessness'),
  },
  {
    id: 'despair',
    name: 'Despair',
    group: 'hurting',
    definition: 'The painful collapse that comes when you lose all hope about something that matters to you. Unlike hopelessness, it still hurts.',
    oneLiner: 'Everything you hoped for is gone, and you are falling apart.',
    tier: 'face-body',
    keyCue: 'Brows tented, mouth hanging open, and the whole body slumped.',
    zones: {
      brows: 'Lift the inner ends of your brows into a tent. Let the rest of the face go slack around them.',
      eyes: 'Let your lids droop and your eyes lose focus. Look down, or at nothing.',
      mouth: 'Let your jaw hang open a little. The corners sag down. No effort in the lips.',
      head: 'Let your head fall forward, or into your hands. Shoulders collapse, the back curls and the body sinks.',
      breath: 'Long, heavy breaths out, like a groan without words.',
    },
    actionUnits: ['AU1', 'AU4', 'AU15', 'AU25', 'AU26', 'AU41', 'AU54'],
    confusedWith: [
      {
        id: 'hopelessness',
        difference: 'Hopelessness is flat and empty, with the brows still and the mouth closed. Despair still hurts: the brows tent and the mouth falls open.',
      },
      {
        id: 'anguish',
        difference: 'In Anguish, everything squeezes tight: eyes shut, mouth stretched square. Despair lets everything go slack: eyes open and unfocused, mouth hanging loose.',
      },
    ],
    line: 'I did everything they asked. Everything.',
    face: { browInner: 0.8, browOuter: -0.2, squeeze: 0.4, eyeOpen: -0.45, gy: 0.5, cornerUp: -0.5, open: 0.5, pitch: 0.55, tilt: -4, slump: 1 },
    images: imagePaths('despair'),
  },
  {
    id: 'sadness',
    name: 'Sadness',
    group: 'hurting',
    definition: 'A heavy, low feeling that comes with losing someone or something, or when things are not the way you want them.',
    oneLiner: 'Something you cared about is gone, and the weight of it is settling in.',
    tier: 'face',
    keyCue: 'Inner brows up in a soft tent, mouth corners down, eyes down.',
    zones: {
      brows: 'Lift the inner ends of your brows gently up and together into a soft tent. Not as strong as hurt.',
      eyes: 'Let your upper lids grow heavy. Look down.',
      mouth: 'Pull the corners of your mouth down. Push the lower lip up slightly, so the chin wrinkles a little.',
      head: 'Let your head lower a little. Shoulders drop and round slightly forward. Every movement slows down.',
      breath: 'Slow and low. A long breath out, sometimes a sigh.',
    },
    actionUnits: ['AU1', 'AU4', 'AU15', 'AU17', 'AU41', 'AU54', 'AU64'],
    confusedWith: [
      {
        id: 'grief',
        difference: 'Grief is deeper and holding on: a strong tent, a wobbling chin, the head bowed. Sadness is gentler, with a soft tent and only a slight drop of the head.',
      },
      {
        id: 'hurt',
        difference: 'In Hurt, there is a flinch, and the eyes stay on the person who caused it. Sadness turns inward, and the eyes drop.',
      },
      {
        id: 'disappointment',
        difference: 'Disappointment is a quick drop with the lips pressed and a short sigh, then the eyes go away. Sadness settles in and stays, with heavy lids and a slow breath.',
      },
    ],
    line: "I kept thinking she'd call back.",
    face: { browInner: 0.6, browOuter: -0.2, squeeze: 0.35, eyeOpen: -0.35, gy: 0.6, cornerUp: -0.55, chin: 0.4, pitch: 0.25, slump: 0.35 },
    images: imagePaths('sadness'),
  },
  {
    id: 'grief',
    name: 'Grief',
    group: 'hurting',
    definition: 'The deep sorrow that follows losing someone or something you loved. It comes in waves and can change how you see everything.',
    oneLiner: 'Someone you love is gone, and a wave of it has hit you again.',
    tier: 'face-body',
    keyCue: 'A deep tent in the brows with a trembling chin, head bowed.',
    zones: {
      brows: 'Pull the inner ends of your brows up hard and together into a deep tent. Hold it, so the forehead stays creased.',
      eyes: 'Lower your lids and look down. Tighten the lower lids, as if holding back tears.',
      mouth: 'Pull the corners down and push the chin up hard, so the lower lip trembles. Let the lips part if a sob comes.',
      head: 'Bow your head and let the shoulders come forward. Hands may cover the face or hold onto something.',
      breath: 'The breath catches and shudders in, in small pulls. Then a long, shaky breath out.',
    },
    actionUnits: ['AU1', 'AU4', 'AU7', 'AU15', 'AU17', 'AU41', 'AU54'],
    confusedWith: [
      {
        id: 'sadness',
        difference: 'Sadness is softer: a gentle tent and a slight drop of the head. Grief holds a deep tent and a trembling chin, and the head bows.',
      },
      {
        id: 'anguish',
        difference: 'Anguish breaks wide open: mouth stretched square, eyes squeezed shut. Grief stays mostly closed and heavy, with the chin trembling.',
      },
      {
        id: 'heartbreak',
        difference: 'In Heartbreak, a hand presses to the chest and the breath catches on a name. Grief bows the whole head and shoulders, and the breath shudders in waves.',
      },
    ],
    line: 'I still set out two cups.',
    face: { browInner: 0.95, browOuter: -0.3, squeeze: 0.6, eyeOpen: -0.4, lowerLid: 0.4, gy: 0.7, cornerUp: -0.7, chin: 0.85, pitch: 0.6, tilt: -3, slump: 0.6 },
    images: imagePaths('grief'),
  },
];
