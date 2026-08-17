/** Selector compacto Clínica · UANDES · Aeropuerto · Quirohome · Copec · Recepcionista. */
export default function ThemeSwitcher({ tema, onChange }) {
  const opciones = [
    { id: 'clinica', icon: '✚', label: 'Clínica' },
    { id: 'uandes', icon: '🏥', label: 'UANDES' },
    { id: 'aeropuerto', icon: '✈', label: 'Aeropuerto' },
    { id: 'quirohome', icon: '🌿', label: 'Quirohome' },
    { id: 'copec', icon: '⛽', label: 'Copec' },
    { id: 'vertiv', icon: '🏢', label: 'Recepcionista' },
  ]

  return (
    <div className="theme-switcher" role="group" aria-label="Modo del tótem">
      {opciones.map((o) => (
        <button
          key={o.id}
          type="button"
          className={`theme-pill ${tema === o.id ? 'active' : ''}`}
          onClick={() => onChange(o.id)}
        >
          <span className="theme-pill-icon" aria-hidden="true">{o.icon}</span>
          {o.label}
        </button>
      ))}
    </div>
  )
}
