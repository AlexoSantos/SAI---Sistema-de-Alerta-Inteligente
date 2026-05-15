'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useWeatherStore } from '@/lib/store'

// Dynamic import for Leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
)

export default function MiniMap() {
  const { currentLocation, fireEvents } = useWeatherStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-48 items-center justify-center bg-card text-muted-foreground">
        Carregando mapa...
      </div>
    )
  }

  return (
    <div className="h-48 w-full">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <MapContainer
        center={[currentLocation.lat, currentLocation.lng]}
        zoom={9}
        scrollWheelZoom={false}
        className="h-full w-full rounded-b-xl"
        style={{ background: '#0f172a' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {/* Current location marker */}
        <CircleMarker
          center={[currentLocation.lat, currentLocation.lng]}
          radius={8}
          pathOptions={{
            color: '#0ea5e9',
            fillColor: '#0ea5e9',
            fillOpacity: 0.8,
          }}
        />
        
        {/* Fire event markers */}
        {fireEvents.map((fire) => (
          <CircleMarker
            key={fire.id}
            center={[fire.lat, fire.lng]}
            radius={6}
            pathOptions={{
              color: fire.confidence === 'high' ? '#ef4444' : 
                     fire.confidence === 'nominal' ? '#f97316' : '#eab308',
              fillColor: fire.confidence === 'high' ? '#ef4444' : 
                        fire.confidence === 'nominal' ? '#f97316' : '#eab308',
              fillOpacity: 0.7,
            }}
          />
        ))}
      </MapContainer>
    </div>
  )
}
