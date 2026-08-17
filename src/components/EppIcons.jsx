/** Iconos SVG para ítems de EPP (sin emojis). */

export function IconHelmet({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 14v2a8 8 0 0 0 16 0v-2" strokeLinecap="round" />
      <path d="M12 4a6 6 0 0 0-6 6v4h12v-4a6 6 0 0 0-6-6Z" strokeLinejoin="round" />
      <path d="M8 14h8" strokeLinecap="round" />
    </svg>
  )
}

export function IconVest({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M8 3 6 7v14h12V7l-2-4H8Z" strokeLinejoin="round" />
      <path d="M6 7h12M9 11h6M9 15h6" strokeLinecap="round" />
      <path d="M12 3v4" strokeLinecap="round" />
    </svg>
  )
}

export function IconGloves({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M7 11V7a2 2 0 0 1 4 0v4" strokeLinecap="round" />
      <path d="M11 11V6a2 2 0 0 1 4 0v5" strokeLinecap="round" />
      <path d="M15 11V8a2 2 0 0 1 3 1v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-6a2 2 0 0 1 3-1v4" strokeLinejoin="round" />
    </svg>
  )
}

export function IconGlasses({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="7" cy="14" r="3" />
      <circle cx="17" cy="14" r="3" />
      <path d="M10 14h4M4 14h0M20 14h0" strokeLinecap="round" />
      <path d="M7 11V9a2 2 0 0 1 4 0v2M13 11V9a2 2 0 0 1 4 0v2" strokeLinecap="round" />
    </svg>
  )
}

export function IconBoots({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M6 10V6a2 2 0 0 1 2-2h1v12H6a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Z" strokeLinejoin="round" />
      <path d="M15 4h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1V4Z" strokeLinejoin="round" />
      <path d="M4 20h16" strokeLinecap="round" />
    </svg>
  )
}

export function IconCamera({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 8h4l2-2h4l2 2h4v10H4V8Z" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}

export function IconScan({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 7V5a1 1 0 0 1 1-1h2M20 7V5a1 1 0 0 0-1-1h-2M4 17v2a1 1 0 0 0 1 1h2M20 17v2a1 1 0 0 1-1 1h-2" strokeLinecap="round" />
      <path d="M7 12h10" strokeLinecap="round" />
    </svg>
  )
}

const ICON_MAP = {
  casco: IconHelmet,
  chaleco: IconVest,
  guantes: IconGloves,
  lentes: IconGlasses,
  botas: IconBoots,
}

export function EppItemIcon({ id, className = '' }) {
  const Icon = ICON_MAP[id]
  if (!Icon) return null
  return <Icon className={className} />
}
