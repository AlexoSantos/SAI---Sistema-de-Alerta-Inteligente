import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WeatherData, ForecastData, HourlyForecast, AirQualityData, FireEvent, Alert, Station, Profile, RiskAnalysis } from './types'
import { DEFAULT_LOCATION } from './constants'

interface Location {
  lat: number
  lng: number
  city: string
  state: string
}

interface WeatherStore {
  // Location
  currentLocation: Location
  setLocation: (location: Location) => void

  // Weather data
  currentWeather: WeatherData | null
  setCurrentWeather: (data: WeatherData | null) => void

  // Forecast
  dailyForecast: ForecastData[]
  hourlyForecast: HourlyForecast[]
  setForecast: (daily: ForecastData[], hourly: HourlyForecast[]) => void

  // Air quality
  airQuality: AirQualityData | null
  setAirQuality: (data: AirQualityData | null) => void

  // Fire events
  fireEvents: FireEvent[]
  setFireEvents: (events: FireEvent[]) => void

  // Alerts
  alerts: Alert[]
  setAlerts: (alerts: Alert[]) => void
  addAlert: (alert: Alert) => void
  acknowledgeAlert: (id: string) => void

  // Risk analysis
  riskAnalysis: RiskAnalysis | null
  setRiskAnalysis: (data: RiskAnalysis | null) => void

  // Stations
  stations: Station[]
  setStations: (stations: Station[]) => void
  selectedStation: Station | null
  setSelectedStation: (station: Station | null) => void

  // Loading states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  lastUpdated: string | null
  setLastUpdated: (date: string) => void

  // Error state
  error: string | null
  setError: (error: string | null) => void
}

export const useWeatherStore = create<WeatherStore>()((set) => ({
  // Location
  currentLocation: {
    lat: DEFAULT_LOCATION.lat,
    lng: DEFAULT_LOCATION.lng,
    city: DEFAULT_LOCATION.city,
    state: DEFAULT_LOCATION.state,
  },
  setLocation: (location) => set({ currentLocation: location }),

  // Weather data
  currentWeather: null,
  setCurrentWeather: (data) => set({ currentWeather: data }),

  // Forecast
  dailyForecast: [],
  hourlyForecast: [],
  setForecast: (daily, hourly) => set({ dailyForecast: daily, hourlyForecast: hourly }),

  // Air quality
  airQuality: null,
  setAirQuality: (data) => set({ airQuality: data }),

  // Fire events
  fireEvents: [],
  setFireEvents: (events) => set({ fireEvents: events }),

  // Alerts
  alerts: [],
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
  acknowledgeAlert: (id) => set((state) => ({
    alerts: state.alerts.map((a) => 
      a.id === id ? { ...a, acknowledgedAt: new Date().toISOString() } : a
    ),
  })),

  // Risk analysis
  riskAnalysis: null,
  setRiskAnalysis: (data) => set({ riskAnalysis: data }),

  // Stations
  stations: [],
  setStations: (stations) => set({ stations }),
  selectedStation: null,
  setSelectedStation: (station) => set({ selectedStation: station }),

  // Loading states
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  lastUpdated: null,
  setLastUpdated: (date) => set({ lastUpdated: date }),

  // Error state
  error: null,
  setError: (error) => set({ error }),
}))

// Auth store
interface AuthStore {
  user: Profile | null
  setUser: (user: Profile | null) => void
  isAuthenticated: boolean
  setIsAuthenticated: (auth: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      isAuthenticated: false,
      setIsAuthenticated: (auth) => set({ isAuthenticated: auth }),
    }),
    {
      name: 'sai-auth-storage',
    }
  )
)

// UI store
interface UIStore {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  
  mapLayer: 'radar' | 'temperature' | 'fire' | 'air_quality'
  setMapLayer: (layer: 'radar' | 'temperature' | 'fire' | 'air_quality') => void
  
  showAlertPanel: boolean
  setShowAlertPanel: (show: boolean) => void
  
  selectedTimeRange: '1h' | '6h' | '24h' | '7d' | '30d'
  setSelectedTimeRange: (range: '1h' | '6h' | '24h' | '7d' | '30d') => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      mapLayer: 'radar',
      setMapLayer: (layer) => set({ mapLayer: layer }),
      
      showAlertPanel: true,
      setShowAlertPanel: (show) => set({ showAlertPanel: show }),
      
      selectedTimeRange: '24h',
      setSelectedTimeRange: (range) => set({ selectedTimeRange: range }),
    }),
    {
      name: 'sai-ui-storage',
    }
  )
)
