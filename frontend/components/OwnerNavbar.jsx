'use client'
import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter, usePathname } from 'next/navigation'
import { useLogoutMutation } from '@/lib/services/authApi'
import { logout } from '@/lib/features/authSlice'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  LayoutDashboard,
  Calendar,
  Building,
  Layers,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
  AlertTriangle,
} from 'lucide-react'
import { useGetMyBeautyCenterQuery } from '@/lib/services/beautyCenterApi'

const navLinks = [
  { href: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/owner/appointments', label: 'Randevular', icon: Calendar },
  { href: '/owner/beauty-center', label: 'İşletme', icon: Building },
  { href: '/owner/departments', label: 'Departmanlar', icon: Layers },
]

export default function OwnerNavbar() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef(null)
  const [logoutMutation] = useLogoutMutation()
  const { data: beautyCenter } = useGetMyBeautyCenterQuery()

  // Dropdown dışına tıklayınca kapat
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap()
      dispatch(logout())
      toast.success('Çıkış yapıldı')
      router.push('/login')
    } catch {
      dispatch(logout())
      router.push('/login')
    }
  }

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'O'

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building className="text-white" size={16} />
              </div>
              <span className="font-bold text-zinc-100 text-lg">BeautyBook</span>
              <span className="hidden sm:block text-xs bg-purple-950/50 text-purple-400 border border-purple-900 px-2 py-0.5 rounded-full font-medium">Owner</span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-purple-950 text-purple-400'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Onay uyarısı */}
            {beautyCenter && !beautyCenter.isApproved && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-yellow-950/30 border border-yellow-900 text-yellow-400 rounded-lg text-xs font-medium">
                <AlertTriangle size={14} />
                Onay Bekleniyor
              </div>
            )}

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-zinc-100 leading-none">{user?.fullName}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">İşletme Sahibi</p>
                </div>
                <ChevronDown size={16} className={`text-zinc-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-1 z-50">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-zinc-800">
                    <p className="text-sm font-semibold text-zinc-100">{user?.fullName}</p>
                    <p className="text-xs text-zinc-400 mt-0.5 truncate">{user?.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                    >
                      <User size={16} className="text-zinc-400" />
                      Profilim
                    </Link>
                    <Link
                      href="/owner/beauty-center"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                    >
                      <Building size={16} className="text-zinc-400" />
                      İşletme Ayarları
                    </Link>
                  </div>

                  <div className="border-t border-zinc-800 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 transition-colors"
                    >
                      <LogOut size={16} />
                      Çıkış Yap
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-900 px-4 py-3 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-purple-950 text-purple-400'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
          <div className="border-t border-zinc-800 pt-2 mt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-zinc-800 transition-colors"
            >
              <LogOut size={18} />
              Çıkış Yap
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
