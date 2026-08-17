import { useEffect, useRef, useState } from 'react'
import { avatar } from '@shared/avatar/controller'
import { formatRut } from '@shared/utils/rut'
import { tts } from '@shared/voice/tts'
import { findTrabajador } from '../data/trabajadores'

const CHECK_MS = 2800
const RESULT_WAIT_MS = 2200
const AUTO_CONTINUE_MS = 9000

function IconDoc({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M8 4h8l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" strokeLinejoin="round" />
      <path d="M16 4v4h4M9 13h6M9 17h4" strokeLinecap="round" />
    </svg>
  )
}

function IconCheck({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconX({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  )
}

export default function AcreditacionScreen({
  rutEmpresa,
  rutTrabajador,
  onAprobado,
  onRechazado,
  onBack,
  onPhaseChange,
}) {
  const [fase, setFase] = useState('checking')
  const continuedRef = useRef(false)
  const trabajador = findTrabajador(rutTrabajador)
  const acreditado = trabajador?.acreditado === true
  const rutLabel = formatRut(rutTrabajador) || rutTrabajador
  const empresaLabel = formatRut(rutEmpresa) || rutEmpresa

  useEffect(() => {
    onPhaseChange?.(fase)
  }, [fase, onPhaseChange])

  const continuarEpp = (t) => {
    if (continuedRef.current) return
    continuedRef.current = true
    onAprobado?.(t)
  }

  useEffect(() => {
    let cancelled = false
    const t = window.setTimeout(() => {
      if (!cancelled) setFase('result')
    }, CHECK_MS)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    if (fase !== 'result') return undefined

    let cancelled = false
    let waitTimer = null
    let fallbackTimer = null

    const scheduleContinue = (fn, delay = RESULT_WAIT_MS) => {
      waitTimer = window.setTimeout(() => {
        if (!cancelled) fn()
      }, delay)
    }

    if (!trabajador) {
      tts
        .speak('Trabajador no registrado. No puedes ingresar a faena.')
        .catch(() => {})
        .finally(() => scheduleContinue(() => onRechazado?.()))
      fallbackTimer = window.setTimeout(() => {
        if (!cancelled) onRechazado?.()
      }, AUTO_CONTINUE_MS)
    } else if (acreditado) {
      avatar.cheerful()
      tts
        .speak(
          `${trabajador.nombre}, estás acreditado. Documentación al día. A continuación revisaremos tu EPP.`,
        )
        .catch(() => {})
        .finally(() => scheduleContinue(() => continuarEpp(trabajador)))
      fallbackTimer = window.setTimeout(() => {
        if (!cancelled) continuarEpp(trabajador)
      }, AUTO_CONTINUE_MS)
    } else {
      tts
        .speak(
          `${trabajador.nombre}, no estás acreditado. Tu documentación está incompleta. No puedes ingresar a faena.`,
        )
        .catch(() => {})
        .finally(() => scheduleContinue(() => onRechazado?.()))
      fallbackTimer = window.setTimeout(() => {
        if (!cancelled) onRechazado?.()
      }, AUTO_CONTINUE_MS)
    }

    return () => {
      cancelled = true
      if (waitTimer) clearTimeout(waitTimer)
      if (fallbackTimer) clearTimeout(fallbackTimer)
    }
  }, [fase, trabajador, acreditado, onRechazado])

  useEffect(() => {
    if (fase === 'result' && acreditado && trabajador) {
      avatar.happy()
    }
  }, [fase, acreditado, trabajador])

  if (fase === 'checking') {
    return (
      <div className="screen screen-acreditacion center">
        <div className="acr-check-card">
          <div className="acr-check-icon-wrap" aria-hidden="true">
            <IconDoc className="acr-check-icon" />
            <span className="acr-check-spinner spinner" />
          </div>
          <h1 className="title">Verificando acreditación</h1>
          <p className="subtitle">Consultando documentación del trabajador</p>
          <div className="acr-check-meta">
            <div>
              <span>Empresa</span>
              <strong>{empresaLabel}</strong>
            </div>
            <div>
              <span>Trabajador</span>
              <strong>{rutLabel}</strong>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!trabajador) {
    return (
      <div className="screen screen-acreditacion acr-result acr-result--soft">
        <div className="acr-soft">
          <header className="acr-soft-hero acr-soft-hero--fail">
            <div className="acr-soft-avatar acr-soft-avatar--fail" aria-hidden="true">
              <IconX />
            </div>
            <div className="acr-soft-hero-text">
              <span className="acr-soft-kicker acr-soft-kicker--fail">Sin registro</span>
              <h1 className="acr-soft-name">Trabajador no registrado</h1>
              <p className="acr-soft-meta">RUT {rutLabel}</p>
            </div>
          </header>
          <p className="acr-soft-fail-msg">
            El RUT ingresado no figura en el sistema de acreditación.
          </p>
          <footer className="acr-soft-foot">
            <button type="button" className="btn-primary acr-soft-btn" onClick={onBack}>
              Volver al inicio
            </button>
          </footer>
        </div>
      </div>
    )
  }

  if (acreditado) {
    return (
      <div className="screen screen-acreditacion acr-result acr-result--soft">
        <div className="acr-soft">
          <header className="acr-soft-hero">
            <div className="acr-soft-avatar" aria-hidden="true">
              <IconCheck />
            </div>
            <div className="acr-soft-hero-text">
              <span className="acr-soft-kicker">Acreditación vigente</span>
              <h1 className="acr-soft-name">{trabajador.nombre}</h1>
              <p className="acr-soft-meta">
                {trabajador.cargo}
                <span className="acr-soft-dot" aria-hidden="true" />
                {rutLabel}
              </p>
            </div>
          </header>

          <section className="acr-soft-section">
            <h2 className="acr-soft-section-title">Documentación</h2>
            <ul className="acr-soft-list">
              {trabajador.documentos.map((doc, i) => (
                <li key={doc.id} className={`acr-soft-item acr-soft-item--tone-${(i % 4) + 1}`}>
                  <span className="acr-soft-item-icon" aria-hidden="true">
                    <IconCheck />
                  </span>
                  <span className="acr-soft-item-label">{doc.label}</span>
                  <span className="acr-soft-item-status">OK</span>
                </li>
              ))}
            </ul>
          </section>

          <footer className="acr-soft-foot">
            <p className="acr-soft-foot-note">Siguiente paso: revisión de EPP</p>
            <button
              type="button"
              className="btn-primary acr-soft-btn"
              onClick={() => continuarEpp(trabajador)}
            >
              Revisar EPP con cámara
            </button>
          </footer>
        </div>
      </div>
    )
  }

  return (
    <div className="screen screen-acreditacion acr-result acr-result--fail acr-result--soft-fail">
      <div className="acr-soft">
        <header className="acr-soft-hero acr-soft-hero--fail">
          <div className="acr-soft-avatar acr-soft-avatar--fail" aria-hidden="true">
            <IconX />
          </div>
          <div className="acr-soft-hero-text">
            <span className="acr-soft-kicker acr-soft-kicker--fail">No acreditado</span>
            <h1 className="acr-soft-name">{trabajador.nombre}</h1>
            <p className="acr-soft-meta">
              {trabajador.cargo}
              <span className="acr-soft-dot" aria-hidden="true" />
              {rutLabel}
            </p>
          </div>
        </header>

        <p className="acr-soft-fail-msg">{trabajador.motivo || 'Documentación incompleta'}</p>

        <section className="acr-soft-section">
          <h2 className="acr-soft-section-title">Documentación</h2>
          <ul className="acr-soft-list">
            {trabajador.documentos.map((doc, i) => (
              <li
                key={doc.id}
                className={`acr-soft-item ${doc.ok ? `acr-soft-item--tone-${(i % 4) + 1}` : 'acr-soft-item--pending'}`}
              >
                <span className="acr-soft-item-icon" aria-hidden="true">
                  {doc.ok ? <IconCheck /> : <IconX />}
                </span>
                <span className="acr-soft-item-label">{doc.label}</span>
                <span className={`acr-soft-item-status ${doc.ok ? '' : 'acr-soft-item-status--pending'}`}>
                  {doc.ok ? 'OK' : 'Pendiente'}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <footer className="acr-soft-foot">
          <button type="button" className="btn-primary acr-soft-btn" onClick={onBack}>
            Volver al inicio
          </button>
        </footer>
      </div>
    </div>
  )
}
