/** Detecta comandos de voz para el LED / puerta (MQTT). */
export function parseLedVoiceCommand(text) {
  if (!text || typeof text !== 'string') return null

  const t = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const mentionsLed = /\bled\b|\bluz\b|\bpuerta\b/.test(t)

  if (
    mentionsLed &&
    /\b(encender|enciende|prende|prender|activa|activar|abre|abrir|on)\b/.test(t)
  ) {
    return 'on'
  }

  if (
    mentionsLed &&
    /\b(apagar|apaga|apague|desactiva|desactivar|off)\b/.test(t)
  ) {
    return 'off'
  }

  if (t.includes('encender led') || t.includes('prende el led') || t.includes('prender led')) {
    return 'on'
  }

  if (t.includes('apagar led') || t.includes('apaga el led')) {
    return 'off'
  }

  return null
}
