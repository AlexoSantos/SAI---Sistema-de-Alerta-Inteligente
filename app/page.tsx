'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  CloudLightning, 
  Shield, 
  Satellite, 
  BarChart3, 
  MapPin, 
  Bell,
  ArrowRight,
  Activity,
  Flame,
  Wind,
  Droplets,
  Thermometer
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <CloudLightning className="size-6 text-primary" />
            </div>
            <div>
              <span className="text-lg font-bold text-foreground">SAI</span>
              <span className="ml-2 text-xs text-muted-foreground">by Imperatech</span>
            </div>
          </div>
          
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Recursos
            </Link>
            <Link href="#integrations" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Integrações
            </Link>
            <Link href="#about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Sobre
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Entrar
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Dashboard
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-sm">
              <Activity className="size-4 text-accent" />
              <span className="text-muted-foreground">Monitoramento em tempo real</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto max-w-4xl text-balance text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
          >
            Sistema de Alerta{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Inteligente
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground"
          >
            Plataforma nacional de inteligência climática com monitoramento em tempo real, 
            previsões baseadas em IA, detecção de incêndios via satélite NASA e alertas automáticos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 text-base font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 sm:w-auto"
            >
              Acessar Dashboard
              <ArrowRight className="size-5" />
            </Link>
            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-8 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary sm:w-auto"
            >
              Fazer Login
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {[
              { label: 'APIs Integradas', value: '8+' },
              { label: 'Atualização', value: '5 min' },
              { label: 'Cobertura', value: 'Nacional' },
              { label: 'Uptime', value: '99.9%' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-border/50 bg-card/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Recursos Avançados
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tecnologia de ponta para monitoramento climático
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Thermometer,
                title: 'Clima em Tempo Real',
                description: 'Temperatura, umidade, pressão, vento e mais - atualizado a cada 5 minutos',
              },
              {
                icon: Satellite,
                title: 'Satélites NASA',
                description: 'Detecção de focos de incêndio via MODIS/VIIRS com dados FIRMS',
              },
              {
                icon: Wind,
                title: 'Radar Meteorológico',
                description: 'Visualização de precipitação e nuvens via RainViewer',
              },
              {
                icon: Droplets,
                title: 'Qualidade do Ar',
                description: 'Índice AQI, PM2.5, PM10 e outros poluentes monitorados',
              },
              {
                icon: Bell,
                title: 'Alertas Automáticos',
                description: 'Notificações inteligentes para eventos climáticos extremos',
              },
              {
                icon: BarChart3,
                title: 'IA Preditiva',
                description: 'Análise de riscos e previsões baseadas em machine learning',
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="size-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="border-t border-border/50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Integrações
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Dados de fontes confiáveis e reconhecidas mundialmente
            </p>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              'Open-Meteo',
              'NASA FIRMS',
              'RainViewer',
              'OpenAQ',
              'NOAA',
              'OSM',
            ].map((integration) => (
              <div
                key={integration}
                className="flex items-center justify-center rounded-xl border border-border/50 bg-card/50 p-6 text-center"
              >
                <span className="font-medium text-muted-foreground">{integration}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/50 bg-gradient-to-b from-card/50 to-background py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Pronto para começar?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Acesse o dashboard e monitore o clima da sua região em tempo real
          </p>
          <div className="mt-10">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-lg font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
            >
              Acessar Agora
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <CloudLightning className="size-5 text-primary" />
              </div>
              <span className="font-semibold text-foreground">SAI</span>
              <span className="text-sm text-muted-foreground">by Imperatech</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Sistema de Alerta Inteligente - Plataforma Nacional de Inteligência Climática
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
