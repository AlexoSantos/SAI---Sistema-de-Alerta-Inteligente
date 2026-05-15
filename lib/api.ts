import { API_CONFIG, DEFAULT_LOCATION } from './constants'
import type { WeatherData, ForecastData, HourlyForecast, AirQualityData, FireEvent, RadarData } from './types'

// Open-Meteo Weather API
export async function fetchCurrentWeather(lat = DEFAULT_LOCATION.lat, lng = DEFAULT_LOCATION.lng): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation',
      'rain',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'uv_index',
    ].join(','),
    timezone: 'America/Sao_Paulo',
  })

  const response = await fetch(`${API_CONFIG.openMeteo.baseUrl}/forecast?${params}`)
  if (!response.ok) throw new Error('Failed to fetch weather data')
  
  const data = await response.json()
  const current = data.current

  return {
    temperature: current.temperature_2m,
    feelsLike: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    pressure: current.pressure_msl,
    windSpeed: current.wind_speed_10m,
    windDirection: current.wind_direction_10m,
    windGust: current.wind_gusts_10m,
    rain1h: current.rain,
    uvIndex: current.uv_index,
    cloudCover: current.cloud_cover,
    weatherCode: current.weather_code,
    weatherDescription: getWeatherDescription(current.weather_code),
    timestamp: current.time,
  }
}

// Open-Meteo Forecast API
export async function fetchForecast(lat = DEFAULT_LOCATION.lat, lng = DEFAULT_LOCATION.lng): Promise<{ daily: ForecastData[], hourly: HourlyForecast[] }> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_direction_10m_dominant',
      'uv_index_max',
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
    ].join(','),
    timezone: 'America/Sao_Paulo',
    forecast_days: '7',
  })

  const response = await fetch(`${API_CONFIG.openMeteo.baseUrl}/forecast?${params}`)
  if (!response.ok) throw new Error('Failed to fetch forecast data')
  
  const data = await response.json()

  const daily: ForecastData[] = data.daily.time.map((time: string, i: number) => ({
    time,
    temperatureMax: data.daily.temperature_2m_max[i],
    temperatureMin: data.daily.temperature_2m_min[i],
    humidity: 0, // Not in daily
    precipitationProbability: data.daily.precipitation_probability_max[i],
    precipitationSum: data.daily.precipitation_sum[i],
    windSpeed: data.daily.wind_speed_10m_max[i],
    windDirection: data.daily.wind_direction_10m_dominant[i],
    weatherCode: data.daily.weather_code[i],
    uvIndex: data.daily.uv_index_max[i],
  }))

  const hourly: HourlyForecast[] = data.hourly.time.slice(0, 24).map((time: string, i: number) => ({
    time,
    temperature: data.hourly.temperature_2m[i],
    humidity: data.hourly.relative_humidity_2m[i],
    precipitationProbability: data.hourly.precipitation_probability[i],
    precipitation: data.hourly.precipitation[i],
    weatherCode: data.hourly.weather_code[i],
    windSpeed: data.hourly.wind_speed_10m[i],
    windDirection: data.hourly.wind_direction_10m[i],
  }))

  return { daily, hourly }
}

// Open-Meteo Air Quality API
export async function fetchAirQuality(lat = DEFAULT_LOCATION.lat, lng = DEFAULT_LOCATION.lng): Promise<AirQualityData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    current: [
      'us_aqi',
      'pm10',
      'pm2_5',
      'carbon_monoxide',
      'nitrogen_dioxide',
      'ozone',
      'sulphur_dioxide',
    ].join(','),
    timezone: 'America/Sao_Paulo',
  })

  const response = await fetch(`${API_CONFIG.openMeteo.baseUrl}/air-quality?${params}`)
  if (!response.ok) throw new Error('Failed to fetch air quality data')
  
  const data = await response.json()
  const current = data.current
  const aqi = current.us_aqi || 0

  return {
    aqi,
    aqiCategory: getAqiCategory(aqi),
    pm25: current.pm2_5,
    pm10: current.pm10,
    co: current.carbon_monoxide,
    no2: current.nitrogen_dioxide,
    o3: current.ozone,
    so2: current.sulphur_dioxide,
    dominantPollutant: getDominantPollutant(current),
    timestamp: current.time,
  }
}

