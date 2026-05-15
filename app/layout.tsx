import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  title: 'SAI - Sistema de Alerta Inteligente | Imperatech',
  description: 'Plataforma Nacional de Inteligência Climática - Monitoramento em tempo real, previsões, alertas e análise de riscos climáticos',
  keywords: ['clima', 'meteorologia', 'alertas', 'inteligência climática', 'monitoramento', 'previsão do tempo', 'Imperatech', 'SAI'],
  authors: [{ name: 'Imperatech' }],
  openGraph: {
    title: 'SAI - Sistema de Alerta Inteligente',
    description: 'Plataforma Nacional de Inteligência Climática',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#030712',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${jetbrainsMono.variable} bg-background`}>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
