import { useCallback, useEffect, useRef, useState } from 'react'
import BackButton from '@shared/components/BackButton'
import StepTransition from '@shared/components/StepTransition'
import { avatar } from '@shared/avatar/controller'
import { formatRut } from '@shared/utils/rut'
import { tts } from '@shared/voice/tts'
import QrCode from '../components/QrCode'
import { EppItemIcon, IconCamera, IconHelmet, IconScan } from '../components/EppIcons'
import { createEppPase, EPP_ITEMS } from '../data/eppSession'

const SCAN_MS = 4500
const REJECT_WAIT_MS = 4500
const INTRO_MAX_MS = 8000

function IconCheck({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function EppFlow({
  trabajador,
  rutEmpresa,
  onFinish,
  onRejected,
  onBack,
  onPhaseChange,
}) {
  const [paso, setPaso] = useState('intro')
  const [camError, setCamError] = useState(null)
  const [camActive, setCamActive] = useState(false)
  const [camReady, setCamReady] = useState(false)
  const [pase, setPase] = useState(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const resultSpokenRef = useRef(false)

  const approved = trabajador?.eppCompleto === true
  const rutLabel = formatRut(trabajador?.rut) || trabajador?.rut

  useEffect(() => {
    onPhaseChange?.(paso)
  }, [paso, onPhaseChange])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setCamActive(false)
    setCamReady(false)
  }, [])

  const attachStreamToVideo = async (stream) => {
    const video = videoRef.current
    if (!video) return false
    video.srcObject = stream
    try {
      await video.play()
      setCamActive(true)
      return true
    } catch {
      return false
    }
  }

  const startCamera = useCallback(async () => {
    setCamError(null)
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      setCamReady(true)
      if (!(await attachStreamToVideo(stream))) {
        await new Promise((r) => requestAnimationFrame(r))
        await attachStreamToVideo(stream)
      }
    } catch {
      setCamError('No se pudo acceder a la cámara. Revisa los permisos del navegador.')
      setCamActive(false)
      setCamReady(false)
    }
  }, [])

  useEffect(() => () => stopCamera(), [stopCamera])

  const irAScan = useCallback(() => {
    setPaso('scan')
  }, [])

  useEffect(() => {
    if (paso !== 'intro') return undefined

    let cancelled = false
    avatar.cheerful()
    startCamera().catch(() => {})

    tts
      .speak(
        'Ahora revisaremos tu EPP. Intenta salir cuerpo completo en la cámara y quédate quieto.',
      )
      .catch(() => {})
      .finally(() => {
        if (!cancelled) irAScan()
      })

    const fallback = window.setTimeout(() => {
      if (!cancelled) irAScan()
    }, INTRO_MAX_MS)

    return () => {
      cancelled = true
      clearTimeout(fallback)
    }
  }, [paso, startCamera, irAScan])

  useEffect(() => {
    if (paso !== 'scan') return undefined

    let cancelled = false
    let scanTimer = null

    const bootScan = async () => {
      for (let i = 0; i < 40 && !videoRef.current; i += 1) {
        await new Promise((r) => requestAnimationFrame(r))
        if (cancelled) return
      }
      if (cancelled) return

      if (!streamRef.current) {
        await startCamera()
      } else if (videoRef.current && !camActive) {
        await attachStreamToVideo(streamRef.current)
      }

      scanTimer = window.setTimeout(() => {
        if (cancelled) return
        stopCamera()
        setPaso('result')
      }, SCAN_MS)
    }

    bootScan()

    return () => {
      cancelled = true
      if (scanTimer) clearTimeout(scanTimer)
    }
  }, [paso, startCamera, stopCamera, camActive])

  useEffect(() => {
    if (paso !== 'scan') stopCamera()
  }, [paso, stopCamera])

  useEffect(() => {
    if (paso !== 'result') return undefined

    let cancelled = false
    let rejectTimer = null

    if (approved) {
      avatar.cheerful()
      setPase(
        createEppPase({
          rutEmpresa,
          rutTrabajador: trabajador.rut,
          nombre: trabajador.nombre,
        }),
      )
      if (!resultSpokenRef.current) {
        resultSpokenRef.current = true
        tts
          .speak('Confirmado. Tienes tu EPP completo. Puedes pasar a faena. Presenta tu código QR en el acceso.')
          .catch(() => {})
      }
    } else {
      if (!resultSpokenRef.current) {
        resultSpokenRef.current = true
        tts
          .speak('Acceso denegado. Te falta un casco. No puedes ingresar.')
          .catch(() => {})
          .finally(() => {
            if (cancelled) return
            rejectTimer = window.setTimeout(() => onRejected?.(), REJECT_WAIT_MS)
          })
      }
    }

    return () => {
      cancelled = true
      if (rejectTimer) clearTimeout(rejectTimer)
    }
  }, [paso, approved, rutEmpresa, trabajador, onRejected])

  return (
    <div className={`screen screen-epp ${paso === 'scan' ? 'screen-epp-scan' : ''}`}>
      {paso === 'intro' && <BackButton onClick={onBack}>← Volver al inicio</BackButton>}

      <StepTransition stepKey={paso} direction="forward">
        {paso === 'intro' && (
          <div className="epp-intro screen-step center">
            <div className="epp-intro-icon-wrap" aria-hidden="true">
              <IconScan className="epp-intro-icon" />
            </div>
            <h1 className="title">Revisión de EPP</h1>
            <p className="subtitle">
              <strong>{trabajador.nombre}</strong> · {rutLabel}
            </p>
            <p className="epp-intro-hint">
              {camReady ? 'Cámara lista. Iniciando revisión…' : 'Permite el acceso a la cámara cuando el navegador lo solicite.'}
            </p>
            <div className="epp-intro-loader">
              <span className="spinner" aria-hidden="true" />
              <span>{camReady ? 'Iniciando revisión' : 'Esperando permiso de cámara…'}</span>
            </div>
            <button type="button" className="btn-primary epp-intro-btn" onClick={irAScan}>
              {camReady ? 'Comenzar revisión' : 'Activar cámara y revisar'}
            </button>
          </div>
        )}

        {paso === 'scan' && (
          <div className="epp-scan">
            <div className="epp-scan-header">
              <span className="epp-scan-header-icon" aria-hidden="true">
                <IconScan />
              </span>
              <div>
                <strong>Analizando EPP</strong>
                <span>
                  {trabajador.nombre} · {rutLabel}
                </span>
              </div>
            </div>

            <div className="epp-scan-stage">
              <div className="epp-scan-frame">
                <video
                  ref={videoRef}
                  className={`epp-scan-video ${camActive ? 'is-active' : ''}`}
                  playsInline
                  muted
                  autoPlay
                />
                {!camActive && !camError && (
                  <div className="epp-scan-loading">
                    <IconCamera className="epp-scan-loading-icon" />
                    <span>Activando cámara…</span>
                    <button type="button" className="btn-secondary epp-cam-retry" onClick={startCamera}>
                      Permitir cámara
                    </button>
                  </div>
                )}
                {camError && (
                  <div className="epp-scan-fallback">
                    <IconCamera className="epp-scan-fallback-icon" />
                    <p>{camError}</p>
                    <button type="button" className="btn-secondary epp-cam-retry" onClick={startCamera}>
                      Reintentar cámara
                    </button>
                  </div>
                )}
                <div className="epp-scan-overlay" aria-hidden="true">
                  <span className="epp-scan-corner epp-scan-corner--tl" />
                  <span className="epp-scan-corner epp-scan-corner--tr" />
                  <span className="epp-scan-corner epp-scan-corner--bl" />
                  <span className="epp-scan-corner epp-scan-corner--br" />
                  <span className="epp-scan-line" />
                </div>
              </div>

              <ul className="epp-scan-checklist">
                {EPP_ITEMS.map((item) => (
                  <li key={item.id} className="epp-scan-check-item" title={item.label}>
                    <EppItemIcon id={item.id} className="epp-scan-check-icon" />
                  </li>
                ))}
              </ul>
              <p className="epp-scan-status">Verificando elementos de protección personal</p>
            </div>
          </div>
        )}

        {paso === 'result' && approved && pase && (
          <div className="epp-result epp-result-access screen-step">
            <div className="epp-result-badge epp-result-badge--ok" aria-hidden="true">
              <IconCheck className="epp-result-check" />
            </div>
            <h1 className="title">EPP completo</h1>
            <p className="subtitle">Tienes tu EPP completo. Puedes pasar a faena.</p>

            <div className="epp-qr-wrap epp-qr-wrap--inline">
              <div className="epp-qr-glow" aria-hidden="true" />
              <QrCode payload={pase.qrPayload} alt={`Pase ${pase.codigo}`} className="epp-qr-img--pop" />
            </div>
            <p className="epp-access-hint">Presenta este QR en el acceso a faena</p>
            <div className="codigo epp-access-code">{pase.codigo}</div>

            <button type="button" className="btn-primary epp-accept-btn" onClick={() => onFinish?.()}>
              Aceptar
            </button>
          </div>
        )}

        {paso === 'result' && !approved && (
          <div className="epp-result screen-step epp-result--fail">
            <div className="epp-result-badge epp-error-badge" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="title">Acceso denegado</h1>
            <p className="subtitle">Te falta un casco. No puedes ingresar a faena.</p>
            <div className="epp-missing">
              <span className="epp-missing-icon-wrap" aria-hidden="true">
                <IconHelmet className="epp-missing-icon" />
              </span>
              <div className="epp-missing-text">
                <strong>Casco de seguridad</strong>
                <span>No detectado</span>
              </div>
            </div>
            <button type="button" className="btn-primary" onClick={() => onRejected?.()}>
              Volver al inicio
            </button>
          </div>
        )}
      </StepTransition>
    </div>
  )
}
