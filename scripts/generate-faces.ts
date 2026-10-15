/**
 * Generate the photo faces ahead of time. Run on your own machine with your own API key.
 * The key is read from the environment (or .env) and never reaches the app.
 *
 *   npm run faces:reference                       4 neutral candidates per persona → scripts/out/reference/
 *   npm run faces:generate                        every emotion × both personas → public/faces/*.webp
 *   npm run faces:generate -- --only=stress,shame redo specific ones
 *   npm run faces:review                          rebuild scripts/out/review.html only
 *
 * Options:
 *   --only=a,b        only these emotion ids
 *   --persona=male    only one persona
 *   --force           overwrite images that already exist
 *   --provider=gemini gemini (default) | openai | mock (offline test, no key)
 *   --concurrency=2   parallel requests
 *   --out=dir         output folder for .webp files (default public/faces)
 *   --dry-run         print the prompts and stop
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import sharp from 'sharp';
import { EMOTIONS } from '../src/data/emotions/index';
import type { Emotion } from '../src/data/types';
import { PERSONAS, referencePrompt, type PersonaId } from './personas';
import { emotionPrompt } from './prompt';
import { geminiProvider } from './providers/gemini';
import { openaiProvider } from './providers/openai';
import { mockProvider } from './providers/mock';
import { ProviderError, type ImageProvider } from './providers/types';
import { writeReviewSheet } from './review-sheet';

try {
  process.loadEnvFile?.('.env');
} catch {
  /* no .env file */
}

const args = Object.fromEntries(
  process.argv.slice(3).map((a) => {
    const [k, ...v] = a.replace(/^--/, '').split('=');
    return [k, v.length ? v.join('=') : 'true'];
  }),
) as Record<string, string>;
const command = process.argv[2] ?? 'generate';

const OUT_DIR = 'scripts/out';
const REF_OUT = join(OUT_DIR, 'reference');
const REF_DIR = 'scripts/reference';
const FACES_DIR = resolve(args.out ?? 'public/faces');
const MANIFEST = join(OUT_DIR, 'manifest.json');
const WIDTH = 768;
const HEIGHT = 960;

export interface ManifestEntry {
  id: string;
  persona: PersonaId;
  status: 'ok' | 'failed' | 'skipped';
  file: string;
  provider?: string;
  model?: string;
  error?: string;
  updatedAt: string;
}
type Manifest = Record<string, ManifestEntry>;

function provider(): ImageProvider {
  const name = args.provider ?? process.env.FACES_PROVIDER ?? 'gemini';
  if (name === 'gemini') return geminiProvider();
  if (name === 'openai') return openaiProvider();
  if (name === 'mock') return mockProvider();
  throw new Error(`Unknown provider "${name}". Use gemini, openai or mock.`);
}

function personas(): PersonaId[] {
  if (!args.persona) return ['male', 'female'];
  if (args.persona !== 'male' && args.persona !== 'female') throw new Error('--persona must be male or female');
  return [args.persona];
}

function selected(): Emotion[] {
  if (!args.only) return EMOTIONS;
  const ids = args.only.split(',').map((s) => s.trim()).filter(Boolean);
  const unknown = ids.filter((id) => !EMOTIONS.some((e) => e.id === id));
  if (unknown.length) throw new Error(`Unknown emotion id(s): ${unknown.join(', ')}`);
  return EMOTIONS.filter((e) => ids.includes(e.id));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Retry with exponential backoff on rate limits, server errors and empty responses. */
async function withRetry<T>(label: string, fn: () => Promise<T>, tries = 4): Promise<T> {
  let delay = 2000;
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (e) {
      const retryable = e instanceof ProviderError ? e.retryable : true;
      if (!retryable || attempt >= tries) throw e;
      console.log(`  ${label}: attempt ${attempt} failed (${(e as Error).message.slice(0, 120)}). Retrying in ${delay / 1000}s.`);
      await sleep(delay);
      delay *= 2;
    }
  }
}

async function toWebp(buf: Buffer, file: string) {
  mkdirSync(dirname(file), { recursive: true });
  await sharp(buf).resize(WIDTH, HEIGHT, { fit: 'cover', position: 'centre' }).webp({ quality: 80 }).toFile(file);
}

function loadManifest(): Manifest {
  try {
    return JSON.parse(readFileSync(MANIFEST, 'utf8')) as Manifest;
  } catch {
    return {};
  }
}
function saveManifest(m: Manifest) {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(MANIFEST, JSON.stringify(m, null, 2));
}

