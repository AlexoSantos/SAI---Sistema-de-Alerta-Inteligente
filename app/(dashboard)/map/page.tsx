'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { 
  Layers, 
  Radio, 
  Flame, 
  Wind, 
  Droplets,
  RefreshCw,
  MapPin,
  Thermometer,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWeatherStore, useUIStore } from '@/lib/store'
import { fetchFireEvents, fetchRadarData } from '@/lib/api'

// Dynamic import for Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false })
const CircleMarker = dynamic(() => import('react-leaflet').then((mod) => mod.CircleMarker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false })
const useMap = dynamic(() => import('react-leaflet').then((mod) => mod.useMap), { ssr: false }) as any

const layerOptions = [
  { id: 'radar', name: 'Radar', icon: Radio, description: 'Precipitação em tempo real' },
  { id: 'temperature', name: 'Temperatura', icon: Thermometer, description: 'Mapa de calor' },
  { id: 'fire', name: 'Incêndios', icon: Flame, description: 'Focos detectados via satélite' },
  { id: 'air_quality', name: 'Qualidade do Ar', icon: Eye, description: 'Índice AQI regional' },
] as const

export default function MapPage() {
  const { currentLocation, fireEvents, setFireEvents, stations } = useWeatherStore()
  const { mapLayer, setMapLayer } = useUIStore()
  const [mounted, setMounted] = useState(false)
  const [radarTime, setRadarTime] = useState<number | null>(null)
  const [radarPath, setRadarPath] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    loadFireData()
    loadRadarData()
  }, [])

  const loadFireData = async () => {
    const fires = await fetchFireEvents(currentLocation.lat, currentLocation.lng, 200)
    setFireEvents(fires)
  }

  const loadRadarData = async () => {
    try {
      const data = await fetchRadarData()
      if (data.radar?.past?.length > 0) {
        const latest = data.radar.past[data.radar.past.length - 1]
        setRadarTime(latest.time)
        setRadarPath(latest.path)
      }
    } catch (error) {
      console.error('Error loading radar data:', error)
    }
  }

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <RefreshCw className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="relative h-screen">
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      {/* Map Container */}
      <MapContainer
        center={[currentLocation.lat, currentLocation.lng]}
        zoom={10}
        className="h-full w-full"
        style={{ background: '#030712' }}
      >
        {/* Base Layer - Dark */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Radar Layer */}
        {mapLayer === 'radar' && radarPath && (
          <TileLayer
            url={`https://tilecache.rainviewer.com${radarPath}/512/{z}/{x}/{y}/6/1_1.png`}
            opacity={0.6}
          />
        )}

        {/* Current Location */}
        <CircleMarker
          center={[currentLocation.lat, currentLocation.lng]}
          radius={12}
          pathOptions={{
            color: '#0ea5e9',
            fillColor: '#0ea5e9',
            fillOpacity: 0.3,
            weight: 2,
          }}
        >
          <Popup>
            <div className="text-foreground">
              <strong>{currentLocation.city}</strong>
              <br />
              {currentLocation.state}
            </div>
          </Popup>
        </CircleMarker>

        {/* Fire Events */}
        {mapLayer === 'fire' && fireEvents.map((fire) => (
          <CircleMarker
            key={fire.id}
            center={[fire.lat, fire.lng]}
            radius={8 + (fire.frp / 10)}
            pathOptions={{
              color: fire.confidence === 'high' ? '#ef4444' : 
                     fire.confidence === 'nominal' ? '#f97316' : '#eab308',
              fillColor: fire.confidence === 'high' ? '#ef4444' : 
                        fire.confidence === 'nominal' ? '#f97316' : '#eab308',
              fillOpacity: 0.6,
              weight: 2,
            }}
          >
            <Popup>
              <div className="min-w-[200px] p-2">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Flame className="size-4 text-orange-500" />
                  Foco de Incêndio
                </div>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <div>Confiança: <span className="capitalize text-foreground">{fire.confidence}</span></div>
                  <div>Brilho: <span className="text-foreground">{fire.brightness.toFixed(1)} K</span></div>
                  <div>FRP: <span className="text-foreground">{fire.frp.toFixed(1)} MW</span></div>
                  <div>Satélite: <span className="text-foreground">{fire.satellite}</span></div>
                  <div>Distância: <span className="text-foreground">{fire.distance?.toFixed(1)} km</span></div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Stations */}
        {stations.map((station) => (
          <CircleMarker
            key={station.id}
            center={[station.lat, station.lng]}
            radius={6}
            pathOptions={{
              color: station.status === 'active' ? '#10b981' : 
                     station.status === 'maintenance' ? '#f59e0b' : '#64748b',
              fillColor: station.status === 'active' ? '#10b981' : 
                        station.status === 'maintenance' ? '#f59e0b' : '#64748b',
              fillOpacity: 0.8,
            }}
          >
            <Popup>
              <div className="min-w-[180px] p-2">
                <div className="font-semibold text-foreground">{station.name}</div>
                <div className="text-xs text-muted-foreground">{station.stationCode}</div>
                <div className="mt-2 text-sm">
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-xs',
                    station.status === 'active' ? 'bg-green-500/20 text-green-500' :
                    station.status === 'maintenance' ? 'bg-yellow-500/20 text-yellow-500' : 
                    'bg-gray-500/20 text-gray-500'
                  )}>
                    {station.status === 'active' ? 'Ativa' :
                     station.status === 'maintenance' ? 'Manutenção' : 'Offline'}
                  </span>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Layer Controls */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute right-4 top-4 z-[1000] w-64 rounded-xl border border-border bg-card/95 p-4 backdrop-blur-xl"
      >
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <Layers className="size-4" />
          Camadas
        </div>
        <div className="space-y-2">
          {layerOptions.map((layer) => (
            <button
              key={layer.id}
              onClick={() => setMapLayer(layer.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all',
                mapLayer === layer.id
                  ? 'bg-primary/10 border border-primary/30'
                  : 'bg-secondary/50 border border-transparent hover:bg-secondary'
              )}
            >
              <layer.icon className={cn(
                'size-5',
                mapLayer === layer.id ? 'text-primary' : 'text-muted-foreground'
              )} />
              <div className="flex-1">
                <div className={cn(
                  'text-sm font-medium',
                  mapLayer === layer.id ? 'text-primary' : 'text-foreground'
                )}>
                  {layer.name}
                </div>
                <div className="text-xs text-muted-foreground">{layer.description}</div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats Overlay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 left-4 z-[1000] flex gap-3"
      >
        <div className="rounded-lg border border-border bg-card/95 px-4 py-2 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {currentLocation.city}, {currentLocation.state}
            </span>
          </div>
        </div>
        
        {mapLayer === 'fire' && (
          <div className="rounded-lg border border-border bg-card/95 px-4 py-2 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <Flame className="size-4 text-orange-500" />
              <span className="text-sm font-medium text-foreground">
                {fireEvents.length} focos
              </span>
            </div>
          </div>
        )}

        {mapLayer === 'radar' && radarTime && (
          <div className="rounded-lg border border-border bg-card/95 px-4 py-2 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <Radio className="size-4 text-blue-500" />
              <span className="text-sm font-medium text-foreground">
                {new Date(radarTime * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Legend */}
      {mapLayer === 'fire' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute bottom-4 right-4 z-[1000] rounded-lg border border-border bg-card/95 p-3 backdrop-blur-xl"
        >
          <div className="mb-2 text-xs font-medium text-muted-foreground">Confiança</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="size-3 rounded-full bg-red-500" />
              <span className="text-foreground">Alta</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="size-3 rounded-full bg-orange-500" />
              <span className="text-foreground">Nominal</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="size-3 rounded-full bg-yellow-500" />
              <span className="text-foreground">Baixa</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
