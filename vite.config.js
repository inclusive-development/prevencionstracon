import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createTtsProxyMiddleware } from './server/tts-proxy.js'
import { getMqttStatus, handleLedPublish, initMqtt } from './server/mqtt-client.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEV_HOST = process.env.VITE_DEV_HOST || '0.0.0.0'

function resolveEnvDir() {
  const localEnv = path.resolve(__dirname, '.env.local')
  const parentEnv = path.resolve(__dirname, '..', '.env.local')
  if (fs.existsSync(localEnv)) return __dirname
  if (fs.existsSync(parentEnv)) return path.resolve(__dirname, '..')
  return __dirname
}

function mqttApiMiddleware() {
  return async (req, res, next) => {
    const url = req.url?.split('?')[0] || ''

    if (url === '/api/mqtt/status' && req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(getMqttStatus()))
      return
    }

    if (url === '/api/mqtt/led/on' && req.method === 'POST') {
      const fakeRes = {
        status(code) {
          res.statusCode = code
          return fakeRes
        },
        json(body) {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        },
      }
      await handleLedPublish(req, fakeRes, 'on')
      return
    }

    if (url === '/api/mqtt/led/off' && req.method === 'POST') {
      const fakeRes = {
        status(code) {
          res.statusCode = code
          return fakeRes
        },
        json(body) {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        },
      }
      await handleLedPublish(req, fakeRes, 'off')
      return
    }

    next()
  }
}

function ttsProxyPlugin() {
  return {
    name: 'tts-proxy',
    configureServer(server) {
      initMqtt()
      server.middlewares.use(mqttApiMiddleware())
      server.middlewares.use('/api/tts', createTtsProxyMiddleware())
      server.middlewares.use('/api/health', (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ ok: true, tts: true, mqtt: getMqttStatus() }))
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
