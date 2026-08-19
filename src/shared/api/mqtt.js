/** Publica comandos LED vía API del servidor Node (MQTT). */
export async function mqttLed(state) {
  const res = await fetch(`/api/mqtt/led/${state}`, { method: 'POST' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || data.hint || `MQTT HTTP ${res.status}`)
  }
  return data
}

export async function fetchMqttStatus() {
  const res = await fetch('/api/mqtt/status')
  return res.json()
}
