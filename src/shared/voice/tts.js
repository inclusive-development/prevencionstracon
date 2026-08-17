/**
 * Servicio de voz del tótem.
 *
 * 1) POST /api/tts (servidor)  2) Google directo en navegador (como tótem médico)
 * 3) Fallback speechSynthesis
 *
 * Si la API key tiene restricción HTTP referrer, el proxy servidor da 403
 * pero el directo en navegador funciona (agrega la URL de prevención en Google Cloud).
 */

import { DEFAULT_LOCALE, getLocale } from '../i18n/locales'

/** Misma key que tótem médico — embebida en build con VITE_GOOGLE_TTS_API_KEY */
const CLIENT_KEY = import.meta.env.VITE_GOOGLE_TTS_API_KEY || ''

/** Delay tras cancelar: Chrome/Edge heredan el acento si se habla al instante. */
const BROWSER_VOICE_SWITCH_MS = 120

const RUT_REPLACEMENTS = {
  es: 'número de cédula',
  en: 'ID number',
  ko: '신분증 번호',
  zh: '证件号码',
  ja: '書類番号',
  pt: 'número de documento',
  fr: 'numéro de document',
}

/** Deletreo para siglas que TTS lee mal (EPP → "ep"). */
const EPP_REPLACEMENTS = {
  es: 'e pe pe',
  en: 'E P P',
  ko: 'E P P',
  zh: 'E P P',
  ja: 'E P P',
  pt: 'E P P',
  fr: 'E P P',
}

/** Nombres de voz preferidos por locale (Windows / Chrome). */
const PREFERRED_VOICE_NAMES = {
  es: ['sabina', 'helena', 'laura', 'paulina', 'google español', 'microsoft sabina'],
  en: ['zira', 'jenny', 'aria', 'google us english', 'microsoft zira', 'samantha'],
  ko: ['heami', 'sunhi', 'google 한국어', 'microsoft heami'],
  zh: ['xiaoxiao', 'yaoyao', 'huihui', 'google 普通话', 'microsoft xiaoxiao'],
  ja: ['nanami', 'haruka', 'ayumi', 'google 日本語', 'microsoft nanami'],
  pt: ['maria', 'francisca', 'google português', 'microsoft maria'],
  fr: ['hortense', 'julie', 'denise', 'google français', 'microsoft hortense'],
}

class TTSService {
  constructor() {
    this.mouth = 0
    this.speaking = false
    this.audioCtx = null
    this.currentSource = null
    this.rafId = null
    this.fallbackTimer = null
    this.utterance = null
    this.onCaption = null
    this.onSpeakingChange = null
    this._speakingListeners = new Set()
    this.cache = new Map()
    this.generation = 0
    this.localeId = DEFAULT_LOCALE
    this._voiceEpoch = 0
    this._browserReady = null
    this._audioUnlocked = false
    this._pendingSpeak = null
    this._playbackListeners = new Set()
  }

  onPlaybackStart(cb) {
    if (typeof cb !== 'function') return () => {}
    this._playbackListeners.add(cb)
    return () => this._playbackListeners.delete(cb)
  }

  _emitPlaybackStart() {
    this._playbackListeners.forEach((cb) => {
      try {
        cb()
      } catch {
        /* ignore */
      }
    })
  }

  /** Espera a que termine la locución actual (p. ej. bienvenida antes del RUT). */
  whenIdle(maxMs = 20000) {
    if (!this.speaking && !this.currentSource && !this.hasPending()) {
      return Promise.resolve()
    }
    return new Promise((resolve) => {
      const timeout = window.setTimeout(resolve, maxMs)
      const unsub = this.subscribeSpeaking((active) => {
        if (!active && !this.hasPending()) {
          clearTimeout(timeout)
          unsub()
          resolve()
        }
      })
    })
  }

  _isAudioLocked() {
    if (this._audioUnlocked) return false
    try {
      return this._ctx().state === 'suspended'
    } catch {
      return true
    }
  }

  _deferSpeak(text) {
    this._pendingSpeak = text
    this.onCaption?.(text)
    this.mouth = 0
    this._setSpeaking(false)
  }

  hasPending() {
    return Boolean(this._pendingSpeak)
  }

  isUnlocked() {
    return this._audioUnlocked
  }

  _flushPending() {
    if (!this._pendingSpeak) return
    const text = this._pendingSpeak
    this._pendingSpeak = null
    void this.speak(text, { softStart: true })
  }

