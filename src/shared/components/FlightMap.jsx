import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getCapital, ORIGEN } from '../data/destinos'

function pinHtml(label, kind) {
  return `<span class="map-pin map-pin-${kind}">${label}</span>`
}

function crearMapa(el) {
  const map = L.map(el, {
    zoomControl: false,
    attributionControl: false,
    dragging: true,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
  }).addTo(map)

  return map
}

/** Mapa Leaflet + OpenStreetMap con ruta SCL → destino. */
export default function FlightMap({ pais, destino, compact = false }) {
  const hostRef = useRef(null)
  const mapRef = useRef(null)
  const capaRef = useRef(null)

  useEffect(() => {
    const el = hostRef.current
    if (!el || mapRef.current) return

    const map = crearMapa(el)
    mapRef.current = map
    capaRef.current = L.layerGroup().addTo(map)

    const t = setTimeout(() => map.invalidateSize(), 80)

    return () => {
      clearTimeout(t)
      map.remove()
      mapRef.current = null
      capaRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const capa = capaRef.current
    if (!map || !capa) return

    capa.clearLayers()

    const origen = L.latLng(ORIGEN.lat, ORIGEN.lng)
    const destinoPt = destino?.lat
      ? L.latLng(destino.lat, destino.lng)
      : pais
        ? (() => {
            const cap = getCapital(pais)
            return cap?.lat ? L.latLng(cap.lat, cap.lng) : null
          })()
        : null

    L.marker(origen, {
      icon: L.divIcon({
        className: 'map-pin-wrap',
        html: pinHtml('SCL', 'origin'),
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      }),
    })
      .bindTooltip(`Santiago · ${ORIGEN.codigo}`, { permanent: false, direction: 'top' })
      .addTo(capa)

    if (destinoPt) {
      L.polyline([origen, destinoPt], {
        color: '#1b0088',
        weight: 3,
        opacity: 0.75,
        dashArray: '8 8',
      }).addTo(capa)

      const label = destino?.codigo || getCapital(pais)?.codigo || 'DST'
      L.marker(destinoPt, {
        icon: L.divIcon({
          className: 'map-pin-wrap',
          html: pinHtml(label, 'dest'),
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        }),
      })
        .bindTooltip(
          destino
            ? `${destino.ciudad} · ${destino.codigo}`
            : `${pais?.nombre || ''}`,
          { permanent: false, direction: 'top' },
        )
        .addTo(capa)

      map.fitBounds(L.latLngBounds([origen, destinoPt]).pad(0.35), { animate: false })
    } else {
      map.setView(origen, 2, { animate: false })
    }

    setTimeout(() => map.invalidateSize(), 50)
  }, [pais, destino, compact])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const t = setTimeout(() => map.invalidateSize(), 520)
    return () => clearTimeout(t)
  }, [compact])

  return (
    <div className={`flight-map-wrap ${compact ? 'flight-map-compact' : ''}`}>
      <div ref={hostRef} className="flight-map" />
    </div>
  )
}
