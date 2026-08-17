import { useState } from 'react'

/** Bandera local (public/flags) — sin depender de CDN ni emoji del sistema. */

export function codeFromDestinoId(destinoId) {
  return destinoId?.split('-')[0]?.toLowerCase() ?? ''
}

export default function CountryFlag({ code, className = '', size = 32 }) {
  const [failed, setFailed] = useState(false)
  const iso = String(code || '').toLowerCase().slice(0, 2)
  if (!iso) return null

  const w = size
  const h = Math.round(w * 0.67)

  if (failed) {
    return (
      <span
        className={`country-flag country-flag-fallback ${className}`.trim()}
        style={{ width: w, height: h, fontSize: Math.max(10, Math.round(w * 0.28)) }}
        aria-hidden="true"
      >
        {iso.toUpperCase()}
      </span>
    )
  }

  return (
    <span className={`country-flag ${className}`.trim()} aria-hidden="true">
      <img
        src={`/flags/${iso}.png`}
        alt=""
        width={w}
        height={h}
        loading="eager"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </span>
  )
}
