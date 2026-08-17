import StraconLogo from './StraconLogo'

export default function EppSplash({ phase = 'in' }) {
  return (
    <div
      className={`theme-splash theme-splash--epp theme-splash--stracon ${phase === 'out' ? 'theme-splash--out' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Cargando Stracon"
    >
      <div className="theme-splash-inner">
        <StraconLogo variant="dark" className="epp-splash-logo" />
        <span className="theme-splash-spinner spinner" aria-hidden="true" />
      </div>
    </div>
  )
}
