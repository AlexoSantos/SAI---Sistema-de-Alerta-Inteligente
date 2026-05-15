'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  CloudLightning,
  LayoutDashboard,
  Map,
  BarChart3,
  Bell,
  Settings,
  Radio,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Menu,
  X,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Mapa', href: '/map', icon: Map },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Alertas', href: '/alerts', icon: Bell },
  { name: 'Estações', href: '/stations', icon: Radio },
  { name: 'Configurações', href: '/settings', icon: Settings },
]

const adminNavigation = [
  { name: 'Control Center', href: '/control-center', icon: Shield },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 hidden h-screen border-r border-border bg-card transition-all duration-300 lg:block',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <CloudLightning className="size-6 text-primary" />
              </div>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col"
                >
                  <span className="font-bold text-foreground">SAI</span>
                  <span className="text-xs text-muted-foreground">Imperatech</span>
                </motion.div>
              )}
            </Link>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {sidebarCollapsed ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-3">
            <div className="mb-2">
              {!sidebarCollapsed && (
                <span className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Principal
                </span>
              )}
            </div>
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <item.icon className="size-5 shrink-0" />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </Link>
              )
            })}

            <div className="my-4 border-t border-border" />
            
            <div className="mb-2">
              {!sidebarCollapsed && (
                <span className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Administração
                </span>
              )}
            </div>
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <item.icon className="size-5 shrink-0" />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-border p-3">
            <div className={cn(
              'flex items-center gap-3 rounded-lg p-2',
              sidebarCollapsed ? 'justify-center' : ''
            )}>
              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
                <User className="size-5 text-primary" />
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 truncate">
                  <div className="truncate text-sm font-medium text-foreground">Usuário Demo</div>
                  <div className="truncate text-xs text-muted-foreground">demo@sai.gov.br</div>
                </div>
              )}
            </div>
            <Link
              href="/"
              className={cn(
                'mt-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive',
                sidebarCollapsed ? 'justify-center' : ''
              )}
            >
              <LogOut className="size-5 shrink-0" />
              {!sidebarCollapsed && <span>Sair</span>}
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <CloudLightning className="size-6 text-primary" />
          </div>
          <span className="font-bold text-foreground">SAI</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-64 border-r border-border bg-card pt-20">
              <nav className="space-y-1 p-3">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      <item.icon className="size-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
                <div className="my-4 border-t border-border" />
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      <item.icon className="size-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 pt-16 transition-all duration-300 lg:pt-0',
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        {children}
      </main>
    </div>
  )
}
