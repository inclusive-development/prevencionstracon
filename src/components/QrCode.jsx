import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export default function QrCode({ payload, alt = 'Código QR', className = '' }) {
  const [src, setSrc] = useState('')

  useEffect(() => {
    let alive = true
    QRCode.toDataURL(payload, {
      margin: 2,
      width: 260,
      color: { dark: '#0f172a', light: '#ffffff' },
    })
      .then((url) => {
        if (alive) setSrc(url)
      })
      .catch(() => {
        if (alive) setSrc('')
      })
    return () => {
      alive = false
    }
  }, [payload])

  if (!src) {
    return <div className={`epp-qr-skeleton ${className}`} aria-hidden="true" />
  }

  return <img src={src} alt={alt} className={`epp-qr-img ${className}`} />
}
