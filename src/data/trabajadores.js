import { cleanRut } from '@shared/utils/rut'

/** Documentación estándar de acreditación a faena. */
export const DOCUMENTOS_ACREDITACION = [
  { id: 'cedula', label: 'Cédula de identidad' },
  { id: 'os10', label: 'Certificado curso OS-10' },
  { id: 'prog-prev', label: 'Capacitación programa preventivo' },
  { id: 'prev-riesgos', label: 'Capacitación prevención de riesgos' },
  { id: 'descriptor', label: 'Descriptor de cargo firmado' },
  { id: 'reglamento', label: 'Entrega reglamento interno' },
  { id: 'epp-entrega', label: 'Entrega elementos de protección personal' },
]

function docsFromStatus(statusMap) {
  return DOCUMENTOS_ACREDITACION.map((doc) => ({
    ...doc,
    ok: statusMap[doc.id] !== false,
  }))
}

const DOCS_OK = Object.fromEntries(DOCUMENTOS_ACREDITACION.map((d) => [d.id, true]))

/**
 * Mock de trabajadores Stracon.
 * Rut sin puntos ni guión (solo dígitos + DV).
 */
export const TRABAJADORES = [
  {
    rut: '248277963',
    nombre: 'Tanya Medina',
    cargo: 'Operadora de faena',
    acreditado: true,
    eppCompleto: true,
    documentos: docsFromStatus(DOCS_OK),
  },
  {
    rut: '123456785',
    nombre: 'María González',
    cargo: 'Supervisora de turno',
    acreditado: false,
    eppCompleto: false,
    documentos: docsFromStatus({
      ...DOCS_OK,
      'prog-prev': false,
      'prev-riesgos': false,
      reglamento: false,
    }),
    motivo: 'Documentación incompleta para ingreso a faena',
  },
]

export function findTrabajador(rut) {
  const clean = cleanRut(rut)
  return TRABAJADORES.find((t) => t.rut === clean) || null
}

export function getDocumentosFaltantes(trabajador) {
  if (!trabajador?.documentos) return []
  return trabajador.documentos.filter((d) => !d.ok)
}

export function countDocumentosOk(trabajador) {
  if (!trabajador?.documentos) return { ok: 0, total: 0 }
  const total = trabajador.documentos.length
  const ok = trabajador.documentos.filter((d) => d.ok).length
  return { ok, total }
}
