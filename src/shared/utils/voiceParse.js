import { cleanRut } from './rut'

const NUM_WORDS = {
  cero: '0',
  uno: '1',
  un: '1',
  dos: '2',
  tres: '3',
  cuatro: '4',
  cinco: '5',
  seis: '6',
  siete: '7',
  ocho: '8',
  nueve: '9',
}

const DAY_NAMES = [
  'domingo',
  'lunes',
  'martes',
  'miercoles',
  'miércoles',
  'jueves',
  'viernes',
  'sabado',
  'sábado',
]

export function normalizeVoice(text) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

/** ¿El dictado contiene alguna de las palabras clave? */
export function voiceIncludes(text, ...keywords) {
  const q = normalizeVoice(text)
  return keywords.some((k) => q.includes(normalizeVoice(k)))
}

/** ¿Pide borrar / limpiar lo escrito? (multi-idioma básico) */
export function voiceWantsClear(text) {
  const q = normalizeVoice(text)
  if (!q) return false
  return (
    q.includes('borra todo') ||
    q.includes('borrar todo') ||
    q.includes('elimina todo') ||
    q.includes('limpiar todo') ||
    q.includes('borra lo escrito') ||
    q.includes('borrar lo escrito') ||
    q === 'borrar' ||
    q === 'borra' ||
    q === 'limpiar' ||
    q === 'eliminar' ||
    q.includes('vaciar') ||
    q.includes('clear all') ||
    q.includes('delete all') ||
    q.includes('erase all') ||
    q === 'clear' ||
    q === 'delete' ||
    q.includes('apagar tudo') ||
    q.includes('limpar tudo') ||
    q.includes('effacer tout') ||
    q.includes('tout effacer') ||
    q.includes('全部删除') ||
    q.includes('全部清除') ||
    q.includes('すべて削除') ||
    q.includes('クリア') ||
    q.includes('모두 삭제') ||
    q.includes('전부 지워')
  )
}

/** ¿Es un saludo? (hola, buenos días, cómo estás, hello…) */
export function voiceIsGreeting(text) {
  const q = normalizeVoice(text)
  if (!q) return false
  return (
    q.includes('hola') ||
    q.includes('buenos dias') ||
    q.includes('buen dia') ||
    q.includes('buenas tardes') ||
    q.includes('buenas noches') ||
    q.includes('como estas') ||
    q.includes('como esta') ||
    q.includes('que tal') ||
    q.includes('mucho gusto') ||
    q.includes('saludos') ||
    q.includes('hello') ||
    q.includes('hi there') ||
    /\bhi\b/.test(q) ||
    q.includes('good morning') ||
    q.includes('good afternoon') ||
    q.includes('good evening') ||
    q.includes('how are you') ||
    q.includes('nice to meet') ||
    q.includes('bonjour') ||
    q.includes('bonsoir') ||
    q.includes('salut') ||
    q.includes('comment allez') ||
    q.includes('bom dia') ||
    q.includes('boa tarde') ||
    q.includes('boa noite') ||
    q.includes('ola') ||
    q.includes('tudo bem') ||
    q.includes('como vai') ||
    q.includes('annyeong') ||
    q.includes('안녕하세요') ||
    q.includes('안녕') ||
    q.includes('你好') ||
    q.includes('您好') ||
    q.includes('早上好') ||
    q.includes('晚上好') ||
    q.includes('こんにちは') ||
    q.includes('こんばんは') ||
    q.includes('おはよう') ||
    q.includes('もしもし')
  )
}

function replaceNumberWords(text) {
  let out = normalizeVoice(text)
  for (const [word, digit] of Object.entries(NUM_WORDS)) {
    out = out.replace(new RegExp(`\\b${word}\\b`, 'g'), digit)
  }
  return out
}

