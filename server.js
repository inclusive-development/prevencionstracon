import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { getTtsApiKey, handleTtsRequest } from './server/tts-proxy.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = Number(process.env.PORT) || 5200
const distDir = path.join(__dirname, 'dist')

app.disable('x-powered-by')
app.use(express.json({ limit: '32kb' }))

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    tts: Boolean(getTtsApiKey()),
  })
})

app.post('/api/tts', handleTtsRequest)

app.use(
  express.static(distDir, {
    index: false,
    setHeaders(res, filePath) {
      if (filePath.includes(`${path.sep}assets${path.sep}`)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      }
    },
  }),
)

app.use((_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Prevención → http://0.0.0.0:${PORT} | TTS key: ${getTtsApiKey() ? 'ok' : 'FALTA'}`)
})