  /** Intenta reanudar AudioContext sin gesto (funciona en algunos kioscos). */
  tryAutoUnlock() {
    if (this._audioUnlocked) {
      this._flushPending()
      return
    }
    try {
      const ctx = this._ctx()
      if (ctx.state !== 'suspended') {
        this._audioUnlocked = true
        this._flushPending()
        return
      }
      void ctx.resume().then(() => {
        if (ctx.state === 'running') {
          this._audioUnlocked = true
          this._flushPending()
        }
      })
    } catch {
      /* ignore */
    }
  }

  /** Precarga audio Google (p. ej. durante splash) sin reproducir. */
  prefetch(text) {
    const spoken = this._prepareSpeech(text)
    return this._fetchGoogleAudio(spoken, this.localeId).catch(() => {})
  }

  /** Desbloquea Web Audio (Chrome kiosk). Llamar en pointerdown. */
  unlock() {
    this._audioUnlocked = true
    const synth = window.speechSynthesis
    if (synth) {
      synth.getVoices()
      try {
        synth.resume()
      } catch {
        /* ignore */
      }
    }

    try {
      const ctx = this._ctx()
      if (ctx.state === 'suspended') {
        void ctx.resume().then(() => this._flushPending())
      }
    } catch {
      /* ignore */
    }
    // Intento inmediato (speechSynthesis / contexto ya running) + otro tras resume.
    this._flushPending()
  }

  subscribeSpeaking(cb) {
    if (typeof cb !== 'function') return () => {}
    this._speakingListeners.add(cb)
    return () => this._speakingListeners.delete(cb)
  }

  setLocale(localeId) {
    const next = localeId || DEFAULT_LOCALE
    if (this.localeId === next) return
    this.localeId = next
    this.cache.clear()
    this._voiceEpoch += 1
    this._hardResetBrowserSynth()
  }

  _voiceConfig() {
    return getLocale(this.localeId).google
  }

