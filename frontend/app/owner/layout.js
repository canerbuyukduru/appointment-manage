'use client'
import OwnerNavbar from '@/components/OwnerNavbar'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function OwnerLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['owner']}>
      <div className="min-h-screen bg-gray-50">
        <OwnerNavbar />
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  )
}
