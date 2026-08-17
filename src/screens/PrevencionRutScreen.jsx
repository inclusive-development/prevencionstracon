import { useEffect, useRef, useState } from 'react'
import Keypad from '@shared/components/Keypad'
import VoiceMicButton from '@shared/components/VoiceMicButton'
import { cleanRut, formatRut, validateRut } from '@shared/utils/rut'
import { parseSpokenRut } from '@shared/utils/voiceParse'
import { tts } from '@shared/voice/tts'
import BackButton from '@shared/components/BackButton'

const COPY = {
  empresa: {
    title: 'RUT de la empresa',
    prompt: 'Ingresa el RUT de la empresa contratista para continuar.',
    error: 'El RUT de la empresa es incorrecto.',
    ayuda: 'Revisa el número y el dígito verificador. El guion se agrega solo.',
    errorUi: 'RUT incorrecto. Verifica el dígito verificador.',
    dictate: 'Dictar RUT',
    hint: 'Mantén presionado el micrófono y dicta el RUT',
  },
  trabajador: {
    title: 'RUT del trabajador',
    prompt: 'Ingresa tu RUT de trabajador para verificar acreditación.',
    error: 'El RUT del trabajador es incorrecto.',
    ayuda: 'Revisa el número y el dígito verificador. El guion se agrega solo.',
    errorUi: 'RUT incorrecto. Verifica el dígito verificador.',
    dictate: 'Dictar RUT',
    hint: 'Mantén presionado el micrófono y dicta tu RUT',
  },
}

const AUTO_SUBMIT_MS = 2500

export default function PrevencionRutScreen({
  variant = 'empresa',
  onValid,
  onBack,
  allowedRuts = null,
}) {
  const c = COPY[variant] || COPY.empresa
  const [rut, setRut] = useState('')
  const [error, setError] = useState(false)
  const [dictando, setDictando] = useState(false)
  const helpTimer = useRef(null)
  const autoSubmitTimer = useRef(null)
  const rutRef = useRef('')

  useEffect(() => {
    rutRef.current = rut
  }, [rut])

  useEffect(() => {
    tts.speak(c.prompt)
    return () => {
      clearTimeout(helpTimer.current)
      clearTimeout(autoSubmitTimer.current)
    }
  }, [variant, c.prompt])

  const pressKey = (k) => {
    setError(false)
    setRut((r) => cleanRut(r + k))
  }

  const submit = () => {
    clearTimeout(helpTimer.current)
    clearTimeout(autoSubmitTimer.current)
    const current = rutRef.current
    if (validateRut(current)) {
      if (allowedRuts && !allowedRuts.includes(current)) {
        setError(true)
        tts.speak(
          variant === 'empresa'
            ? 'El RUT de la empresa no está habilitado para ingresar a faena.'
            : c.error,
        )
        helpTimer.current = setTimeout(() => tts.speak(c.ayuda), 3000)
        return
      }
      setError(false)
      onValid(current)
    } else {
      setError(true)
      tts.speak(c.error)
      helpTimer.current = setTimeout(() => tts.speak(c.ayuda), 3000)
    }
  }

  const scheduleAutoSubmit = (parsed) => {
    clearTimeout(autoSubmitTimer.current)
    if (!validateRut(parsed)) return
    autoSubmitTimer.current = setTimeout(() => {
      if (validateRut(rutRef.current)) submit()
    }, AUTO_SUBMIT_MS)
  }

  const applyVoiceRut = (text) => {
    const parsed = parseSpokenRut(text)
    if (parsed.length < 1) return
    setError(false)
    setRut(parsed)
    rutRef.current = parsed
    return parsed
  }

  return (
    <div className="screen screen-rut screen-prevencion-rut">
      {onBack && <BackButton onClick={onBack}>← Volver al inicio</BackButton>}
      <h1 className="title">{c.title}</h1>

      <div
        className={`rut-display ${error ? 'rut-error shake' : ''} ${rut ? '' : 'rut-empty'} ${dictando ? 'rut-dictando' : ''}`}
      >
        {rut ? formatRut(rut) : '12.345.678-9'}
      </div>
      {error && <div className="error-text">{c.errorUi}</div>}

      <Keypad
        compact
        onKey={pressKey}
        onDelete={() => {
          setError(false)
          clearTimeout(autoSubmitTimer.current)
          setRut((r) => r.slice(0, -1))
        }}
        onClear={() => {
          clearTimeout(autoSubmitTimer.current)
          setRut('')
        }}
      />

      <VoiceMicButton
        className="voice-mic-dock"
        mode="rut"
        showTranscript={false}
        label={c.dictate}
        hint={c.hint}
        onClear={() => {
          clearTimeout(autoSubmitTimer.current)
          setError(false)
          setRut('')
          rutRef.current = ''
        }}
        onInterim={(text) => applyVoiceRut(text)}
        onResult={(text) => {
          const parsed = applyVoiceRut(text)
          if (!parsed || parsed.length < 2) return
          if (validateRut(parsed)) scheduleAutoSubmit(parsed)
        }}
        onListeningChange={setDictando}
      />

      <button type="button" className="btn-primary" disabled={rut.length < 8} onClick={submit}>
        Continuar
      </button>
    </div>
  )
}
