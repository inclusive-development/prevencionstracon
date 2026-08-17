/** Controlador global del avatar Live2D (gestos / expresiones). */

/**
 * Expresiones alegres de Haru:
 * - f04 (F05) = ojos de sonrisa (la más contenta, sin rubor)
 * Evitar f07/F08 y f03/F04: boca/cejas de enojo o seriedad.
 */
export const EXPRESIONES_FELICES = ['f04']

let api = null

function smile() {
  if (!api) return
  api.playExpression('f04')
}

export const avatar = {
  register(next) {
    api = next
    // Al cargar, quedar contenta de una.
    try {
      next.playExpression('f04')
      next.playMotion('Idle', 1)
    } catch {
      /* ok */
    }
  },

  unregister(current) {
    if (!current || api === current) api = null
  },

  /** Saludo amable: gesto Idle + sonrisa. */
  greet() {
    if (!api) return
    const motionIndex = Math.random() < 0.55 ? 1 : 2
    api.playMotion('Idle', motionIndex)
    smile()
  },

  /** Saludo alegre sin gesto brusco de Tap. */
  cheerful() {
    if (!api) return
    api.playMotion('Idle', 2)
    smile()
  },

  /** Aplauso / reacción al tocar. */
  clap() {
    if (!api) return
    api.playMotion('Tap', 0)
    smile()
  },

  /** Reposo contenta (bienvenida / idle). */
  content() {
    if (!api) return
    api.playMotion('Idle', 1)
    smile()
  },

  happy() {
    if (!api) return
    api.playMotion('Idle', 1)
    smile()
  },
}
