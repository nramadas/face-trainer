import { renderToStaticMarkup } from 'react-dom/server';
import { FaceSvg } from '../../src/face/FaceSvg';
import { scaleFace, type FaceParams } from '../../src/face/params';

/** Face colors, matching the app's theme tokens in src/index.css. */
export const FACE_COLORS: Record<string, string> = {
  '--face': '#ECE5DB',
  '--face-ink': '#1B2430',
  '--face-hl': '#1F8A96',
  '--hair': '#4A5563',
  '--shirt': '#5C7E86',
  '--sclera': '#FFFFFF',
  '--mouth': '#4A2730',
  '--teeth': '#FFFFFF',
  '--cheek': '#E3A493',
};

/** Render a face to a standalone SVG string with colors inlined (works in sharp/librsvg and plain HTML). */
export function faceSvgString(params: FaceParams, opts: { uid: string; label: string; intensity?: number }): string {
  const p = scaleFace(params, opts.intensity ?? 1);
  let svg = renderToStaticMarkup(<FaceSvg p={p} uid={opts.uid} label={opts.label} />);
  svg = svg.replace(/var\((--[a-z-]+)\)/g, (_, name: string) => FACE_COLORS[name] ?? '#000');
  const style = `<style>.ln{stroke:${FACE_COLORS['--face-ink']};fill:none;stroke-linecap:round;stroke-linejoin:round}</style>`;
  return svg.replace(/^<svg /, '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/(<svg[^>]*>)/, `$1${style}`);
}