/** Convierte dictado a RUT limpio: solo dígitos + K (ej. "uno dos tres ka" → 123K). */
export function parseSpokenRut(text) {
  let t = replaceNumberWords(text)
  t = t.replace(/\b(ka|kay|kei|que|k)\b/gi, 'k')
  t = t.replace(/\bguion\b/gi, '')
  t = t.replace(/\bpunto\b/gi, '')
  t = t.replace(/\s+/g, '')
  // Descartar cualquier palabra residual; quedan solo números y K
  return cleanRut(t.replace(/[^0-9kK]/g, ''))
}

/** Convierte dictado a correo (ej. "maria arroba gmail punto com"). */
export function parseSpokenEmail(text) {
  let t = normalizeVoice(text)
  t = t.replace(/\barroba\b/g, '@')
  t = t.replace(/\bpunto\b/g, '.')
  t = t.replace(/\s+/g, '')
  t = t.replace(/at/g, '@')
  if (!t.includes('@')) return t
  const [user, domain] = t.split('@')
  return `${user}@${domain}`
}

/** Extrae dígitos de un teléfono dictado. */
export function parseSpokenPhone(text) {
  const t = replaceNumberWords(text)
  const digits = t.replace(/\D/g, '')
  if (digits.length >= 8) return digits
  return t.replace(/\s+/g, ' ').trim()
}

/** Extrae un número entero del dictado. */
export function parseSpokenNumber(text) {
  const t = replaceNumberWords(text)
  const m = t.match(/\d+/)
  return m ? parseInt(m[0], 10) : null
}

/** Capitaliza nombre propio desde dictado. */
export function parseSpokenName(text) {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

/** Encuentra la mejor coincidencia por voz en una lista. */
export function bestVoiceMatch(query, items, getLabel) {
  if (!query || !items?.length) return null
  const q = normalizeVoice(query)
  let best = null
  let bestScore = 0

  for (const item of items) {
    const label = normalizeVoice(getLabel(item))
    if (!label) continue
    if (label.includes(q) || q.includes(label)) return item

    const qWords = q.split(/\s+/).filter((w) => w.length > 2)
    const score = qWords.reduce((acc, w) => (label.includes(w) ? acc + 1 : acc), 0)
    if (score > bestScore) {
      bestScore = score
      best = item
    }
  }

  return bestScore > 0 ? best : null
}

/** Busca fecha en lista de Date según dictado (día, "mañana", nombre del día). */
export function matchDateFromSpeech(text, dates) {
  if (!dates?.length) return null
  const q = normalizeVoice(text)

  if (/\bmanana\b/.test(q)) return dates[0]
  if (/\bpasado manana\b/.test(q) && dates.length > 1) return dates[1]

  for (const d of DAY_NAMES) {
    if (q.includes(d.replace('é', 'e'))) {
      const idx = DAY_NAMES.indexOf(d) % 7
      const match = dates.find((date) => date.getDay() === idx)
      if (match) return match
    }
  }

  const nums = q.match(/\d{1,2}/g)
  if (nums) {
    for (const n of nums) {
      const day = parseInt(n, 10)
      const match = dates.find((date) => date.getDate() === day)
      if (match) return match
    }
  }

  return bestVoiceMatch(
    q,
    dates,
    (d) =>
      d.toLocaleDateString('es-CL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
  )
}

/** Busca horario HH:MM en lista de strings. */
export function matchTimeFromSpeech(text, times) {
  if (!times?.length) return null
  const q = normalizeVoice(text)

  const direct = q.match(/\b(\d{1,2})[:\s](\d{2})\b/)
  if (direct) {
    const hh = direct[1].padStart(2, '0')
    const mm = direct[2]
    const target = `${hh}:${mm}`
    const match = times.find((t) => t === target || t.startsWith(target))
    if (match) return match
  }

  const spoken = replaceNumberWords(q)
  const parts = spoken.match(/\b(\d{1,2})\s+(\d{2})\b/)
  if (parts) {
    const target = `${parts[1].padStart(2, '0')}:${parts[2]}`
    const match = times.find((t) => t === target)
    if (match) return match
  }

  return bestVoiceMatch(q, times, (t) => t.replace(':', ' '))
}
