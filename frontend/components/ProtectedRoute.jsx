// components/ProtectedRoute.jsx - Optimized version
'use client'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Component yüklendiğinde kontrol et
    console.log('ProtectedRoute kontrol:', { user, isAuthenticated })
    
    // Kısa bir süre bekle (Redux state'inin yüklenmesi için)
    const timer = setTimeout(() => {
      // 1. Giriş yapmamış mı?
      if (!isAuthenticated || !user) {
        console.log('Giriş yapmamış, login\'e yönlendiriliyor')
        // Browser level redirect - kesin çözüm
        window.location.href = '/login'
        return
      }

      // 2. Role kontrolü (eğer allowedRoles belirtilmişse)
      if (allowedRoles.length > 0 && (!user?.role || !allowedRoles.includes(user.role))) {
        console.log('Yetkisiz erişim, dashboard\'a yönlendiriliyor')
        window.location.href = '/dashboard'
        return
      }

      // 3. Her şey tamam, sayfayı göster
      console.log('Erişim izni verildi')
      setIsLoading(false)
    }, 100) // 100ms bekle

    return () => clearTimeout(timer)
  }, [isAuthenticated, user, router, allowedRoles])

  // Auth state değişikliklerini dinle - anlık tepki
  useEffect(() => {
    // Eğer kullanıcı logout olmuşsa hemen yönlendir
    if (isAuthenticated === false && user === null && !isLoading) {
      console.log('Logout algılandı, yönlendiriliyor...')
      window.location.href = '/login'
    }
  }, [isAuthenticated, user, isLoading])

  // Loading durumunda gösterilecek
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Giriş yapmış ve yetkili ise children'ı göster
  return <>{children}</>
}