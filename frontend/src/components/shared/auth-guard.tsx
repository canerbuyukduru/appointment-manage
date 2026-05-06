'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'

interface AuthGuardProps {
  children: React.ReactNode
  role?: 'admin' | 'business_owner' | 'staff' | 'customer'
}

function Skeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-md space-y-4 p-8">
        <div className="h-8 bg-gray-200 rounded-md animate-pulse" />
        <div className="h-4 bg-gray-200 rounded-md animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 rounded-md animate-pulse w-1/2" />
        <div className="space-y-3 pt-4">
          <div className="h-11 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-11 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-11 bg-gray-200 rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export function AuthGuard({ children, role }: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/giris')
      return
    }

    if (role && user?.role !== role) {
      router.push('/')
    }
  }, [isAuthenticated, user, role, router])

  if (!isAuthenticated) {
    return <Skeleton />
  }

  if (role && user?.role !== role) {
    return <Skeleton />
  }

  return <>{children}</>
}
