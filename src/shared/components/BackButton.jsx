/** Botón volver fijo arriba del panel (evita solaparse con el selector de tema). */
export default function BackButton({ onClick, children = '← Volver' }) {
  return (
    <button type="button" className="btn-back-top" onClick={onClick}>
      {children}
    </button>
  )
}
