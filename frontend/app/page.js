// app/page.jsx
'use client'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { useGetAllBeautyCentersQuery } from '@/lib/services/beautyCenterApi'
import { Search, MapPin, Phone, Clock, Star } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('')

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
                <div className="flex items-center gap-4">
                  <span className="text-gray-700">Merhaba, {user?.fullName}</span>
                  <Link
                    href="/dashboard"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Dashboard
                  </Link>
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