'use client'
import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter, usePathname } from 'next/navigation'
import { useLogoutMutation } from '@/lib/services/authApi'
import { logout } from '@/lib/features/authSlice'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Home, Calendar, MapPin, LogOut, User, ChevronDown, Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Anasayfa', icon: Home },
  { href: '/user/appointments', label: 'Randevularım', icon: Calendar },
  { href: '/user/centers', label: 'Merkezler', icon: MapPin },
]

export default function UserNavbar() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef(null)
  const [logoutMutation] = useLogoutMutation()

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
    } finally {
      dispatch(logout())
      toast.success('Çıkış yapıldı')
      router.push('/login')
    }
  }

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg"></div>
              <span className="font-bold text-zinc-100 text-lg">BeautyBook</span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname === href
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

          {/* Profile */}
          <div className="flex items-center gap-2">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-zinc-100 leading-none">{user?.fullName}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Kullanıcı</p>
                </div>
                <ChevronDown size={16} className={`text-zinc-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-1 z-50">
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
                      href="/user/appointments"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                    >
                      <Calendar size={16} className="text-zinc-400" />
                      Randevularım
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

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg hover:bg-zinc-800 text-zinc-400"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-900 px-4 py-3 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === href ? 'bg-purple-950 text-purple-400' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          <div className="border-t border-zinc-800 pt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-zinc-800"
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
