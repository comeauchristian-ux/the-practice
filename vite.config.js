import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'pwa-192.png', 'pwa-512.png'],
      manifest: {
        name: 'The Practice',
        short_name: 'The Practice',
        description: 'One set. Stable targets. Honest history.',
        start_url: '/the-practice/',         // <- repo name path for GitHub Pages
        scope: '/the-practice/',
        display: 'standalone',
        background_color: '#0f1115',
        theme_color: '#0f1115',
        icons: [
          { src: '/the-practice/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/the-practice/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/the-practice/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ],
  base: '/the-practice/',
})
