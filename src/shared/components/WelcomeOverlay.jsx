import VoiceMicButton from './VoiceMicButton'

const ICONS = {
  plane: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M2.5 19l19-7-7-2-2-7-7 19Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M12 12v7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  ticket: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 7h18v12H3zM7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path d="M12 11v4M10 13h4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 2v3M16 2v3M3.5 9h17M5 4.5h14a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19V6A1.5 1.5 0 0 1 5 4.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M12 11.5v5M9.5 14h5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  list: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="4" cy="6" r="1.2" fill="currentColor" />
      <circle cx="4" cy="12" r="1.2" fill="currentColor" />
      <circle cx="4" cy="18" r="1.2" fill="currentColor" />
    </svg>
  ),
  fuel: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4.5 20.5V6.8A2.3 2.3 0 0 1 6.8 4.5h6.4A2.3 2.3 0 0 1 15.5 6.8v13.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M4.5 20.5h11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M15.5 9.5h1.8a2 2 0 0 1 2 2V17a1.5 1.5 0 0 0 3 0V9.2l-2.2-2.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7.5 8.5h5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M16 11a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 16 11ZM8 12.5A3 3 0 1 0 8 6.5a3 3 0 0 0 0 6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
      />
      <path
        d="M3.5 19.5c.4-2.8 2.5-4.5 4.5-4.5s4.1 1.7 4.5 4.5M12.8 15.2c1.1-.7 2.5-1.1 4-1.1 2.4 0 4.7 1.5 5.2 4.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M13 2 4 14h7l-1 8 10-14h-7l1-6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  tooth: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 3.5c1.2 0 2 .7 4 .7s2.8-.7 4-.7c2.2 0 3.5 1.8 3.5 4 0 2.6-1.2 4.2-2 6.2-.6 1.5-.8 2.8-1.2 4.6-.3 1.4-1.2 2.2-2.3 2.2-1.1 0-1.7-.9-2-1.8-.3.9-.9 1.8-2 1.8-1.1 0-2-.8-2.3-2.2-.4-1.8-.6-3.1-1.2-4.6-.8-2-2-3.6-2-6.2 0-2.2 1.3-4 3.5-4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  flask: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M9 3h6M10 3v5.2L5.2 18a2.4 2.4 0 0 0 2.1 3.5h9.4a2.4 2.4 0 0 0 2.1-3.5L14 8.2V3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8.2 14h7.6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  scan: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M8 12h8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  procedure: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3v18M8 7h8M7 12h10M8 17h8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  ),
  syringe: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m18.5 3.5 2 2M14 6l4 4M4.5 19.5l7.2-7.2M9.2 10.8l4 4M16.5 8.5l-2-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3.5 20.5 8 16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  video: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3.5 7.5h11A1.5 1.5 0 0 1 16 9v6a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 2 15V9a1.5 1.5 0 0 1 1.5-1.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path d="m16 10 5-2.5v9L16 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  ),
  cross: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3Z" fill="currentColor" />
    </svg>
  ),
  home: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  blood: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3.5c0 0-6.5 7-6.5 11.2A6.5 6.5 0 0 0 12 21a6.5 6.5 0 0 0 6.5-6.3C18.5 10.5 12 3.5 12 3.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  ),
}

function FloatingBtn({ opt, index, onSelect }) {
  return (
    <div className="floating-action-wrap" style={{ '--float-i': index }} data-action={opt.id}>
      <button
        type="button"
        className={`floating-action-btn ${opt.id === 'teleurgencia' ? 'floating-action-btn--urgency' : ''}`}
        onClick={() => onSelect(opt.id)}
      >
        <span className="floating-action-shimmer" aria-hidden="true" />
        <span className={`floating-action-icon ${opt.id === 'teleurgencia' ? 'floating-action-icon--urgency' : ''}`}>
          {ICONS[opt.icon] || ICONS.list}
        </span>
        <span className="floating-action-text">
          <span className="floating-action-label">{opt.label}</span>
          {opt.sub && <span className="floating-action-sub">{opt.sub}</span>}
        </span>
      </button>
    </div>
  )
}

/**
 * Bienvenida: mic desde el inicio; botones de acción tras el TTS.
 */
export default function WelcomeOverlay({
  visible,
  showButtons = true,
  options,
  onSelect,
  onVoice,
  micHint = 'Di hola o elige una opción',
}) {
  if (!visible) return null
  if (!showButtons && !onVoice) return null

  return (
    <div className="welcome-overlay welcome-overlay--visible" role="group" aria-label="Opciones de bienvenida">
      <div className="welcome-overlay-fx" aria-hidden="true">
        <span className="welcome-orb welcome-orb--a" />
        <span className="welcome-orb welcome-orb--b" />
      </div>
      {showButtons && options?.length > 0 && (
        <div className="welcome-overlay-row">
          {options.map((opt, i) => (
            <FloatingBtn key={opt.id} opt={opt} index={i} onSelect={onSelect} />
          ))}
        </div>
      )}
      {onVoice && (
        <VoiceMicButton
          className={`welcome-mic ${showButtons ? '' : 'welcome-mic--solo'}`.trim()}
          hint={micHint}
          label="Saludar o elegir"
          onResult={onVoice}
        />
      )}
    </div>
  )
}
