/**
 * Parameters for the cartoon face. Every value is optional and defaults to 0,
 * which is the neutral face.
 *
 * Each parameter stands for one visible movement. Where one exists, the FACS
 * (Facial Action Coding System) action unit is named in the comment.
 *
 * | Param          | Range     | AU            | What it does on the drawing                                      |
 * |----------------|-----------|---------------|------------------------------------------------------------------|
 * | browInner      | -1 to 1   | AU1 (+) AU4 (-)| Inner brow ends up (+, worry/tent) or down (-, frown)           |
 * | browOuter      | -1 to 1   | AU2           | Outer brow ends up (+) or down (-)                               |
 * | squeeze        | 0 to 1    | AU4           | Brows drawn together; vertical furrow lines appear above ~0.2    |
 * | asym           | -1 to 1   | AU2 one side  | The right-hand brow (as you look at it) rises extra              |
 * | eyeOpen        | -1 to 1   | AU5 (+)       | Upper lid up, white above the iris (+); heavy lids (-)           |
 * | lowerLid       | 0 to 1    | AU7           | Lower lid tense and raised; narrows the eye (tension)            |
 * | lidClose       | 0 to 1    | AU43 partial  | NEW. Soft, relaxed lowering of the upper lid (calm, not tense)   |
 * | cheekRaise     | 0 to 1    | AU6           | NEW. Cheeks lift, lower lids bunch, crow's feet appear           |
 * | gx             | -1 to 1   | AU61/62       | Gaze left (-) / right (+), as you look at it                     |
 * | gy             | -1 to 1   | AU63/64       | Gaze up (-) / down (+)                                           |
 * | noseWrinkle    | 0 to 1    | AU9           | NEW. Wrinkles across the nose bridge, nostrils flare             |
 * | upperLipRaise  | 0 to 1    | AU10          | NEW. Upper lip lifts off the lower lip, folds beside nose deepen |
 * | cornerUp       | -1 to 1   | AU12 (+) AU15 (-) | Lip corners up (smile) or down                               |
 * | cornerAsym     | -1 to 1   | AU12/14 one side | NEW. One corner pulls up and in: right-hand (+) or left-hand (-) |
 * | press          | 0 to 1    | AU23/24       | Lips pressed thin; mouth narrows                                 |
 * | stretch        | 0 to 1    | AU20          | Lips pulled sideways; neck cords show                            |
 * | open           | 0 to 1    | AU25/26       | Lips part and jaw drops                                          |
 * | teeth          | 0 to 1    | (AU25 + AU10/16) | NEW. Teeth show when the mouth is open; above 0.5 lower teeth too |
 * | lipBite        | 0 to 1    | AU32          | NEW. Upper teeth rest on the lower lip (nervous lip bite)        |
 * | chin           | 0 to 1    | AU17          | Chin pushes up, lower lip pouts, chin crease                     |
 * | shift          | -1 to 1   | AU14/AU20 one side | Mouth slides to one side                                    |
 * | jaw            | 0 to 1    | AU31          | Jaw clench lines at the jaw corners                              |
 * | tilt           | -15 to 15 | AU55/56       | Head tilt in degrees (+ tips toward the right-hand side)         |
 * | pitch          | -1 to 1   | AU53 (-) AU54 (+) | Head up (-) or down (+). Head up shows the nostrils          |
 * | turn           | -1 to 1   | AU51/52       | Head turns left (-) or right (+), as you look at it              |
 * | shoulders      | 0 to 1    | -             | Shoulders creep up toward the ears                               |
 * | slump          | -1 to 1   | -             | Shoulders round forward and drop (+); chest open, squared (-)    |
 *
 * "lidClose", "cheekRaise", "noseWrinkle", "upperLipRaise", "cornerAsym",
 * "teeth" and "lipBite" were added to the original prototype so all 87 entries
 * can be drawn. "slump" was extended to allow negative values.
 */
export interface FaceParams {
  browInner?: number;
  browOuter?: number;
  squeeze?: number;
  asym?: number;
  eyeOpen?: number;
  lowerLid?: number;
  lidClose?: number;
  cheekRaise?: number;
  gx?: number;
  gy?: number;
  noseWrinkle?: number;
  upperLipRaise?: number;
  cornerUp?: number;
  cornerAsym?: number;
  press?: number;
  stretch?: number;
  open?: number;
  teeth?: number;
  lipBite?: number;
  chin?: number;
  shift?: number;
  jaw?: number;
  tilt?: number;
  pitch?: number;
  turn?: number;
  shoulders?: number;
  slump?: number;
}

