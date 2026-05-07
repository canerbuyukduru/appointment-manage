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
    const timer = setTimeout(() => {
      if (!isAuthenticated || !user) {
        window.location.href = '/login'
        return
      }

      if (allowedRoles.length > 0 && (!user?.role || !allowedRoles.includes(user.role))) {
        window.location.href = '/dashboard'
        return
      }

      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [isAuthenticated, user, router, allowedRoles])

  useEffect(() => {
    if (isAuthenticated === false && user === null && !isLoading) {
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