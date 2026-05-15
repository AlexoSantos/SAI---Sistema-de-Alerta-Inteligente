'use client'

import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { HourlyForecast } from '@/lib/types'

interface WeatherChartProps {
  data: HourlyForecast[]
}

export default function WeatherChart({ data }: WeatherChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Carregando dados...
      </div>
    )
  }

  const chartData = data.map((item) => ({
    time: new Date(item.time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    temperature: Math.round(item.temperature),
    humidity: item.humidity,
    precipitation: item.precipitationProbability,
  }))

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="precipitationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="time" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            domain={['dataMin - 2', 'dataMax + 2']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f1f5f9',
            }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(value: number, name: string) => {
              if (name === 'temperature') return [`${value}°C`, 'Temperatura']
              if (name === 'precipitation') return [`${value}%`, 'Chance de chuva']
              return [value, name]
            }}
          />
          <Area
            type="monotone"
            dataKey="temperature"
            stroke="#0ea5e9"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#temperatureGradient)"
          />
          <Area
            type="monotone"
            dataKey="precipitation"
            stroke="#3b82f6"
            strokeWidth={1}
            strokeDasharray="5 5"
            fillOpacity={1}
            fill="url(#precipitationGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
