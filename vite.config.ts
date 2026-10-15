/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { facePhotos } from './vite-plugins/facePhotos.ts';

// GitHub Pages serves the site under /<repo-name>/. Override with BASE_PATH.
const base = process.env.BASE_PATH ?? '/face-trainer/';

export default defineConfig({
  base,
  // One bundle is fine here: the whole app is precached for offline use.
  build: { chunkSizeWarningLimit: 900 },
  define: { __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '1.0.0') },
  plugins: [
    react(),
    tailwindcss(),
    facePhotos(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: './',
        name: 'Stage Face',
        short_name: 'Stage Face',
        description: 'Train your face to show 87 emotions clearly, on cue.',
        lang: 'en',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        theme_color: '#0F2C30',
        background_color: '#0A1315',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,svg,png,ico,webmanifest}'],
        globIgnores: ['faces/**'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /\/faces\/[^/]+\.webp$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'face-photos',
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
  },
});
