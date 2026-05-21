import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '温湿度监控',
        short_name: '温湿度',
        description: 'ESP32温湿度监控系统',
        version: '1.0.0',
        manifest_version: 3,
        start_url: '/iot-monitor-web/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#165DFF',
        background_color: '#FFFFFF',
        icons: [
          {
            src: 'icons/tea_iot_app_icon.jpg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'icons/tea_iot_app_icon.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{html,js,css,ico,png,svg,jpg,jpeg}']
      },
      includeAssets: ['icons/tea_iot_app_icon.jpg']
    })
  ],
  base: '/iot-monitor-web/',
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
