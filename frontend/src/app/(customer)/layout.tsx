'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Menu, X, LogOut, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { useLogout } from '@/hooks/use-auth'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, isAuthenticated } = useAuthStore()
  const { mutate: logout } = useLogout()
  const pathname = usePathname()

  const navLinks = [
    { href: '/', label: 'Ana Sayfa' },
    { href: '/isletmeler', label: 'İşletmeler' },
    ...(isAuthenticated ? [{ href: '/randevularim', label: 'Randevularım' }] : []),
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Calendar className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Randevu<span className="text-blue-400">.</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === l.href
                    ? 'text-white bg-gray-800'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {user?.role === 'business_owner' && (
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Panel
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-1.5">
                  <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                    {user?.firstName?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-300">{user?.firstName}</span>
                </div>
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800/60 transition-all"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Çıkış
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/giris"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/kayit-ol"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-800 bg-gray-950 px-4 py-4 flex flex-col gap-2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === l.href ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="border-t border-gray-800 mt-2 pt-2 flex flex-col gap-2">
              {isAuthenticated ? (
                <button
                  onClick={() => { logout(); setMobileOpen(false) }}
                  className="px-3 py-2.5 text-left text-sm text-red-400 hover:bg-gray-800/60 rounded-lg transition-all"
                >
                  Çıkış Yap
                </button>
              ) : (
                <>
                  <Link href="/giris" className="px-3 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/60 rounded-lg transition-all" onClick={() => setMobileOpen(false)}>Giriş Yap</Link>
                  <Link href="/kayit-ol" className="px-3 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all" onClick={() => setMobileOpen(false)}>Kayıt Ol</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-gray-800 bg-gray-900 py-10 px-4">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">Randevu<span className="text-blue-400">.</span></span>
          </div>
          <p className="text-sm text-gray-500">© 2026 Randevu Sistemi. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4">
            <Link href="/gizlilik" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Gizlilik</Link>
            <Link href="/kullanim-kosullari" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Kullanım Koşulları</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
