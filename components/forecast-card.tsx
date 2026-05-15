'use client'

import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  Snowflake,
  CloudSun,
} from 'lucide-react'
import { cn, getTemperatureColor } from '@/lib/utils'
import type { ForecastData } from '@/lib/types'

interface ForecastCardProps {
  forecast: ForecastData
  isToday?: boolean
}

function getWeatherIcon(code: number) {
  if (code === 0 || code === 1) return Sun
  if (code === 2) return CloudSun
  if (code === 3) return Cloud
  if (code === 45 || code === 48) return CloudFog
  if (code >= 51 && code <= 55) return CloudDrizzle
  if (code >= 61 && code <= 67) return CloudRain
  if (code >= 71 && code <= 77) return CloudSnow
  if (code >= 80 && code <= 82) return CloudRain
  if (code >= 85 && code <= 86) return Snowflake
  if (code >= 95) return CloudLightning
  return Cloud
}

function getWeatherIconColor(code: number): string {
  if (code === 0 || code === 1) return 'text-yellow-400'
  if (code === 2) return 'text-yellow-300'
  if (code === 3) return 'text-gray-400'
  if (code === 45 || code === 48) return 'text-gray-500'
  if (code >= 51 && code <= 55) return 'text-blue-300'
  if (code >= 61 && code <= 67) return 'text-blue-400'
  if (code >= 71 && code <= 77) return 'text-blue-200'
  if (code >= 80 && code <= 82) return 'text-blue-500'
  if (code >= 85 && code <= 86) return 'text-blue-200'
  if (code >= 95) return 'text-purple-400'
  return 'text-gray-400'
}

export default function ForecastCard({ forecast, isToday }: ForecastCardProps) {
  const WeatherIcon = getWeatherIcon(forecast.weatherCode)
  const iconColor = getWeatherIconColor(forecast.weatherCode)
  
  const dayName = isToday 
    ? 'Hoje' 
    : new Date(forecast.time).toLocaleDateString('pt-BR', { weekday: 'short' })

  return (
    <div className={cn(
      'flex flex-col items-center rounded-lg p-3 transition-all',
      isToday 
        ? 'bg-primary/10 border border-primary/20' 
        : 'bg-secondary/50 hover:bg-secondary'
    )}>
      <span className={cn(
        'text-xs font-medium capitalize',
        isToday ? 'text-primary' : 'text-muted-foreground'
      )}>
        {dayName}
      </span>
      
      <div className={cn('my-2', iconColor)}>
        <WeatherIcon className="size-8" />
      </div>
      
      <div className="flex items-center gap-1">
        <span className={cn('text-sm font-semibold', getTemperatureColor(forecast.temperatureMax))}>
          {Math.round(forecast.temperatureMax)}°
        </span>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs text-muted-foreground">
          {Math.round(forecast.temperatureMin)}°
        </span>
      </div>
      
      {forecast.precipitationProbability > 0 && (
        <div className="mt-1 flex items-center gap-1 text-xs text-blue-400">
          <CloudRain className="size-3" />
          {forecast.precipitationProbability}%
        </div>
      )}
    </div>
  )
}
