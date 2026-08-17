export const EPP_ITEMS = [
  { id: 'casco', label: 'Casco' },
  { id: 'chaleco', label: 'Chaleco reflectante' },
  { id: 'guantes', label: 'Guantes' },
  { id: 'lentes', label: 'Lentes de seguridad' },
  { id: 'botas', label: 'Botas de seguridad' },
]

export function buildEppQrPayload({ rutEmpresa, rutTrabajador, codigo, fecha, nombre }) {
  return JSON.stringify({
    tipo: 'EPP-PASE',
    rutEmpresa,
    rutTrabajador,
    nombre,
    codigo,
    fecha,
    origen: 'totem-prevencion',
  })
}

export function createEppPase({ rutEmpresa, rutTrabajador, nombre }) {
  const codigo = `EPP-${Date.now().toString(36).toUpperCase().slice(-6)}`
  const fecha = new Date().toISOString()
  return {
    codigo,
    fecha,
    rutEmpresa,
    rutTrabajador,
    nombre,
    qrPayload: buildEppQrPayload({ rutEmpresa, rutTrabajador, codigo, fecha, nombre }),
  }
}
