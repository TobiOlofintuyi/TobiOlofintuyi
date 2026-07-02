import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Relative base so the app runs from any path — a repo subdirectory, a static
// host, GitHub Pages, or file preview — without hard-coding a deploy URL.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg', 'icon-maskable.svg'],
      // Offline-first: precache the built shell so the app opens with zero network.
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'Inyeon',
        short_name: 'Inyeon',
        description: 'A voice journal that listens, and grows with you.',
        lang: 'en',
        // Dark is the default surface; the live meta theme-color is swapped per
        // theme at runtime (see src/pwa.ts): #0C0906 dark, #F8F7F4 light.
        theme_color: '#0C0906',
        background_color: '#0C0906',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        scope: '.',
        categories: ['health', 'lifestyle', 'productivity'],
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
})
