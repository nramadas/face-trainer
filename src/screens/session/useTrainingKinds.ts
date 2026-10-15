import { useApp } from '../../store/appStore';
import type { FaceKind } from '../../components/FaceViewer';
import { INTENSITY_VALUES } from '../../face/params';

/** Which faces to show in training, from Settings (at least one). */
export function useTrainingKinds(): FaceKind[] {
  const f = useApp((s) => s.settings.faces);
  const kinds: FaceKind[] = [];
  if (f.cartoon) kinds.push('cartoon');
  if (f.male) kinds.push('male');
  if (f.female) kinds.push('female');
  return kinds.length ? kinds : ['cartoon'];
}

export function useDefaultIntensity(): number {
  return useApp((s) => INTENSITY_VALUES[s.settings.defaultIntensity]);
}
