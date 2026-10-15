/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

declare const __APP_VERSION__: string;

declare module 'virtual:face-photos' {
  /** File names in public/faces, e.g. "stress-male.webp". */
  const files: string[];
  export default files;
}
