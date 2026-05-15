import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Weather code descriptions (WMO codes)
export const weatherCodeMap: Record<number, { description: string; icon: string }> = {
  0: { description: 'Céu limpo', icon: 'sun' },
  1: { description: 'Predominantemente limpo', icon: 'sun' },
  2: { description: 'Parcialmente nublado', icon: 'cloud-sun' },
  3: { description: 'Nublado', icon: 'cloud' },
  45: { description: 'Névoa', icon: 'cloud-fog' },
  48: { description: 'Névoa com geada', icon: 'cloud-fog' },
  51: { description: 'Garoa leve', icon: 'cloud-drizzle' },
  53: { description: 'Garoa moderada', icon: 'cloud-drizzle' },
  55: { description: 'Garoa intensa', icon: 'cloud-drizzle' },
  61: { description: 'Chuva leve', icon: 'cloud-rain' },
  63: { description: 'Chuva moderada', icon: 'cloud-rain' },
  65: { description: 'Chuva forte', icon: 'cloud-rain' },
  66: { description: 'Chuva congelante leve', icon: 'cloud-snow' },
  67: { description: 'Chuva congelante forte', icon: 'cloud-snow' },
  71: { description: 'Neve leve', icon: 'snowflake' },
  73: { description: 'Neve moderada', icon: 'snowflake' },
  75: { description: 'Neve forte', icon: 'snowflake' },
  77: { description: 'Granizo', icon: 'cloud-hail' },
  80: { description: 'Pancadas de chuva leves', icon: 'cloud-rain' },
  81: { description: 'Pancadas de chuva moderadas', icon: 'cloud-rain' },
  82: { description: 'Pancadas de chuva fortes', icon: 'cloud-rain' },
  85: { description: 'Pancadas de neve leves', icon: 'snowflake' },
  86: { description: 'Pancadas de neve fortes', icon: 'snowflake' },
  95: { description: 'Tempestade', icon: 'cloud-lightning' },
  96: { description: 'Tempestade com granizo leve', icon: 'cloud-lightning' },
  99: { description: 'Tempestade com granizo forte', icon: 'cloud-lightning' },
}

// Get weather description from code
export function getWeatherDescription(code: number): string {
  return weatherCodeMap[code]?.description ?? 'Desconhecido'
}

// Get AQI category and color
export function getAQICategory(aqi: number): { label: string; color: string; bgColor: string } {
  if (aqi <= 50) return { label: 'Bom', color: 'text-green-400', bgColor: 'bg-green-500/20' }
  if (aqi <= 100) return { label: 'Moderado', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' }
  if (aqi <= 150) return { label: 'Ruim para sensíveis', color: 'text-orange-400', bgColor: 'bg-orange-500/20' }
  if (aqi <= 200) return { label: 'Ruim', color: 'text-red-400', bgColor: 'bg-red-500/20' }
  if (aqi <= 300) return { label: 'Muito ruim', color: 'text-purple-400', bgColor: 'bg-purple-500/20' }
  return { label: 'Perigoso', color: 'text-rose-400', bgColor: 'bg-rose-500/20' }
}

// Get risk level color
export function getRiskLevelColor(level: string): string {
  switch (level) {
    case 'minimal': return 'text-green-400'
    case 'low': return 'text-blue-400'
    case 'moderate': return 'text-yellow-400'
    case 'high': return 'text-orange-400'
    case 'extreme': return 'text-red-400'
    default: return 'text-muted-foreground'
  }
}

// Get temperature color based on value (Celsius)
export function getTemperatureColor(temp: number): string {
  if (temp >= 35) return 'text-red-400'
  if (temp >= 28) return 'text-orange-400'
  if (temp >= 20) return 'text-green-400'
  if (temp >= 10) return 'text-blue-400'
  return 'text-purple-400'
}

// Format wind direction from degrees to cardinal
export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

// Format date for Brazilian locale
export function formatDate(date: Date | string, format: 'short' | 'long' | 'time' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  switch (format) {
    case 'long':
      return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    case 'time':
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    default:
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
