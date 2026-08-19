import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { getTtsApiKey, handleTtsRequest } from './server/tts-proxy.js'
import { getMqttStatus, handleLedPublish, initMqtt } from './server/mqtt-client.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = Number(process.env.PORT) || 5200
const distDir = path.join(__dirname, 'dist')

app.disable('x-powered-by')
app.use(express.json({ limit: '32kb' }))

initMqtt()

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    tts: Boolean(getTtsApiKey()),
    mqtt: getMqttStatus(),
  })
})

app.get('/api/mqtt/status', (_req, res) => {
  res.json(getMqttStatus())
})

app.post('/api/mqtt/led/on', (req, res) => handleLedPublish(req, res, 'on'))
app.post('/api/mqtt/led/off', (req, res) => handleLedPublish(req, res, 'off'))

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
  const mqtt = getMqttStatus()
  console.log(
    `Stracon prevención → http://0.0.0.0:${PORT} | TTS: ${getTtsApiKey() ? 'ok' : 'FALTA'} | MQTT: ${mqtt.brokerUrl}`,
  )
})
