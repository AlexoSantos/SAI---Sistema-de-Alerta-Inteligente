'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CloudLightning, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message === 'Invalid login credentials' 
          ? 'Email ou senha incorretos' 
          : error.message)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  // Demo login handler
  const handleDemoLogin = () => {
    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="mb-8 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <CloudLightning className="size-6 text-primary" />
              </div>
              <div>
                <span className="text-lg font-bold text-foreground">SAI</span>
                <span className="ml-2 text-xs text-muted-foreground">by Imperatech</span>
              </div>
            </Link>

            <h1 className="text-2xl font-bold text-foreground">Bem-vindo de volta</h1>
            <p className="mt-2 text-muted-foreground">
              Acesse sua conta para monitorar o clima em tempo real
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-6">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full rounded-lg border border-border bg-card py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-border bg-card py-3 pl-10 pr-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="size-5" />
                  </>
                )}
              </button>
            </form>

            <div className="relative mt-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-4 text-muted-foreground">ou</span>
              </div>
            </div>

            <button
              onClick={handleDemoLogin}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card py-3 font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Acessar Demo
              <ArrowRight className="size-5" />
            </button>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Não tem uma conta?{' '}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Cadastre-se
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="relative hidden w-1/2 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-card to-background" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30" />
        <div className="relative flex h-full flex-col items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center"
          >
            <div className="mb-8 flex justify-center">
              <div className="flex size-24 items-center justify-center rounded-2xl bg-primary/10 backdrop-blur-xl">
                <CloudLightning className="size-12 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              Inteligência Climática Nacional
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Monitore condições climáticas, receba alertas em tempo real e tome decisões 
              baseadas em dados precisos de múltiplas fontes.
            </p>
            
            <div className="mt-12 grid grid-cols-3 gap-6">
              {[
                { label: 'Estações', value: '500+' },
                { label: 'Cidades', value: '5.570' },
                { label: 'Alertas/dia', value: '10k+' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border/50 bg-card/30 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
