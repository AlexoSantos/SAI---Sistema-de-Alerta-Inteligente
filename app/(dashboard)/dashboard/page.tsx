'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Gauge, 
  Sun, 
  CloudRain,
  Eye,
  Compass,
  RefreshCw,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Flame,
  Activity,
} from 'lucide-react'
import { cn, getTemperatureColor, getWindDirection, getAQICategory } from '@/lib/utils'
import { fetchCurrentWeather, fetchForecast, fetchAirQuality, fetchFireEvents } from '@/lib/api'
import { useWeatherStore } from '@/lib/store'
import { DEFAULT_LOCATION } from '@/lib/constants'
import WeatherChart from '@/components/weather-chart'
import ForecastCard from '@/components/forecast-card'
import AlertsPanel from '@/components/alerts-panel'
import MiniMap from '@/components/mini-map'

export default function DashboardPage() {
  const { 
    currentWeather, setCurrentWeather,
    dailyForecast, hourlyForecast, setForecast,
    airQuality, setAirQuality,
    fireEvents, setFireEvents,
    currentLocation,
    isLoading, setIsLoading,
    lastUpdated, setLastUpdated,
  } = useWeatherStore()
  
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [weather, forecast, aqi, fires] = await Promise.all([
        fetchCurrentWeather(currentLocation.lat, currentLocation.lng),
        fetchForecast(currentLocation.lat, currentLocation.lng),
        fetchAirQuality(currentLocation.lat, currentLocation.lng),
        fetchFireEvents(currentLocation.lat, currentLocation.lng),
      ])
      
      setCurrentWeather(weather)
      setForecast(forecast.daily, forecast.hourly)
      setAirQuality(aqi)
      setFireEvents(fires)
      setLastUpdated(new Date().toISOString())
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5 * 60 * 1000) // Refresh every 5 minutes
    return () => clearInterval(interval)
  }, [currentLocation])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const aqiInfo = airQuality ? getAQICategory(airQuality.aqi) : null

  return (
    <div className="min-h-screen p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Dashboard</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            <span>{currentLocation.city}, {currentLocation.state}</span>
            {lastUpdated && (
              <>
                <span className="text-border">•</span>
                <Clock className="size-4" />
                <span>Atualizado às {new Date(lastUpdated).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || isLoading}
          className="flex items-center gap-2 rounded-lg bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
        >
          <RefreshCw className={cn('size-4', (refreshing || isLoading) && 'animate-spin')} />
          Atualizar
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
        {/* Current Weather - Large Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-4"
        >
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">Agora</h2>
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Activity className="size-4 text-primary" />
              </div>
            </div>
            
            {currentWeather ? (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <div className={cn('text-5xl font-bold', getTemperatureColor(currentWeather.temperature))}>
                      {Math.round(currentWeather.temperature)}°
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Sensação {Math.round(currentWeather.feelsLike)}°
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-medium text-foreground">
                      {currentWeather.weatherDescription}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Droplets className="size-4 text-blue-400" />
                      Umidade
                    </div>
                    <div className="mt-1 text-lg font-semibold text-foreground">
                      {currentWeather.humidity}%
                    </div>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Wind className="size-4 text-cyan-400" />
                      Vento
                    </div>
                    <div className="mt-1 text-lg font-semibold text-foreground">
                      {Math.round(currentWeather.windSpeed)} km/h
                    </div>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Gauge className="size-4 text-purple-400" />
                      Pressão
                    </div>
                    <div className="mt-1 text-lg font-semibold text-foreground">
                      {Math.round(currentWeather.pressure)} hPa
                    </div>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Sun className="size-4 text-yellow-400" />
                      UV
                    </div>
                    <div className="mt-1 text-lg font-semibold text-foreground">
                      {currentWeather.uvIndex?.toFixed(1) || 'N/A'}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-48 items-center justify-center">
                <RefreshCw className="size-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Air Quality Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4"
        >
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">Qualidade do Ar</h2>
              <div className="flex size-8 items-center justify-center rounded-lg bg-accent/10">
                <Eye className="size-4 text-accent" />
              </div>
            </div>

            {airQuality && aqiInfo ? (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <div className={cn('text-5xl font-bold', aqiInfo.color)}>
                      {airQuality.aqi}
                    </div>
                    <div className={cn('mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium', aqiInfo.bgColor, aqiInfo.color)}>
                      {aqiInfo.label}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {airQuality.dominantPollutant && (
                      <div>Poluente: {airQuality.dominantPollutant}</div>
                    )}
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    { label: 'PM2.5', value: airQuality.pm25, unit: 'µg/m³', max: 35 },
                    { label: 'PM10', value: airQuality.pm10, unit: 'µg/m³', max: 150 },
                    { label: 'O₃', value: airQuality.o3, unit: 'µg/m³', max: 180 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{item.label}</span>
                        <span>{item.value?.toFixed(1) || 'N/A'} {item.unit}</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                          style={{ width: `${Math.min((item.value || 0) / item.max * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-48 items-center justify-center">
                <RefreshCw className="size-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Fire Events Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-4"
        >
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">Focos de Incêndio</h2>
              <div className="flex size-8 items-center justify-center rounded-lg bg-orange-500/10">
                <Flame className="size-4 text-orange-500" />
              </div>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <div className="text-5xl font-bold text-orange-500">
                  {fireEvents.length}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  nas últimas 24h
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Raio: 100km</div>
              </div>
            </div>

            {fireEvents.length > 0 ? (
              <div className="mt-6 space-y-2">
                {fireEvents.slice(0, 3).map((fire) => (
                  <div key={fire.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'size-2 rounded-full',
                        fire.confidence === 'high' ? 'bg-red-500' :
                        fire.confidence === 'nominal' ? 'bg-orange-500' : 'bg-yellow-500'
                      )} />
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {fire.distance?.toFixed(1) || '?'} km
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {fire.satellite}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground capitalize">
                        {fire.confidence}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-lg bg-green-500/10 p-4 text-center">
                <div className="text-sm font-medium text-green-500">Nenhum foco detectado</div>
                <div className="text-xs text-muted-foreground">na região monitorada</div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Forecast Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-8"
        >
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">Previsão 24 Horas</h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="size-4 text-green-500" />
                <span>Temperatura</span>
              </div>
            </div>
            <WeatherChart data={hourlyForecast} />
          </div>
        </motion.div>

        {/* Mini Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-4"
        >
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="p-4">
              <h2 className="text-sm font-medium text-muted-foreground">Radar</h2>
            </div>
            <MiniMap />
          </div>
        </motion.div>

        {/* 7-Day Forecast */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-8"
        >
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4">
              <h2 className="text-sm font-medium text-muted-foreground">Previsão 7 Dias</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {dailyForecast.slice(0, 7).map((day, index) => (
                <ForecastCard key={day.time} forecast={day} isToday={index === 0} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Alerts Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-4"
        >
          <AlertsPanel />
        </motion.div>
      </div>
    </div>
  )
}
