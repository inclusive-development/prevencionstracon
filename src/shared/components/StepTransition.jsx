/** Transición entre pasos dentro de un mismo flujo (volver / avanzar). */
export default function StepTransition({ direction = 'forward', stepKey, children, className = '' }) {
  return (
    <div
      key={stepKey}
      className={`screen-step screen-step--${direction} ${className}`.trim()}
    >
      {children}
    </div>
  )
}
