// SAI Location Configuration
export const DEFAULT_LOCATION = {
  lat: -21.9694,
  lng: -46.7967,
  city: 'São João da Boa Vista',
  state: 'SP',
  country: 'BR',
  timezone: 'America/Sao_Paulo',
}

// API Configuration
export const API_CONFIG = {
  openMeteo: {
    baseUrl: 'https://api.open-meteo.com/v1',
    forecastEndpoint: '/forecast',
    airQualityEndpoint: '/air-quality',
  },
  nasaFirms: {
    baseUrl: 'https://firms.modaps.eosdis.nasa.gov/api/area/csv',
    mapKey: process.env.NASA_FIRMS_MAP_KEY || '',
  },
  rainViewer: {
    baseUrl: 'https://api.rainviewer.com/public/weather-maps.json',
    tileUrl: 'https://tilecache.rainviewer.com/v2/radar',
  },
}

// Refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  weather: 5 * 60 * 1000,       // 5 minutes
  forecast: 60 * 60 * 1000,     // 1 hour
  fire: 10 * 60 * 1000,         // 10 minutes
  airQuality: 30 * 60 * 1000,   // 30 minutes
  radar: 5 * 60 * 1000,         // 5 minutes
}

// Alert thresholds
export const ALERT_THRESHOLDS = {
  temperature: {
    heatwave: 35,
    coldWave: 5,
  },
  wind: {
    strong: 40,
    storm: 60,
  },
  rain: {
    heavy: 20,  // mm/h
    extreme: 50,
  },
  aqi: {
    moderate: 51,
    unhealthySensitive: 101,
    unhealthy: 151,
    veryUnhealthy: 201,
    hazardous: 301,
  },
  humidity: {
    low: 30,
    high: 85,
  },
}

// Map configuration
export const MAP_CONFIG = {
  defaultZoom: 10,
  minZoom: 3,
  maxZoom: 18,
  tileProviders: {
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri',
    },
  },
}

// Role permissions
export const ROLE_PERMISSIONS = {
  user: ['view_dashboard', 'view_alerts', 'view_map'],
  operator: ['view_dashboard', 'view_alerts', 'view_map', 'acknowledge_alerts', 'view_stations'],
  manager: ['view_dashboard', 'view_alerts', 'view_map', 'acknowledge_alerts', 'view_stations', 'manage_stations', 'view_analytics'],
  admin: ['view_dashboard', 'view_alerts', 'view_map', 'acknowledge_alerts', 'view_stations', 'manage_stations', 'view_analytics', 'manage_users', 'manage_settings'],
  super_admin: ['all'],
}

// Plans configuration
export const PLANS = {
  free: {
    name: 'Gratuito',
    maxStations: 1,
    maxUsers: 2,
    features: ['weather', 'forecast'],
    apiCallsPerDay: 100,
  },
  starter: {
    name: 'Starter',
    maxStations: 5,
    maxUsers: 10,
    features: ['weather', 'forecast', 'alerts', 'fire'],
    apiCallsPerDay: 1000,
  },
  professional: {
    name: 'Professional',
    maxStations: 50,
    maxUsers: 100,
    features: ['weather', 'forecast', 'alerts', 'fire', 'air_quality', 'analytics', 'api'],
    apiCallsPerDay: 10000,
  },
  enterprise: {
    name: 'Enterprise',
    maxStations: -1, // unlimited
    maxUsers: -1,
    features: ['all'],
    apiCallsPerDay: -1,
  },
}
