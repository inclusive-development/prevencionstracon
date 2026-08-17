/** Indicador de progreso del flujo. */
export default function Stepper({ paso, pasos = ['Identificación', 'Selección', 'Pago'] }) {
  return (
    <div className="stepper" aria-label={`Paso ${paso + 1} de ${pasos.length}`}>
      {pasos.map((nombre, i) => (
        <div key={nombre} className={`step ${i < paso ? 'done' : ''} ${i === paso ? 'active' : ''}`}>
          <span className="step-dot">{i < paso ? '✓' : i + 1}</span>
          <span className="step-label">{nombre}</span>
        </div>
      ))}
    </div>
  )
}
