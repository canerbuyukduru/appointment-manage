'use client'
import { usePathname } from 'next/navigation'
import AdminNavbar from '@/components/AdminNavbar'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  )
}
