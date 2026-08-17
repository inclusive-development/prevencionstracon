import latamLogo from '../assets/latam.png'
import quirohomeLogo from '../assets/quirohome.webp'
import copecLogo from '../assets/copec.jpg'
import uandesLogo from '../assets/clinica.svg'
import vertivLogo from '../assets/vertiv.png'
import { getTema } from '../data/temas'

export default function ThemeSplash({ temaId, phase = 'in' }) {
  const tema = getTema(temaId)

  return (
    <div
      className={`theme-splash theme-splash--${temaId} ${phase === 'out' ? 'theme-splash--out' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={`Cargando ${tema.brand}`}
    >
      <div className="theme-splash-inner">
        {temaId === 'aeropuerto' && (
          <img src={latamLogo} alt="LATAM Airlines" className="theme-splash-logo theme-splash-logo-latam" />
        )}
        {temaId === 'quirohome' && (
          <img src={quirohomeLogo} alt="Quirohome" className="theme-splash-logo theme-splash-logo-quirohome" />
        )}
        {temaId === 'copec' && (
          <img src={copecLogo} alt="Copec" className="theme-splash-logo theme-splash-logo-copec" />
        )}
        {temaId === 'uandes' && (
          <img src={uandesLogo} alt="Clínica UANDES" className="theme-splash-logo theme-splash-logo-uandes" />
        )}
        {temaId === 'vertiv' && (
          <img src={vertivLogo} alt="Vertiv" className="theme-splash-logo theme-splash-logo-vertiv" />
        )}
        {temaId === 'clinica' && (
          <div className="theme-splash-clinica">
            <svg className="theme-splash-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 21s-7.5-4.6-9.5-9A5.4 5.4 0 0 1 12 6.3 5.4 5.4 0 0 1 21.5 12c-2 4.4-9.5 9-9.5 9Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M7.5 12h2.4l1.2-2.4 1.8 4.4 1.2-2h2.4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="theme-splash-brand">{tema.brand}</span>
          </div>
        )}
        <span className="theme-splash-spinner spinner" aria-hidden="true" />
      </div>
    </div>
  )
}
