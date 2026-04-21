import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      // Serve the local mock file for /config during development.
      // This proxy is only active with `vite dev` — never included in production builds.
      '/config': {
        target: 'http://localhost:5173', // unused — handled entirely by the custom handler below
        bypass(req, res) {
          if (req.url === '/config' && res) {
            const mock = readFileSync(new URL('./mock/config.json', import.meta.url), 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.end(mock)
            return false // response is already handled
          }
        },
      },
    },
  },
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Silence Sass deprecation warnings from vanilla-framework's legacy @import usage
        silenceDeprecations: ['import', 'global-builtin', 'if-function', 'color-functions'],
      },
    },
  },
})
