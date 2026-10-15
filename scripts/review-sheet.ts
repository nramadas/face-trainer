import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { EMOTIONS } from '../src/data/emotions/index';
import { groupInfo } from '../src/data/groups';
import { faceSvgString } from './lib/faceMarkup';
import type { ManifestEntry } from './generate-faces';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/**
 * Contact sheet of every generated face next to its cartoon and key cue, so bad
 * ones are easy to spot. Tick the bad ones to build a rerun command.
 */
export function writeReviewSheet(manifest: Record<string, ManifestEntry>, facesDir: string): string {
  const outDir = 'scripts/out';
  mkdirSync(outDir, { recursive: true });
  const file = join(outDir, 'review.html');
  const rel = (p: string) => relative(outDir, p).split('\\').join('/');

  const rows = EMOTIONS.map((e) => {
    const cells = (['male', 'female'] as const)
      .map((persona) => {
        const img = join(facesDir, `${e.id}-${persona}.webp`);
        const m = manifest[`${e.id}-${persona}`];
        const status = m?.status === 'failed' ? `<p class="bad">Failed: ${esc(m.error ?? '')}</p>` : '';
        return existsSync(img)
          ? `<td><img src="${rel(img)}?v=${Date.now()}" alt="${esc(e.name)} (${persona})" loading="lazy">${status}</td>`
          : `<td class="missing">Not generated${status}</td>`;
      })
      .join('');
    return `<tr>
      <td class="meta"><label><input type="checkbox" value="${e.id}"> <b>${esc(e.name)}</b></label>
        <p class="grp">${esc(groupInfo(e.group).short)} · ${esc(e.tier)}</p>
        <p class="cue">${esc(e.keyCue)}</p>
        <p class="au">${esc(e.actionUnits.join(' '))}</p></td>
      <td class="cartoon">${faceSvgString(e.face, { uid: `r-${e.id}`, label: e.name })}</td>
      ${cells}
    </tr>`;
  }).join('\n');

  const done = Object.values(manifest).filter((m) => m.status === 'ok').length;
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Stage Face: photo review</title>
<style>
  body { font: 15px/1.45 system-ui, sans-serif; background: #0d1d20; color: #e9f1f2; margin: 24px; }
  h1 { margin: 0 0 4px; } .sub { color: #a9bfc3; margin: 0 0 16px; }
  table { border-collapse: collapse; width: 100%; }
  td { border-top: 1px solid #23393c; padding: 10px; vertical-align: top; }
  td.meta { width: 240px; } td.cartoon { width: 150px; } td.cartoon svg { width: 140px; height: auto; display: block; background: #1a3236; border-radius: 12px; }
  img { width: 220px; aspect-ratio: 4/5; object-fit: cover; border-radius: 12px; display: block; }
  .missing { color: #8fa6ab; width: 220px; } .bad { color: #f6a99f; font-size: 13px; }
  .grp, .au { color: #a9bfc3; font-size: 13px; margin: 4px 0; } .cue { margin: 6px 0; }
  .bar { position: sticky; top: 0; background: #0d1d20; padding: 10px 0; display: flex; gap: 10px; align-items: center; z-index: 1; }
  code { background: #1a3236; padding: 6px 10px; border-radius: 8px; flex: 1; overflow-x: auto; white-space: nowrap; }
  button { background: #17808b; color: #fff; border: 0; border-radius: 999px; padding: 8px 14px; font: inherit; cursor: pointer; }
</style></head><body>
<h1>Photo review</h1>
<p class="sub">${done} images generated. Tick any that look wrong, then copy the command to redo them.</p>
<div class="bar"><code id="cmd">npm run faces:generate -- --only= --force</code><button id="copy">Copy</button></div>
<table>${rows}</table>
<script>
  const boxes = [...document.querySelectorAll('input[type=checkbox]')];
  const cmd = document.getElementById('cmd');
  const update = () => { cmd.textContent = 'npm run faces:generate -- --only=' + boxes.filter(b => b.checked).map(b => b.value).join(',') + ' --force'; };
  boxes.forEach(b => b.addEventListener('change', update));
  document.getElementById('copy').onclick = () => navigator.clipboard.writeText(cmd.textContent);
</script>
</body></html>`;
  writeFileSync(file, html);
  return file;
}
