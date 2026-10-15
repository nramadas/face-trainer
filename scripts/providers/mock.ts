import sharp from 'sharp';
import type { ImageProvider } from './types';

/** Offline stand-in for testing the pipeline without an API key. Draws a labeled grey card. */
export function mockProvider(): ImageProvider {
  const draw = (label: string) => {
    const safe = label.replace(/[<&>]/g, '').slice(0, 60);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1280"><rect width="100%" height="100%" fill="#8a8f94"/><circle cx="512" cy="520" r="230" fill="#c9b8a8"/><rect x="262" y="900" width="500" height="380" rx="120" fill="#6e7378"/><text x="512" y="1220" font-family="Helvetica" font-size="44" text-anchor="middle" fill="#fff">${safe}</text></svg>`;
    return sharp(Buffer.from(svg)).png().toBuffer();
  };
  return {
    name: 'mock',
    model: 'mock',
    generate: (prompt) => draw('reference: ' + prompt.slice(40, 70)),
    edit: (prompt) => draw(prompt.match(/Expression: ([^—\n]+)/)?.[1]?.trim() ?? 'edit'),
  };
}