  _ctx() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume()
    return this.audioCtx
  }

  _setSpeaking(v) {
    this.speaking = v
    this.onSpeakingChange?.(v)
    this._speakingListeners.forEach((cb) => {
      try {
        cb(v)
      } catch {
        /* ignore listener errors */
      }
    })
  }

  _hardResetBrowserSynth() {
    const synth = window.speechSynthesis
    if (!synth) return
    try {
      synth.cancel()
      synth.pause()
      synth.resume()
      synth.cancel()
    } catch {
      /* ignore */
    }
    this.utterance = null
  }

  cancel() {
    this.generation++
    this._pendingSpeak = null
    if (this.currentSource) {
      try {
        this.currentSource.onended = null
        this.currentSource.stop()
      } catch {
        /* ya detenido */
      }
      this.currentSource = null
    }
    if (this.rafId) cancelAnimationFrame(this.rafId)
    if (this.fallbackTimer) clearInterval(this.fallbackTimer)
    this.rafId = null
    this.fallbackTimer = null
    this._hardResetBrowserSynth()
    this.mouth = 0
    this._setSpeaking(false)
    this.onCaption?.(null)
  }

  _prepareSpeech(text) {
    const rut = RUT_REPLACEMENTS[this.localeId] || RUT_REPLACEMENTS.es
    const epp = EPP_REPLACEMENTS[this.localeId] || EPP_REPLACEMENTS.es
    return String(text)
      .replace(/\bRUT\b/gi, rut)
      .replace(/\brut\b/g, rut)
      .replace(/\bEPP\b/g, epp)
      .replace(/\bepp\b/g, epp)
  }

  async speak(text, options = {}) {
    const softStart = Boolean(options.softStart) && !this.speaking && !this.currentSource
    if (softStart) {
      this.generation++
      this._pendingSpeak = null
      this.onCaption?.(null)
    } else {
      this.cancel()
    }

    const gen = this.generation
    const localeAtSpeak = this.localeId
    const spoken = this._prepareSpeech(text)
    this.onCaption?.(text)
    this._setSpeaking(true)

    try {
      await this._speakGoogle(spoken, gen, localeAtSpeak)
    } catch (err) {
      console.warn('[TTS] Google TTS falló, usando voz del navegador:', err)
      if (gen !== this.generation) return
      try {
        await this._speakBrowser(spoken, gen, localeAtSpeak)
      } catch (browserErr) {
        console.warn('[TTS] Voz del navegador no disponible aún:', browserErr)
        if (gen !== this.generation) return
        this._deferSpeak(text)
        this.tryAutoUnlock()
      }
    } finally {
      if (gen === this.generation && !this._pendingSpeak) {
        this.mouth = 0
        this._setSpeaking(false)
        this.onCaption?.(null)
      }
    }
  }

  async _bufferFromGoogleResponse(res, cacheKey) {
    const raw = await res.text()
    if (!raw) throw new Error(`Google TTS HTTP ${res.status} (respuesta vacía)`)

    let data
    try {
      data = JSON.parse(raw)
    } catch {
      throw new Error('Google TTS devolvió respuesta inválida')
    }

    if (!res.ok || !data.audioContent) {
      const detail = data?.error?.message || data?.error || res.status
      throw new Error(`Google TTS HTTP ${res.status}: ${detail}`)
    }

    const bytes = Uint8Array.from(atob(data.audioContent), (c) => c.charCodeAt(0))
    const ctx = this._ctx()
    if (ctx.state === 'suspended') await ctx.resume().catch(() => {})
    const buffer = await ctx.decodeAudioData(bytes.buffer.slice(0))
    this.cache.set(cacheKey, buffer)
    return buffer
  }

  async _fetchGoogleAudio(text, localeId) {
    const voice = getLocale(localeId).google
    const cacheKey = `${voice.name}|${text}`
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)

    const payload = {
      input: { text },
      voice: {
        languageCode: voice.languageCode,
        name: voice.name,
        ssmlGender: voice.ssmlGender,
      },
      audioConfig: { audioEncoding: 'MP3', speakingRate: 0.95, pitch: 3.0 },
    }

    const tryProxy = async () => {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      return this._bufferFromGoogleResponse(res, cacheKey)
    }

    const tryDirect = async () => {
      if (!CLIENT_KEY) throw new Error('Sin VITE_GOOGLE_TTS_API_KEY en el cliente')
      const res = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${CLIENT_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )
      return this._bufferFromGoogleResponse(res, cacheKey)
    }

    try {
      return await tryProxy()
    } catch (proxyErr) {
      console.warn('[TTS] Proxy /api/tts falló, probando Google directo (tótem médico):', proxyErr)
      return tryDirect()
    }
  }

  _speakGoogle(text, gen, localeId) {
    return this._fetchGoogleAudio(text, localeId).then(async (buffer) => {
      if (gen !== this.generation) return
      const ctx = this._ctx()
      if (ctx.state === 'suspended') {
        await ctx.resume().catch(() => {})
      }
      if (gen !== this.generation) return
      // No "reproducir" en silencio: Chrome bloquea autoplay y el saludo quedaba
      // marcado como escuchado aunque el usuario no oyó nada.
      if (ctx.state !== 'running') {
        throw new Error('AudioContext bloqueado hasta interacción')
      }

      return new Promise((resolve, reject) => {
        const source = ctx.createBufferSource()
        source.buffer = buffer
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 512
        source.connect(analyser)
        analyser.connect(ctx.destination)
        this.currentSource = source

        const data = new Uint8Array(analyser.fftSize)
        let smooth = 0
        let playbackEmitted = false
        const tick = () => {
          if (gen !== this.generation) return
          analyser.getByteTimeDomainData(data)
          let sum = 0
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128
            sum += v * v
          }
          const rms = Math.sqrt(sum / data.length)
          const target = Math.min(1, rms * 6.5)
          smooth = target > smooth ? target : smooth * 0.75
          this.mouth = smooth
          if (!playbackEmitted && smooth > 0.08) {
            playbackEmitted = true
            this._emitPlaybackStart()
          }
          this.rafId = requestAnimationFrame(tick)
        }
        tick()

        source.onended = () => {
          if (this.rafId) cancelAnimationFrame(this.rafId)
          if (gen === this.generation) this.mouth = 0
          this.currentSource = null
          resolve()
        }

        try {
          source.start(0)
        } catch (err) {
          reject(err)
        }
      })
    })
  }

  _normLang(lang) {
    return String(lang || '').toLowerCase().replace(/_/g, '-')
  }

  _pickVoice(voices, localeId) {
    if (!voices?.length) return null
    const meta = getLocale(localeId)
    const want = this._normLang(meta.speech)
    const prefix = meta.browserLangPrefix.toLowerCase()
    const preferred = PREFERRED_VOICE_NAMES[localeId] || []

    const score = (v) => {
      const lang = this._normLang(v.lang)
      if (!lang.startsWith(prefix)) return -1
      let s = 0
      if (lang === want) s += 100
      else if (lang.startsWith(want.split('-')[0])) s += 40
      const name = (v.name || '').toLowerCase()
      if (preferred.some((p) => name.includes(p))) s += 50
      if (name.includes('neural') || name.includes('natural') || name.includes('online')) s += 20
      if (/female|femenin|mujer|woman|zira|sabina|helena|haruka|nanami|heami|maria|hortense|julie|xiaoxiao/i.test(name)) {
        s += 15
      }
      if (/male|hombre|david|mark|jorge|pablo|george|thomas/i.test(name)) s -= 25
      if (v.localService) s += 5
      return s
    }

    let best = null
    let bestScore = -1
    for (const v of voices) {
      const s = score(v)
      if (s > bestScore) {
        bestScore = s
        best = v
      }
    }
    return bestScore >= 0 ? best : voices.find((v) => this._normLang(v.lang).startsWith(prefix)) || voices[0] || null
  }

  _wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async _ensureVoices() {
    const synth = window.speechSynthesis
    if (!synth) return []
    let voices = synth.getVoices()
    if (voices.length) return voices

    await new Promise((resolve) => {
      const done = () => {
        synth.removeEventListener('voiceschanged', done)
        resolve()
      }
      synth.addEventListener('voiceschanged', done)
      setTimeout(done, 400)
    })
    return synth.getVoices()
  }

  async _speakBrowser(text, gen, localeId) {
    const synth = window.speechSynthesis
    if (!synth) return

    await this._wait(BROWSER_VOICE_SWITCH_MS)
    if (gen !== this.generation) return

    this._hardResetBrowserSynth()
    await this._wait(40)
    if (gen !== this.generation) return

    const voices = await this._ensureVoices()
    if (gen !== this.generation) return

    const meta = getLocale(localeId)
    const voice = this._pickVoice(voices, localeId)

    return new Promise((resolve, reject) => {
      if (gen !== this.generation) return resolve()

      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = voice?.lang || meta.speech
      if (voice) utter.voice = voice
      utter.rate = 0.92
      utter.pitch = localeId === 'es' ? 1.35 : 1.1
      this.utterance = utter

      console.info(
        '[TTS] Voz:',
        voice?.name || '(sin voz matching)',
        '| lang:',
        utter.lang,
        '| locale:',
        localeId,
      )

      let settled = false
      let started = false
      let safetyTimer = null
      let startTimer = null

      const finish = (ok = true) => {
        if (settled) return
        settled = true
        if (this.fallbackTimer) clearInterval(this.fallbackTimer)
        this.fallbackTimer = null
        if (gen === this.generation) this.mouth = 0
        if (safetyTimer) clearTimeout(safetyTimer)
        if (startTimer) clearTimeout(startTimer)
        if (ok) resolve()
        else reject(new Error('speechSynthesis no inició (autoplay bloqueado)'))
      }

      utter.onstart = () => {
        if (gen !== this.generation) {
          try {
            synth.cancel()
          } catch {
            /* ignore */
          }
          return
        }
        started = true
        if (startTimer) clearTimeout(startTimer)
        this._emitPlaybackStart()
        let t = 0
        this.fallbackTimer = setInterval(() => {
          t += 0.35
          const base = (Math.sin(t * 3.1) + Math.sin(t * 5.7)) * 0.25 + 0.45
          this.mouth = Math.max(0.05, Math.min(1, base + Math.random() * 0.2))
        }, 55)
      }
      utter.onend = () => finish(true)
      utter.onerror = (ev) => {
        if (!started || ev?.error === 'not-allowed') finish(false)
        else finish(true)
      }
      // Si Chrome bloquea autoplay, onstart nunca llega.
      startTimer = setTimeout(() => {
        if (!started) {
          try {
            synth.cancel()
          } catch {
            /* ignore */
          }
          finish(false)
        }
      }, 900)
      safetyTimer = setTimeout(() => finish(true), 45000)

      try {
        synth.resume()
      } catch {
        /* ignore */
      }
      synth.speak(utter)
    })
  }
}

export const tts = new TTSService()
export const hasGoogleTTS = Boolean(CLIENT_KEY)
