import { readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';

const VIRTUAL = 'virtual:face-photos';
const RESOLVED = '\0' + VIRTUAL;

/**
 * Exposes the list of generated face photos in public/faces as a virtual module,
 * so the app knows which photos exist without requesting missing files.
 */
export function facePhotos(): Plugin {
  let dir = '';
  return {
    name: 'stage-face:face-photos',
    configResolved(config) {
      dir = resolve(config.publicDir, 'faces');
    },
    resolveId(id) {
      if (id === VIRTUAL) return RESOLVED;
    },
    load(id) {
      if (id !== RESOLVED) return;
      const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.webp')).sort() : [];
      return `export default ${JSON.stringify(files)};`;
    },
    configureServer(server) {
      server.watcher.add(dir);
      const refresh = (file: string) => {
        if (!file.startsWith(dir)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
          server.ws.send({ type: 'full-reload' });
        }
      };
      server.watcher.on('add', refresh);
      server.watcher.on('unlink', refresh);
    },
  };
}
