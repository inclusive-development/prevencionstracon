/** Configuración Stracon — tótem prevención faena. */
export const TENANT = {
  id: 'stracon',
  name: 'Stracon',
  welcomeMsg:
    'Bienvenidos a Stracon. Si quieres ingresar a la faena, presiona el botón.',
  splashLabel: 'Stracon',
  /** RUT empresa habilitado (sin puntos ni guión). */
  empresaRuts: ['764854918'],
}

export const EMPRESA_RUT_FORMATTED = '76.485.491-8'

export function isEmpresaRutAllowed(rutClean) {
  return TENANT.empresaRuts.includes(rutClean)
}
