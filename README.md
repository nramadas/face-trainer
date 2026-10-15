# Stage Face

An emotion expression trainer for actors. It works like flashcards for your face: you see an emotion's name and make the face, quickly and accurately.

- **Explore** 87 emotions (names and groups from *Atlas of the Heart* by Brené Brown). Each has a cartoon face, two photo faces (one man, one woman), and a plain "build it in this order" guide for brows, eyes, mouth, head and breath.
- **Train** one new emotion per session. From the third session on, each session also brings back one or two you have learned, using spaced repetition: an emotion comes back right before you are likely to forget it. Scheduling uses [FSRS](https://github.com/open-spaced-repetition/ts-fsrs).
- **Switch drill** and **Spot it** for look-alike faces and vocabulary.

It is a static, installable PWA. There are no accounts, no server and no tracking. Progress lives in `localStorage` on the device; export it from Settings to keep a copy.

## Run it locally

Needs Node 22.12 or newer (24 recommended).

```bash
npm install
npm run dev
```

Open the URL Vite prints (it ends in `/face-trainer/`). Other commands:

```bash
npm test            # unit tests (data rules, session rules, ratings, storage, contrast, face renderer)
npm run typecheck   # app, scripts and tests
npm run build       # production build in dist/
npm run preview     # serve the production build, with the service worker
```

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository. The workflow in `.github/workflows/deploy.yml` builds and deploys on every push to `main`.
2. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow by hand from the Actions tab). The site appears at `https://<user>.github.io/<repo>/`.

The app uses hash URLs (`#/explore/joy`), so deep links work on Pages without any 404 tricks. The build sets Vite's `base` from `BASE_PATH`, which the workflow sets to `/<repo-name>/`. For a `<user>.github.io` repository, change it to `/`. Locally it defaults to `/face-trainer/`.

## Generate the photo faces

The app works fully without photos and falls back to the cartoon. Photos are made ahead of time by a script you run on your own machine, with your own API key, and committed as static files. The app never calls an image API.

Every emotion uses the **same man and the same woman**, with the same clothes, background, light and framing. Only the expression changes. To get that, each emotion is made by editing one fixed reference photo per person, not from text alone.

1. **Add your key.** Copy `.env.example` to `.env` and set `GEMINI_API_KEY` (default provider) or `OPENAI_API_KEY`. `.env` is git-ignored. Do not prefix the key with `VITE_`, so it can never reach the app bundle.
2. **Edit the people** (optional) in `scripts/personas.ts`.
3. **Make reference candidates:**
   ```bash
   npm run faces:reference
   ```
   This writes 4 neutral candidates per person to `scripts/out/reference/`. Pick one of each and save them as `scripts/reference/male.png` and `scripts/reference/female.png`.
4. **Generate all faces:**
   ```bash
   npm run faces:generate
   ```
   This writes `public/faces/<id>-male.webp` and `<id>-female.webp` (768×960, WebP). It skips images that already exist, retries failed calls with backoff, and records each image's status in `scripts/out/manifest.json`.
5. **Review.** Open `scripts/out/review.html`: every photo next to its cartoon face and key cue. Tick bad ones to get a rerun command, for example:
   ```bash
   npm run faces:generate -- --only=stress,shame --force
   ```
6. Commit `public/faces/` and push. Restart `npm run dev` if it was running, so it picks up the new files.

Options: `--only=a,b`, `--persona=male`, `--force`, `--provider=gemini|openai|mock`, `--concurrency=2`, `--dry-run` (print prompts only). `--provider=mock` makes grey placeholder cards with no key, for testing the pipeline; do not commit those.

**Providers.** The default is Google's Gemini image model (`gemini-2.5-flash-image`), because it keeps a person's identity well across edits of one reference photo and supports a native 4:5 frame. OpenAI (`gpt-image-1` with high input fidelity) is the alternative. Set `FACES_MODEL` to use a newer model from either provider. Each provider is one small file in `scripts/providers/`.

Photos are not precached by the service worker. They are cached the first time they are seen, and **Settings → Download all faces for offline** fetches them all at once.

## Editing the emotion data

The data lives in `src/data/emotions/`, one file per group, plus the five tested entries in `gold.ts`. The face parameters (and the FACS action unit each one stands for) are documented at the top of `src/face/params.ts`.

```bash
npm run faces:sheet -- --ids=envy,jealousy --out=scripts/out/sheet.png   # look at faces side by side
npm run data:check                                                      # validate all 87
npm run data:order                                                      # regenerate the new-emotion order
```

`npm test` enforces: exactly 87 entries in the right 13 groups, unique ids, valid look-alike links, a playable note for every context entry, face parameters inside their ranges, no two identical faces, visible differences between close pairs, and the ordering rules.

## Privacy

- No accounts, analytics or network calls at runtime, apart from loading the app and its photos from the same site.
- The mirror uses the front camera only while it is on. Nothing is recorded, saved or uploaded, and every camera track stops when you leave the screen or turn the mirror off.

## Credits

Emotion names and groups from *Atlas of the Heart* by Brené Brown. Definitions, face guides and practice lines are original. Face cues draw on the Facial Action Coding System (Ekman and Friesen) and research by Dacher Keltner and others. Font: Inter. Icons: Lucide.
