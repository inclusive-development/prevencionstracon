import CountryFlag from './CountryFlag'
import { useLocale } from '../i18n/LocaleContext'

/** Selector vertical de idiomas (solo aeropuerto), a la derecha. */
export default function LanguageSwitcher() {
  const { enabled, locale, setLocale, locales } = useLocale()
  if (!enabled) return null

  return (
    <div className="lang-switcher" role="group" aria-label="Language">
      {locales.map((l) => (
        <button
          key={l.id}
          type="button"
          className={`lang-pill ${locale === l.id ? 'active' : ''}`}
          onClick={() => setLocale(l.id)}
          title={l.name}
          aria-label={l.name}
        >
          <CountryFlag code={l.flag} size={22} />
          <span className="lang-pill-label">{l.label}</span>
        </button>
      ))}
    </div>
  )
}
