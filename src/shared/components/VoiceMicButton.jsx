import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../i18n/LocaleContext'
import { usePushToTalk } from '../voice/speechToText'
import { voiceWantsClear } from '../utils/voiceParse'
import { tts } from '../voice/tts'
import { avatar } from '../avatar/controller'

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 14.5a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5.5a3 3 0 0 0 3 3Z"
        fill="currentColor"
      />
      <path
        d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Ondas = escuchando */
function ListenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 14.5a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5.5a3 3 0 0 0 3 3Z"
        fill="currentColor"
      />
      <path
        d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        className="voice-mic-wave voice-mic-wave--a"
        d="M4 10c0 0 0 4 0 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        className="voice-mic-wave voice-mic-wave--b"
        d="M20 10c0 0 0 4 0 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M3.2 9.2a8.2 8.2 0 0 0 0 5.6M20.8 9.2a8.2 8.2 0 0 1 0 5.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  )
}

/** Spinner = procesando / pensando */
function ProcessIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="voice-mic-spin-svg">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <path
        d="M20.5 12a8.5 8.5 0 0 0-8.5-8.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Altavoz / ondas = ella está hablando */
function SpeakIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.5 9.5v5h3.2L13 19V5L7.7 9.5H4.5Z"
        fill="currentColor"
      />
      <path
        className="voice-speak-arc voice-speak-arc--a"
        d="M16 9.2a3.4 3.4 0 0 1 0 5.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        className="voice-speak-arc voice-speak-arc--b"
        d="M18.4 7a6.2 6.2 0 0 1 0 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

const PHASE = {
  idle: 'idle',
  listening: 'listening',
  processing: 'processing',
  speaking: 'speaking',
}

/**
 * Botón grande push-to-talk: aprietas = escucha; sueltas = procesa (suave) → habla.
 */
export default function VoiceMicButton({
  hint,
  label,
  onResult,
  onInterim,
  onClear,
  onError,
  onListeningChange,
  disabled = false,
  className = '',
  mode = 'default',
  showTranscript = true,
}) {
  const { t, localeMeta } = useLocale()
  const resolvedHint = hint ?? t('common.holdMic')
  const resolvedLabel = label ?? t('common.dictate')
  const pointerIdRef = useRef(null)
  const phaseRef = useRef(PHASE.idle)
  const idleTimerRef = useRef(null)
  const [phase, setPhase] = useState(PHASE.idle)

  const goPhase = (next) => {
    phaseRef.current = next
    setPhase(next)
  }

  const softIdle = (delayMs = 320, { force = false } = {}) => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => {
      if (phaseRef.current === PHASE.listening) return
      if (phaseRef.current === PHASE.processing && !force) return
      if (tts.speaking) {
        goPhase(PHASE.speaking)
        return
      }
      goPhase(PHASE.idle)
    }, delayMs)
  }

  const wrapText = async (text, handler, speakOnClear = false) => {
    if (voiceWantsClear(text)) {
      if (onClear) {
        onClear()
        if (speakOnClear) await tts.speak(t('common.cleared'))
      } else if (speakOnClear) {
        await tts.speak(t('common.nothingToClear'))
      }
      return true
    }
    await Promise.resolve(handler?.(text))
    return false
  }

  const { supported, listening, interim, start, stop } = usePushToTalk({
    lang: localeMeta.speech,
    onResult: async (text) => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      goPhase(PHASE.processing)
      try {
        await wrapText(text, onResult, true)
      } finally {
        await new Promise((r) => setTimeout(r, 160))
        if (tts.speaking) goPhase(PHASE.speaking)
        else softIdle(300, { force: true })
      }
    },
    onEmpty: () => softIdle(320, { force: true }),
    onInterim: (text) => {
      wrapText(text, onInterim, false)
    },
    onError,
  })

  useEffect(() => {
    onListeningChange?.(listening)
  }, [listening, onListeningChange])

  useEffect(() => {
    const unsub = tts.subscribeSpeaking((speaking) => {
      if (speaking) {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
        goPhase(PHASE.speaking)
        return
      }
      if (phaseRef.current === PHASE.speaking || phaseRef.current === PHASE.processing) {
        softIdle(360, { force: true })
      }
    })
    return () => {
      unsub()
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [])

  if (!supported) return null

  const handleDown = (e) => {
    if (disabled) return
    e.preventDefault()
    if (e.button != null && e.button !== 0) return
    pointerIdRef.current = e.pointerId
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* algunos browsers */
    }
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    tts.cancel()
    avatar.happy()
    goPhase(PHASE.listening)
    start()
  }

  const handleUp = (e) => {
    if (pointerIdRef.current != null && e.pointerId !== pointerIdRef.current) return
    pointerIdRef.current = null
    try {
      if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
    } catch {
      /* ok */
    }
    // Escala suave: listening → processing (no cae de golpe a idle)
    if (phaseRef.current === PHASE.listening) goPhase(PHASE.processing)
    stop()
  }

  const showBelow = showTranscript && mode !== 'rut' && interim && phase === PHASE.listening

  const hintText =
    phase === PHASE.listening
      ? t('common.micListening')
      : phase === PHASE.processing
        ? t('common.micProcessing')
        : phase === PHASE.speaking
          ? t('common.micSpeaking')
          : resolvedHint

  const Icon =
    phase === PHASE.listening
      ? ListenIcon
      : phase === PHASE.processing
        ? ProcessIcon
        : phase === PHASE.speaking
          ? SpeakIcon
          : MicIcon

  return (
    <div className={`voice-mic-wrap ${className}`}>
      <button
        type="button"
        className={`voice-mic-btn voice-mic-btn--${phase}`}
        aria-label={resolvedLabel}
        aria-pressed={phase === PHASE.listening}
        disabled={disabled}
        onPointerDown={handleDown}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        onContextMenu={(e) => e.preventDefault()}
        style={{ touchAction: 'none' }}
      >
        <span className={`voice-mic-icon voice-mic-icon--${phase}`} key={phase}>
          <Icon />
        </span>
        {(phase === PHASE.listening || phase === PHASE.speaking) && (
          <span className="voice-mic-ring" aria-hidden="true" />
        )}
      </button>
      <p className={`voice-mic-hint voice-mic-hint--${phase}`}>{hintText}</p>
      {showBelow && <p className="voice-mic-transcript">«{interim}»</p>}
    </div>
  )
}
