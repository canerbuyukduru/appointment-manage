// app/page.jsx
'use client'
import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { useGetAllBeautyCentersQuery } from '@/lib/services/beautyCenterApi'
import { useLogoutMutation } from '@/lib/services/authApi'
import { logout } from '@/lib/features/authSlice'
import { Search, MapPin, Phone, Clock, Star, ChevronDown, LogOut, User, LayoutDashboard, Calendar, Building, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function HomePage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
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

  const getDashboardLink = () => {
    if (user?.role === 'owner') return '/owner/dashboard'
    if (user?.role === 'admin') return '/admin/dashboard'
    return '/dashboard'
  }

  const getRoleLabel = () => {
    if (user?.role === 'owner') return 'İşletme Sahibi'
    if (user?.role === 'admin') return 'Admin'
    return 'Kullanıcı'
  }

  const getAvatarGradient = () => {
    if (user?.role === 'owner') return 'from-purple-500 to-indigo-600'
    if (user?.role === 'admin') return 'from-red-500 to-rose-600'
    return 'from-pink-500 to-purple-600'
  }

  // API call - Herkes için (giriş yapmadan da çalışır)
  const { 
    data: centersData, 
    isLoading, 
    error 
  } = useGetAllBeautyCentersQuery({
    search: searchTerm,
    location: locationFilter,
  })

  const centers = centersData || [] // Direct array

  // Location'ı formatla
  const formatLocation = (location, address) => {
    if (typeof location === 'string' && location.trim()) {
      return location
    }
    if (typeof location === 'object' && location.latitude && location.longitude) {
      return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
    }
    if (address && typeof address === 'string') {
      // Adresin ilk kısmını al (şehir, ilçe)
      return address.split(',').slice(-2).join(',').trim()
    }
    return 'Konum bilgisi yok'
  }

  // Çalışma saati formatla
  const getCurrentStatus = (workingHours) => {
    if (!workingHours) return { isOpen: false, text: 'Bilinmiyor' }
    
    const now = new Date()
    const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()]
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const daySchedule = workingHours[currentDay]
    if (!daySchedule || daySchedule.isClosed) {
      return { isOpen: false, text: 'Bugün Kapalı' }
    }
    
    const openTime = daySchedule.open ? parseInt(daySchedule.open.split(':')[0]) * 60 + parseInt(daySchedule.open.split(':')[1]) : 0
    const closeTime = daySchedule.close ? parseInt(daySchedule.close.split(':')[0]) * 60 + parseInt(daySchedule.close.split(':')[1]) : 0
    
    if (currentTime >= openTime && currentTime <= closeTime) {
      return { isOpen: true, text: 'Şu an Açık' }
    } else {
      return { isOpen: false, text: `${daySchedule.open} - ${daySchedule.close}` }
    }
  }

  const handleBookingClick = (centerId, centerName) => {
    if (!isAuthenticated) {
      // Local storage'a merkez bilgisini kaydet
      localStorage.setItem('pendingBooking', JSON.stringify({
        centerId,
        centerName,
        redirectTo: `/centers/${centerId}/booking`
      }))
      router.push('/login')
      return
    }
    router.push(`/centers/${centerId}/booking`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg"></div>
              <h1 className="text-2xl font-bold text-gray-900">BeautyBook</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-8 h-8 bg-gradient-to-r ${getAvatarGradient()} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                      {initials}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900 leading-none">{user?.fullName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{getRoleLabel()}</p>
                    </div>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href={getDashboardLink()}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LayoutDashboard size={16} className="text-gray-400" />
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User size={16} className="text-gray-400" />
                          Profilim
                        </Link>
                        {user?.role === 'user' && (
                          <Link
                            href="/user/appointments"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Calendar size={16} className="text-gray-400" />
                            Randevularım
                          </Link>
                        )}
                        {user?.role === 'owner' && (
                          <Link
                            href="/owner/beauty-center"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Building size={16} className="text-gray-400" />
                            İşletmem
                          </Link>
                        )}
                        {user?.role === 'admin' && (
                          <Link
                            href="/admin/owners"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <ShieldCheck size={16} className="text-gray-400" />
                            Onay Bekleyenler
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} />
                          Çıkış Yap
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    className="text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/register/user"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Güzellik Randevunuz Bir Tık Uzağınızda
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Size yakın güzellik merkezlerini keşfedin ve kolayca randevu alın
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-xl p-2 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Salon, hizmet ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-gray-900 rounded-lg focus:outline-none"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Konum"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10 pr-4 py-3 text-gray-900 rounded-lg focus:outline-none min-w-[160px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Beauty Centers */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Güzellik Merkezleri</h3>
            <p className="text-gray-600">{centers.length} merkez bulundu</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Güzellik merkezleri yüklenirken hata oluştu</p>
              <button 
                onClick={() => window.location.reload()} 
                className="text-purple-600 hover:text-purple-700"
              >
                Tekrar Dene
              </button>
            </div>
          ) : centers.length === 0 ? (
            <div className="text-center py-12">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Henüz güzellik merkezi bulunmuyor</h4>
              <p className="text-gray-600">Farklı arama terimleri deneyin</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {centers.map((center) => {
                const status = getCurrentStatus(center.workingHours)
                
                return (
                  <div
                    key={center._id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-1">
                          {center.name}
                        </h4>
                        <div className="flex items-center gap-1 mb-2">
                          <MapPin size={16} className="text-gray-400" />
                          <span className="text-gray-600 text-sm">
                            {formatLocation(center.location, center.address)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">4.5</span>
                      </div>
                    </div>

                    {center.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {center.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Phone size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600">{center.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-gray-400" />
                          <span className={`text-sm ${status.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                            {status.text}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => router.push(`/centers/${center._id}`)}
                        className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        Detayları Gör
                      </button>
                      <button
                        onClick={() => handleBookingClick(center._id, center.name)}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all text-sm font-medium"
                      >
                        Randevu Al
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}