// RainViewer Radar API
export async function fetchRadarData(): Promise<RadarData> {
  const response = await fetch(API_CONFIG.rainViewer.baseUrl)
  if (!response.ok) throw new Error('Failed to fetch radar data')
  return response.json()
}

// NASA FIRMS Fire Data (simulated for demo - real API requires key)
export async function fetchFireEvents(lat = DEFAULT_LOCATION.lat, lng = DEFAULT_LOCATION.lng, radiusKm = 100): Promise<FireEvent[]> {
  // In production, this would call the NASA FIRMS API
  // For demo, we return simulated data based on real patterns
  const baseDate = new Date()
  
  // Generate some realistic fire event data for the region
  const events: FireEvent[] = []
  
  // Add a few simulated fire events in the broader São Paulo region
  const simulatedFires = [
    { lat: -21.85, lng: -46.65, brightness: 312.5, confidence: 'nominal' as const },
    { lat: -22.12, lng: -46.95, brightness: 298.3, confidence: 'low' as const },
    { lat: -21.78, lng: -47.05, brightness: 345.8, confidence: 'high' as const },
  ]

  simulatedFires.forEach((fire, index) => {
    const distance = calculateDistance(lat, lng, fire.lat, fire.lng)
    if (distance <= radiusKm) {
      events.push({
        id: `fire-${index}-${Date.now()}`,
        lat: fire.lat,
        lng: fire.lng,
        brightness: fire.brightness,
        confidence: fire.confidence,
        confidencePct: fire.confidence === 'high' ? 95 : fire.confidence === 'nominal' ? 75 : 45,
        frp: Math.random() * 50 + 10,
        satellite: 'MODIS',
        instrument: 'Terra',
        detectedAt: new Date(baseDate.getTime() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        distance,
      })
    }
  })

  return events.sort((a, b) => (a.distance || 0) - (b.distance || 0))
}

// Helper functions
function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Céu limpo',
    1: 'Predominantemente limpo',
    2: 'Parcialmente nublado',
    3: 'Nublado',
    45: 'Névoa',
    48: 'Névoa com geada',
    51: 'Garoa leve',
    53: 'Garoa moderada',
    55: 'Garoa intensa',
    61: 'Chuva leve',
    63: 'Chuva moderada',
    65: 'Chuva forte',
    66: 'Chuva congelante leve',
    67: 'Chuva congelante forte',
    71: 'Neve leve',
    73: 'Neve moderada',
    75: 'Neve forte',
    77: 'Granizo',
    80: 'Pancadas leves',
    81: 'Pancadas moderadas',
    82: 'Pancadas fortes',
    85: 'Neve leve',
    86: 'Neve forte',
    95: 'Tempestade',
    96: 'Tempestade com granizo',
    99: 'Tempestade severa',
  }
  return descriptions[code] || 'Desconhecido'
}

function getAqiCategory(aqi: number): string {
  if (aqi <= 50) return 'Bom'
  if (aqi <= 100) return 'Moderado'
  if (aqi <= 150) return 'Ruim para sensíveis'
  if (aqi <= 200) return 'Ruim'
  if (aqi <= 300) return 'Muito ruim'
  return 'Perigoso'
}

function getDominantPollutant(data: Record<string, number>): string {
  const pollutants = {
    pm2_5: data.pm2_5 || 0,
    pm10: data.pm10 || 0,
    ozone: data.ozone || 0,
    nitrogen_dioxide: data.nitrogen_dioxide || 0,
  }
  
  const max = Object.entries(pollutants).reduce((a, b) => a[1] > b[1] ? a : b)
  return max[0].replace('_', ' ').toUpperCase()
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
