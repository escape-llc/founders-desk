import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages serves this repo from a /founders-desk/ subpath, not the
// domain root -- `base` (and the PWA manifest's scope/start_url, which
// must match it or the installed app's navigation breaks outside that
// subpath) only need that prefix for a real production build. Dev/preview
// stay at '/' so `npm run dev` keeps working unchanged.
export default defineConfig(({ command }) => {
  const base = command === 'build' ? '/founders-desk/' : '/';

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg'],
        manifest: {
          name: "Founder's Desk",
          short_name: 'FoundersDesk',
          description: "Acme Analytics — a personal command-center PWA for journaling and expense tracking",
          theme_color: '#2b4c8c',
          background_color: '#0f1420',
          display: 'standalone',
          scope: base,
          start_url: base,
          icons: [
            {
              src: 'favicon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
      }),
    ],
  };
});
