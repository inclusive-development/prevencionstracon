import { useCallback, useEffect, useRef, useState } from 'react'

export function isSpeechSupported() {
  if (typeof window === 'undefined') return false
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

/**
 * Push-to-talk: aprietas = escucha; sueltas = procesa el texto.
 * Si Chrome corta la sesión mientras sigues apretando, reinicia sin perder el dictado.
 */
export function usePushToTalk({ lang = 'es-CL', onResult, onInterim, onError, onEmpty } = {}) {
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [supported] = useState(() => isSpeechSupported())

  const recRef = useRef(null)
  const transcriptRef = useRef('')
  const pressedRef = useRef(false)
  const startingRef = useRef(false)
  const onResultRef = useRef(onResult)
  const onInterimRef = useRef(onInterim)
  const onErrorRef = useRef(onError)
  const onEmptyRef = useRef(onEmpty)
  const langRef = useRef(lang)
  const startRecRef = useRef(() => {})

  useEffect(() => {
    onResultRef.current = onResult
    onInterimRef.current = onInterim
    onErrorRef.current = onError
    onEmptyRef.current = onEmpty
  }, [onResult, onInterim, onError, onEmpty])

  useEffect(() => {
    langRef.current = lang
  }, [lang])

  const flushResult = useCallback(() => {
    const text = transcriptRef.current.trim()
    transcriptRef.current = ''
    setListening(false)
    setInterim('')
    if (text) onResultRef.current?.(text)
    else onEmptyRef.current?.()
  }, [])

  const startRecognition = useCallback(() => {
    if (!supported || recRef.current || startingRef.current || !pressedRef.current) return
    startingRef.current = true

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SR()
    rec.lang = langRef.current
    rec.continuous = true
    rec.interimResults = true

    rec.onresult = (event) => {
      let chunk = ''
      let live = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0].transcript
        if (event.results[i].isFinal) chunk += `${piece} `
        else live += piece
      }
      if (chunk) {
        transcriptRef.current = `${transcriptRef.current} ${chunk}`.replace(/\s+/g, ' ').trim()
      }
      const combined = `${transcriptRef.current} ${live}`.replace(/\s+/g, ' ').trim()
      setInterim(combined)
      if (combined) onInterimRef.current?.(combined)
    }

    rec.onerror = (event) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        onErrorRef.current?.(event.error)
      }
    }

    rec.onend = () => {
      recRef.current = null
      startingRef.current = false
      if (pressedRef.current) {
        window.setTimeout(() => startRecRef.current(), 80)
        return
      }
      flushResult()
    }

    recRef.current = rec
    setListening(true)
    try {
      rec.start()
    } catch {
      recRef.current = null
      setListening(false)
      onErrorRef.current?.('start-failed')
    } finally {
      startingRef.current = false
    }
  }, [supported, flushResult])

  startRecRef.current = startRecognition

  const start = useCallback(() => {
    if (!supported) return
    pressedRef.current = true
    startRecognition()
  }, [supported, startRecognition])

  const stop = useCallback(() => {
    pressedRef.current = false
    const rec = recRef.current
    if (rec) {
      try {
        rec.stop()
      } catch {
        flushResult()
      }
    } else {
      flushResult()
    }
  }, [flushResult])

  useEffect(
    () => () => {
      pressedRef.current = false
      try {
        recRef.current?.abort()
      } catch {
        /* noop */
      }
      recRef.current = null
    },
    [],
  )

  return { supported, listening, interim, start, stop }
}
