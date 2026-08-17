import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createTtsProxyMiddleware } from './server/tts-proxy.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEV_HOST = process.env.VITE_DEV_HOST || '0.0.0.0'

function resolveEnvDir() {
  const localEnv = path.resolve(__dirname, '.env.local')
  const parentEnv = path.resolve(__dirname, '..', '.env.local')
  if (fs.existsSync(localEnv)) return __dirname
  if (fs.existsSync(parentEnv)) return path.resolve(__dirname, '..')
  return __dirname
}

function ttsProxyPlugin() {
  return {
    name: 'tts-proxy',
    configureServer(server) {
      server.middlewares.use('/api/tts', createTtsProxyMiddleware())
      server.middlewares.use('/api/health', (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ ok: true, tts: true }))
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const envDir = resolveEnvDir()
  const env = loadEnv(mode, envDir, '')
  if (env.VITE_GOOGLE_TTS_API_KEY && !process.env.VITE_GOOGLE_TTS_API_KEY) {
    process.env.VITE_GOOGLE_TTS_API_KEY = env.VITE_GOOGLE_TTS_API_KEY
  }
  if (env.GOOGLE_TTS_API_KEY && !process.env.GOOGLE_TTS_API_KEY) {
    process.env.GOOGLE_TTS_API_KEY = env.GOOGLE_TTS_API_KEY
  }

  return {
    envDir,
    plugins: [react(), ttsProxyPlugin()],
    publicDir: path.resolve(__dirname, 'public'),
    resolve: {
      alias: {
        '@shared': path.resolve(__dirname, 'src/shared'),
      },
    },
    server: {
      host: DEV_HOST,
      port: 5200,
      strictPort: true,
    },
    preview: {
      host: '0.0.0.0',
      port: Number(process.env.PORT) || 5200,
      strictPort: false,
      allowedHosts: true,
    },
  }
})
