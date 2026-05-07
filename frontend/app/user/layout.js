'use client'
import UserNavbar from '@/components/UserNavbar'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function UserLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['user']}>
      <div className="min-h-screen bg-gray-50">
        <UserNavbar />
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  )
}
