/** Envuelve una pantalla con animación de entrada según dirección de navegación. */
export default function ScreenTransition({ direction = 'forward', screenKey, children }) {
  const dirClass =
    direction === 'from-welcome'
      ? 'screen-transition--from-welcome'
      : `screen-transition--${direction}`

  return (
    <div key={screenKey} className={`screen-transition ${dirClass}`}>
      {children}
    </div>
  )
}
