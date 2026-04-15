import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const isVitest = process.env.VITEST === 'true'

  return {
    base: '/gathering-island-admin',
    plugins: [
      vue(
        isVitest
          ? {
              template: {
                // 否則 <img src="/logo_title.svg"> 會被轉成 file:///…，在 Vitest 下觸發 Node 讀檔錯誤
                transformAssetUrls: false,
              },
            }
          : {},
      ),
      tailwindcss(),
      vueDevTools({
        componentInspector: {
          launchEditor: 'cursor',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy:
        mode === 'development'
          ? {
              '/backend': {
                target: env.VITE_API_PROXY_TARGET || 'http://localhost:3000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/backend/, ''),
              },
            }
          : undefined,
    },
    test: {
      // jsdom 對 public 根路徑圖片較寬鬆；happy-dom 會把 /logo_title.svg 轉成 file:/// 讀檔而拋錯
      environment: 'jsdom',
      globals: false,
      include: ['src/tests/**/*.test.ts'],
    },
  }
})
