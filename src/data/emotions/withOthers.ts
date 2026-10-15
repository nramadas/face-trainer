import type { Emotion } from '../types';
import { imagePaths } from '../types';

export const withOthers: Emotion[] = [
  {
    id: 'compassion',
    name: 'Compassion',
    group: 'with-others',
    definition: "Caring about someone's pain and wanting to help, while seeing them as your equal. You stay with them in it instead of fixing it from a distance.",
    oneLiner: 'Someone is struggling, and you are with them, steady and ready to help.',
    tier: 'face-body',
    keyCue: 'A gentle tent in the brows with a small, kind smile, leaning toward them.',
    zones: {
      brows: 'Lift the inner ends of your brows slightly, a gentle tent. Keep the forehead soft.',
      eyes: 'Soften your lids a little and keep warm, steady eye contact. Do not look away.',
      mouth: 'A small, kind smile with the lips closed. Only the corners lift.',
      head: 'Lean toward them with your head slightly tilted. Open hands, maybe reaching to touch an arm or shoulder.',
      breath: 'Slow and even. Your calm breath helps them settle.',
    },
    actionUnits: ['AU1', 'AU12', 'AU55', 'AU57'],
    confusedWith: [
      {
        id: 'pity',
        difference: 'In Pity, the chin lifts and the lids lower, looking down from a distance with the corners turned down. Compassion meets them at eye level, leaning in with a small, warm smile.',
      },
      {
        id: 'empathy',
        difference: 'In Empathy, the face mirrors their pain, with sad brows and no smile. Compassion stays steady and adds a small, kind smile, ready to help.',
      },
    ],
    line: "Sit down. Let's work out what you need.",
    face: { browInner: 0.4, browOuter: -0.05, squeeze: 0.15, lidClose: 0.2, cheekRaise: 0.1, cornerUp: 0.35, tilt: 5, pitch: 0.1 },
    images: imagePaths('compassion'),
  },
  {
    id: 'pity',
    name: 'Pity',
    group: 'with-others',
    definition: "Feeling sorry for someone's trouble while seeing them as below you or apart from you. It keeps a distance.",
    oneLiner: 'You feel sorry for them, from a safe distance above.',
    tier: 'face-body',
    keyCue: 'Chin slightly up and lids lowered, looking down at them with the corners down.',
    zones: {
      brows: 'Lift the inner ends of your brows a little. Keep the outer ends level or slightly down.',
      eyes: 'Lower your upper lids halfway and look down at the person. Do not hold their eyes for long.',
      mouth: 'Press your lips together lightly and let the corners turn down.',
      head: 'Lift your chin slightly and lean back a little, keeping your distance. Add a small, slow head shake.',
      breath: 'A short sigh out through the nose, sometimes with a soft "tsk."',
    },
    actionUnits: ['AU1', 'AU15', 'AU24', 'AU41', 'AU53', 'AU64', 'AU84'],
    confusedWith: [
      {
        id: 'sympathy',
        difference: 'In Sympathy, the head tilts toward them with a small, sad, closed-mouth smile. Pity lifts the chin and looks down at them, with the corners turned down.',
      },
      {
        id: 'compassion',
        difference: 'Compassion leans in at eye level with a warm smile. Pity leans back and looks down from above.',
      },
    ],
    line: 'Oh, you poor thing. Still at that job?',
    face: { browInner: 0.45, browOuter: -0.1, lidClose: 0.45, gy: 0.5, cornerUp: -0.4, press: 0.3, pitch: -0.4, tilt: 3 },
    images: imagePaths('pity'),
  },
  {
    id: 'empathy',
    name: 'Empathy',
    group: 'with-others',
    definition: 'Feeling with someone: understanding what they feel by finding it in yourself, and letting them know they are not alone.',
    oneLiner: 'They are telling you what hurts, and you feel it with them.',
    tier: 'face-body',
    keyCue: 'Sad brows that mirror theirs, no smile, steady eye contact.',
    zones: {
      brows: 'Lift the inner ends of your brows up and together, matching the sad face in front of you. Let it show.',
      eyes: 'Hold steady, soft eye contact. Do not look away when it gets hard.',
      mouth: 'No smile. Let the corners drop a little and keep the lips soft and closed.',
      head: 'Lean in and stay at their level. Nod slowly. Let your posture match theirs.',
      breath: 'Match their breathing. Slow down when they slow down.',
    },
    actionUnits: ['AU1', 'AU4', 'AU15', 'AU57', 'AU85'],
    confusedWith: [
      {
        id: 'sympathy',
        difference: 'In Sympathy, you stay upright in your own spot, with a small sad smile. Empathy leans in and mirrors their face, with no smile.',
      },
      {
        id: 'compassion',
        difference: 'Compassion has a small, kind smile and steady calm. Empathy drops the smile and shows the same pain they feel.',
      },
    ],
    line: "I know that feeling. It's awful.",
    face: { browInner: 0.6, browOuter: -0.1, squeeze: 0.35, eyeOpen: 0.05, cornerUp: -0.25, pitch: 0.15, tilt: -3 },
    images: imagePaths('empathy'),
  },
  {
    id: 'sympathy',
    name: 'Sympathy',
    group: 'with-others',
    definition: "Feeling sorry about someone's trouble from your own place, without stepping into what they feel.",
    oneLiner: 'You are sorry this happened to them, and you say so from where you stand.',
    tier: 'face-body',
    keyCue: 'Head tilted, with a small, closed-mouth sad smile.',
    zones: {
      brows: 'Lift the inner ends of your brows a little. Mild, not deep.',
      eyes: 'Look at the person with soft, slightly lowered lids. Break eye contact now and then.',
      mouth: 'A small closed-mouth smile with the lips lightly pressed, the kind you give at a funeral.',
      head: 'Tilt your head to one side. Stay upright and where you are; do not lean in.',
      breath: 'A small sigh, then words that come out gentle and a little formal.',
    },
    actionUnits: ['AU1', 'AU12', 'AU24', 'AU55'],
    confusedWith: [
      {
        id: 'empathy',
        difference: 'Empathy leans in and mirrors their pain, with no smile. Sympathy stays upright and tilts the head, with a small sad smile.',
      },
      {
        id: 'pity',
        difference: 'In Pity, the chin lifts and the eyes look down, with the corners turned down. Sympathy keeps the head level and tilted, with a small closed-mouth smile.',
      },
    ],
    line: "I heard about your dad. I'm so sorry.",
    face: { browInner: 0.4, squeeze: 0.15, lidClose: 0.2, gx: -0.2, cornerUp: 0.3, press: 0.35, tilt: 11 },
    images: imagePaths('sympathy'),
  },
  {
    id: 'boundaries',
    name: 'Boundaries',
    group: 'with-others',
    definition: 'Knowing what is okay and not okay for you, and saying so clearly and kindly.',
    oneLiner: 'Someone is asking for more than you can give, and you are saying no, calmly.',
    tier: 'context',
    playableNote:
      'Boundaries have no face of their own. Play a calm, steady, level gaze, a relaxed jaw and a still head. Borrows from Calm plus a firm mouth. The strength is in what you do not do: no frown, no smile to soften it, no looking away.',
    keyCue: 'A steady, level gaze and a still head, with a firm, closed mouth.',
    zones: {
      brows: 'Keep your brows level and still. Do not lift them to ask or lower them to fight.',
      eyes: 'Look straight at the person with a steady, level gaze. Blink normally. Do not look away as you say no.',
      mouth: 'Close your lips with light, even pressure, a firm line. Keep the jaw relaxed, not clenched.',
      head: 'Keep your head still and level, shoulders down and square, feet planted. No nodding to soften it.',
      breath: 'Low and slow, from the belly. Breathe out before you speak, then say it once.',
    },
    actionUnits: ['AU24'],
    confusedWith: [
      {
        id: 'defensiveness',
        difference: 'In Defensiveness, the chin lifts, the eyes narrow and the jaw clenches, ready to argue. Boundaries keep the head level, the eyes open and the jaw loose.',
      },
      {
        id: 'calm',
        difference: 'In Calm, the mouth stays soft and may be faintly smiling. Boundaries add a firm, closed mouth and a gaze that does not move.',
      },
    ],
    line: "I can't cover Saturday. That's my answer.",
    face: { eyeOpen: 0.1, press: 0.45, chin: 0.15, slump: -0.4 },
    images: imagePaths('boundaries'),
  },
  {
    id: 'comparative-suffering',
    name: 'Comparative Suffering',
    group: 'with-others',
    definition: "Ranking your pain against other people's and deciding yours does not count because someone has it worse. It shuts down your own feelings, and often other people's too.",
    oneLiner: 'You start to say what hurts, then stop, because others have it worse.',
    tier: 'context',
    playableNote:
      'There is no face for comparative suffering. Play the moment you shut your own feeling down: sad brows that start to show, then a quick, tight smile that covers them, eyes dropping away, a small head shake and a shrug. Borrows from Sadness at the start and a polite, covering smile at the end.',
    keyCue: 'A quick, tight smile over sad brows, with the eyes dropping away.',
    zones: {
      brows: 'Let the inner ends of your brows lift a little, as the feeling starts to show.',
      eyes: 'Let your eyes drop and slide away, as if your own pain is not worth looking at.',
      mouth: 'Press your lips into a quick, tight smile with no warmth in the eyes. It covers the feeling.',
      head: 'Give a small shake of the head and a quick shrug. Wave it off with one hand.',
      breath: 'A short breath out through the nose, a dismissive "hm," then move on fast.',
    },
    actionUnits: ['AU1', 'AU12', 'AU24', 'AU64', 'AU84'],
    confusedWith: [
      {
        id: 'guilt',
        difference: 'In Guilt, the lips press with no smile, and the eyes come back to the person. Comparative suffering puts on a quick, tight smile and waves the feeling away.',
      },
      {
        id: 'empathy',
        difference: 'In Empathy, the sad face shows openly, for the other person. Comparative suffering hides your own sad face behind a smile and a shrug.',
      },
    ],
    line: "It's nothing, really. Other people have real problems.",
    face: { browInner: 0.45, browOuter: -0.05, squeeze: 0.2, gx: -0.45, gy: 0.6, cornerUp: 0.4, press: 0.5, turn: -0.15, shoulders: 0.4 },
    images: imagePaths('comparative-suffering'),
  },
];