export type FaceKey = keyof FaceParams;
export type ResolvedFace = Required<FaceParams>;

export interface ParamSpec {
  min: number;
  max: number;
  au: string;
  label: string;
}

export const PARAM_SPECS: Record<FaceKey, ParamSpec> = {
  browInner: { min: -1, max: 1, au: 'AU1 / AU4', label: 'Inner brow up (+) or down (-)' },
  browOuter: { min: -1, max: 1, au: 'AU2', label: 'Outer brow up' },
  squeeze: { min: 0, max: 1, au: 'AU4', label: 'Brows drawn together' },
  asym: { min: -1, max: 1, au: 'AU2 one side', label: 'One brow higher' },
  eyeOpen: { min: -1, max: 1, au: 'AU5', label: 'Upper lid up (+) or heavy (-)' },
  lowerLid: { min: 0, max: 1, au: 'AU7', label: 'Lower lid tightener' },
  lidClose: { min: 0, max: 1, au: 'AU43 partial', label: 'Soft lid lowering' },
  cheekRaise: { min: 0, max: 1, au: 'AU6', label: 'Cheek raiser' },
  gx: { min: -1, max: 1, au: 'AU61/62', label: 'Gaze left or right' },
  gy: { min: -1, max: 1, au: 'AU63/64', label: 'Gaze up or down' },
  noseWrinkle: { min: 0, max: 1, au: 'AU9', label: 'Nose wrinkler' },
  upperLipRaise: { min: 0, max: 1, au: 'AU10', label: 'Upper lip raiser' },
  cornerUp: { min: -1, max: 1, au: 'AU12 / AU15', label: 'Lip corners up or down' },
  cornerAsym: { min: -1, max: 1, au: 'AU12/14 one side', label: 'One lip corner up' },
  press: { min: 0, max: 1, au: 'AU23/24', label: 'Lips pressed' },
  stretch: { min: 0, max: 1, au: 'AU20', label: 'Lips stretched sideways' },
  open: { min: 0, max: 1, au: 'AU25/26', label: 'Mouth open' },
  teeth: { min: 0, max: 1, au: 'AU25', label: 'Teeth showing' },
  lipBite: { min: 0, max: 1, au: 'AU32', label: 'Lip bite' },
  chin: { min: 0, max: 1, au: 'AU17', label: 'Chin raiser' },
  shift: { min: -1, max: 1, au: 'AU14 one side', label: 'Mouth to one side' },
  jaw: { min: 0, max: 1, au: 'AU31', label: 'Jaw clench' },
  tilt: { min: -15, max: 15, au: 'AU55/56', label: 'Head tilt (degrees)' },
  pitch: { min: -1, max: 1, au: 'AU53/54', label: 'Head up (-) or down (+)' },
  turn: { min: -1, max: 1, au: 'AU51/52', label: 'Head turn' },
  shoulders: { min: 0, max: 1, au: '-', label: 'Shoulders raised' },
  slump: { min: -1, max: 1, au: '-', label: 'Slump (+) or chest open (-)' },
};

export const FACE_KEYS = Object.keys(PARAM_SPECS) as FaceKey[];

export function resolveFace(p: FaceParams): ResolvedFace {
  const o = {} as ResolvedFace;
  for (const k of FACE_KEYS) o[k] = p[k] ?? 0;
  return o;
}

/** Scale every parameter by t (0 = neutral, 1 = the face as written, 1.5 = stage). */
export function scaleFace(target: FaceParams, t: number): ResolvedFace {
  const o = {} as ResolvedFace;
  for (const k of FACE_KEYS) o[k] = (target[k] ?? 0) * t;
  return o;
}

export const NEUTRAL: ResolvedFace = resolveFace({});

export const INTENSITY_STOPS = [
  { value: 0, label: 'Neutral' },
  { value: 0.5, label: 'Camera' },
  { value: 1, label: 'Clear' },
  { value: 1.5, label: 'Stage' },
] as const;

export type IntensityName = 'camera' | 'clear' | 'stage';
export const INTENSITY_VALUES: Record<IntensityName, number> = { camera: 0.5, clear: 1, stage: 1.5 };

export function intensityLabel(v: number): string {
  if (v < 0.25) return 'Neutral';
  if (v < 0.75) return 'Camera (subtle)';
  if (v < 1.25) return 'Clear';
  return 'Stage';
}
