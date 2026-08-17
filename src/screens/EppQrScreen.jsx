import { useEffect } from 'react'
import QrCode from '../components/QrCode'
import { formatRut } from '@shared/utils/rut'
import { tts } from '@shared/voice/tts'

export default function EppQrScreen({ pase, onFinish }) {
  const rutTrabajador = formatRut(pase.rutTrabajador) || pase.rutTrabajador
  const rutEmpresa = formatRut(pase.rutEmpresa) || pase.rutEmpresa

  useEffect(() => {
    tts.speak(
      `${pase.nombre}, tu pase de ingreso está listo. Código ${pase.codigo.split('').join(' ')}. Presenta el código QR en el acceso.`,
    )
    const t = window.setTimeout(onFinish, 16000)
    return () => clearTimeout(t)
  }, [pase.codigo, pase.nombre, onFinish])

  return (
    <div className="screen screen-epp-qr epp-result epp-result--ok">
      <div className="success-badge epp-result-badge--ok" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path
            d="m5 12.5 4.5 4.5L19 7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h1 className="title">Pase de ingreso</h1>
      <p className="subtitle">Presenta este código QR en el acceso a faena</p>

      <div className="epp-qr-wrap">
        <div className="epp-qr-glow" aria-hidden="true" />
        <QrCode payload={pase.qrPayload} alt={`Pase EPP ${pase.codigo}`} className="epp-qr-img--pop" />
      </div>

      <div className="codigo">{pase.codigo}</div>

      <div className="resumen">
        <div className="resumen-row">
          <span>Trabajador</span>
          <strong>{pase.nombre}</strong>
        </div>
        <div className="resumen-row">
          <span>RUT trabajador</span>
          <strong>{rutTrabajador}</strong>
        </div>
        <div className="resumen-row">
          <span>Empresa</span>
          <strong>{rutEmpresa}</strong>
        </div>
        <div className="resumen-row">
          <span>Estado</span>
          <strong className="epp-status-ok">Acreditado · EPP completo</strong>
        </div>
        <div className="resumen-row">
          <span>Válido</span>
          <strong>{new Date(pase.fecha).toLocaleString('es-CL')}</strong>
        </div>
      </div>

      <button type="button" className="btn-primary" onClick={onFinish}>
        Finalizar
      </button>
    </div>
  )
}
