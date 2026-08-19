/**
 * Cliente MQTT del tótem — publica en totem/led (contrato con ESP32).
 *
 * Contrato (idéntico en ambos lados):
 *   Topic: totem/led
 *   Mensaje encender: on
 *   Mensaje apagar: off
 *
 * Render.com: NO uses localhost. Ambos (Render + ESP32) se conectan al mismo
 * broker accesible en Internet (HiveMQ Cloud, CloudMQTT, Mosquitto en VPS, etc.).
 */
import mqtt from 'mqtt'

const BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883'
const TOPIC_LED = process.env.MQTT_TOPIC_LED || 'totem/led'

let client = null
let connected = false
let lastError = null

export function getMqttConfig() {
  return { brokerUrl: BROKER_URL, topicLed: TOPIC_LED }
}

export function getMqttStatus() {
  return {
    configured: Boolean(BROKER_URL),
    connected,
    brokerUrl: BROKER_URL.replace(/\/\/.*@/, '//***@'),
    topicLed: TOPIC_LED,
    lastError,
  }
}

export function initMqtt() {
  if (client) return client

  client = mqtt.connect(BROKER_URL, {
    reconnectPeriod: 5000,
    connectTimeout: 15000,
    keepalive: 30,
  })

  client.on('connect', () => {
    connected = true
    lastError = null
    console.log(`[MQTT] Conectado al broker → ${BROKER_URL} (topic ${TOPIC_LED})`)
  })

  client.on('error', (err) => {
    lastError = err.message
    console.warn('[MQTT] Error:', err.message)
  })

  client.on('close', () => {
    connected = false
  })

  client.on('reconnect', () => {
    console.log('[MQTT] Reconectando…')
  })

  return client
}

export function publishLed(state) {
  const message = state === 'on' ? 'on' : 'off'
  const c = initMqtt()

  return new Promise((resolve, reject) => {
    c.publish(TOPIC_LED, message, { qos: 0 }, (err) => {
      if (err) {
        lastError = err.message
        reject(err)
        return
      }
      console.log(`[MQTT] Enviado: ${message} → ${TOPIC_LED}`)
      resolve({ ok: true, topic: TOPIC_LED, message })
    })
  })
}

export async function handleLedPublish(req, res, state) {
  try {
    const data = await publishLed(state)
    res.json(data)
  } catch (err) {
    res.status(502).json({
      ok: false,
      error: err.message,
      hint:
        'Verifica MQTT_BROKER_URL en Render. En la nube no sirve localhost; usa un broker MQTT público o en VPS.',
    })
  }
}