async function pool<T>(items: T[], n: number, fn: (item: T) => Promise<void>) {
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.max(1, n) }, async () => {
      while (i < items.length) await fn(items[i++]);
    }),
  );
}

async function reference() {
  const p = provider();
  mkdirSync(REF_OUT, { recursive: true });
  console.log(`Generating 4 neutral reference candidates per persona with ${p.name} (${p.model}).`);
  for (const id of personas()) {
    const prompt = referencePrompt(PERSONAS[id]);
    if (args['dry-run']) {
      console.log(`\n[${id}]\n${prompt}`);
      continue;
    }
    for (let n = 1; n <= 4; n++) {
      const buf = await withRetry(`${id} ${n}`, () => p.generate(prompt));
      const file = join(REF_OUT, `${id}-${n}.png`);
      await sharp(buf).resize(1024, 1280, { fit: 'cover', position: 'centre' }).png().toFile(file);
      console.log(`  wrote ${file}`);
    }
  }
  if (!args['dry-run']) {
    console.log(`\nPick one per persona and save it as:\n  ${REF_DIR}/male.png\n  ${REF_DIR}/female.png\nThen run: npm run faces:generate`);
  }
}

async function generate() {
  const list = selected();
  const who = personas();
  const force = args.force === 'true';
  if (args['dry-run']) {
    for (const e of list) console.log(`\n[${e.id}]\n${emotionPrompt(e)}`);
    return;
  }
  const refs: Partial<Record<PersonaId, Buffer>> = {};
  for (const id of who) {
    const f = join(REF_DIR, `${id}.png`);
    if (!existsSync(f)) {
      if (args.provider === 'mock') refs[id] = await mockProvider().generate(`reference ${id}`);
      else throw new Error(`Missing ${f}. Run "npm run faces:reference", pick one candidate per persona and save it there.`);
    } else refs[id] = readFileSync(f);
  }
  const p = provider();
  const manifest = loadManifest();
  const jobs = list.flatMap((e) => who.map((persona) => ({ e, persona })));
  let done = 0;
  let failed = 0;
  let skipped = 0;
  console.log(`Generating ${jobs.length} images with ${p.name} (${p.model}) into ${relative(process.cwd(), FACES_DIR)}.`);

  await pool(jobs, Number(args.concurrency ?? 2), async ({ e, persona }) => {
    const file = join(FACES_DIR, `${e.id}-${persona}.webp`);
    const key = `${e.id}-${persona}`;
    const now = new Date().toISOString();
    if (existsSync(file) && !force) {
      manifest[key] = { ...(manifest[key] ?? {}), id: e.id, persona, status: manifest[key]?.status === 'ok' ? 'ok' : 'skipped', file, updatedAt: manifest[key]?.updatedAt ?? now };
      done++;
      skipped++;
      return;
    }
    try {
      const buf = await withRetry(key, () => p.edit(emotionPrompt(e), refs[persona]!));
      await toWebp(buf, file);
      manifest[key] = { id: e.id, persona, status: 'ok', file, provider: p.name, model: p.model, updatedAt: now };
      console.log(`  ✓ ${key}`);
    } catch (err) {
      failed++;
      manifest[key] = { id: e.id, persona, status: 'failed', file, provider: p.name, model: p.model, error: (err as Error).message.slice(0, 500), updatedAt: now };
      console.log(`  ✗ ${key}: ${(err as Error).message.slice(0, 200)}`);
    }
    done++;
    saveManifest(manifest);
  });
  saveManifest(manifest);
  const sheet = writeReviewSheet(manifest, FACES_DIR);
  console.log(`\nDone: ${done - failed - skipped} made, ${skipped} skipped (already there; use --force to redo), ${failed} failed.\nManifest: ${MANIFEST}\nReview sheet: ${sheet}`);
  if (failed) console.log(`Rerun the failed ones with: npm run faces:generate -- --only=<ids> --force`);
}

async function main() {
  if (command === 'reference') return reference();
  if (command === 'generate') return generate();
  if (command === 'review') {
    console.log(`Review sheet: ${writeReviewSheet(loadManifest(), FACES_DIR)}`);
    return;
  }
  throw new Error(`Unknown command "${command}". Use reference, generate or review.`);
}

main().catch((e) => {
  console.error(`\n${(e as Error).message}`);
  process.exit(1);
});
