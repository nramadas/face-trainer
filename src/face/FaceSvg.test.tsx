import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaceSvg } from './FaceSvg';
import { scaleFace, resolveFace } from './params';
import { gold } from '../data/emotions/gold';
import { face as referenceFace, mix } from './reference-renderer.js';

const attrs = (svg: string, name: string) => [...svg.matchAll(new RegExp(` ${name}="([^"]*)"`, 'g'))].map((m) => m[1]).map((v) => (v.startsWith('.') ? '0' + v : v));

describe('FaceSvg', () => {
  for (const intensity of [1, 0.5, 1.5]) {
    it.each(gold.map((e) => [e.id, e] as const))(`draws gold face %s exactly like the prototype (intensity ${intensity})`, (_, e) => {
      const ours = renderToStaticMarkup(<FaceSvg p={scaleFace(e.face, intensity)} uid="x" label={e.name} />);
      const ref = referenceFace(mix(e.face, intensity), 'x', e.name, null) as string;
      expect(attrs(ours, 'd')).toEqual(attrs(ref, 'd'));
      expect(attrs(ours, 'opacity')).toEqual(attrs(ref, 'opacity'));
      expect(attrs(ours, 'transform')).toEqual(attrs(ref, 'transform'));
      expect(attrs(ours, 'cx')).toEqual(attrs(ref, 'cx'));
      expect(attrs(ours, 'cy')).toEqual(attrs(ref, 'cy'));
    });
  }

  it('draws the neutral face like the prototype', () => {
    const ours = renderToStaticMarkup(<FaceSvg p={resolveFace({})} uid="x" label="n" />);
    const ref = referenceFace(mix({}, 1), 'x', 'n', null) as string;
    expect(attrs(ours, 'd')).toEqual(attrs(ref, 'd'));
  });

  it('marks the highlighted zone', () => {
    const svg = renderToStaticMarkup(<FaceSvg p={resolveFace({})} uid="x" label="n" highlight="brows" />);
    expect(svg).toContain('data-hl="brows"');
  });

  it('draws the new parameters', () => {
    const plain = renderToStaticMarkup(<FaceSvg p={resolveFace({})} uid="x" label="n" />);
    for (const k of ['cheekRaise', 'noseWrinkle', 'upperLipRaise', 'cornerAsym', 'lidClose', 'lipBite'] as const) {
      const svg = renderToStaticMarkup(<FaceSvg p={resolveFace({ [k]: 0.8 })} uid="x" label="n" />);
      expect(svg, k).not.toEqual(plain);
    }
    const teeth = renderToStaticMarkup(<FaceSvg p={resolveFace({ open: 0.5, teeth: 0.8 })} uid="x" label="n" />);
    const noTeeth = renderToStaticMarkup(<FaceSvg p={resolveFace({ open: 0.5 })} uid="x" label="n" />);
    expect(teeth).not.toEqual(noTeeth);
  });
});
