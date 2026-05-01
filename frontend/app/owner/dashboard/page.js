// app/owner/dashboard/page.jsx
'use client'
import { useState } from 'react'
import { useGetMyBeautyCenterQuery } from '@/lib/services/beautyCenterApi'
import { useGetDepartmentsQuery } from '@/lib/services/departmentApi'
import { useGetOwnerAppointmentsQuery } from '@/lib/services/appointmentApi'
import ProtectedRoute from '@/components/ProtectedRoute'
import { 
  Building, 
  Calendar, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Settings,
  BarChart3,
  Eye,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

function OwnerDashboardContent() {
  const [timeRange, setTimeRange] = useState('week') // week, month

  // API hooks
  const { data: beautyCenter, isLoading: centerLoading } = useGetMyBeautyCenterQuery()
  const { data: departments = [], isLoading: departmentsLoading } = useGetDepartmentsQuery()
  const { data: appointmentsData, isLoading: appointmentsLoading } = useGetOwnerAppointmentsQuery({})

  const appointments = appointmentsData?.appointments || []

  // Bugünkü randevuları filtrele
  const today = new Date()
  const todayStr = today.toDateString()
  const todayAppointments = appointments.filter(apt => 
    new Date(apt.startDateTime).toDateString() === todayStr
  )

  // Bu haftaki randevuları filtrele
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  const weekAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.startDateTime)
    return aptDate >= startOfWeek && aptDate <= today
  })

  // İstatistikler
  const stats = {
    totalAppointments: appointments.length,
    pendingAppointments: appointments.filter(apt => apt.status === 'pending').length,
    approvedAppointments: appointments.filter(apt => apt.status === 'approved').length,
    completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
    todayAppointments: todayAppointments.length,
    weekAppointments: weekAppointments.length,
    totalDepartments: departments.length,
    totalServices: departments.reduce((total, dept) => total + (dept.services?.length || 0), 0)
  }

  // En popüler hizmetler (örnek data - gerçekte backend'den gelmeli)
  const popularServices = appointments
    .reduce((acc, apt) => {
      const serviceName = apt.serviceSnapshot?.name || 'Bilinmeyen Hizmet'
      acc[serviceName] = (acc[serviceName] || 0) + 1
      return acc
    }, {})

  const topServices = Object.entries(popularServices)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  if (centerLoading || departmentsLoading || appointmentsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Dashboard yükleniyor...</p>
        </div>
      </div>
    )
  }

  // İşletme yoksa yönlendirme mesajı
  if (!beautyCenter) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Building className="mx-auto text-purple-500 mb-6" size={80} />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">İşletmenizi Oluşturun</h1>
            <p className="text-gray-600 mb-8 text-lg">
              Dashboard&apos;unuzu görüntülemek için önce işletme bilgilerinizi oluşturmanız gerekiyor.
            </p>
            <Link 
              href="/owner/beauty-center"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-4 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all"
            >
              <Building size={20} />
              İşletme Oluştur
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
                <p className="text-gray-600 mt-2">
                  {beautyCenter.name} - Genel bakış ve istatistikler
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {!beautyCenter.isApproved && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
                    <AlertTriangle size={16} />
                    <span className="text-sm font-medium">Onay Bekleniyor</span>
                  </div>
                )}
                
                <Link 
                  href="/owner/beauty-center"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Settings size={16} />
                  Ayarlar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Bugünkü Randevular */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bugünkü Randevular</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
              </div>
            </div>
          </div>

          {/* Bekleyen Onaylar */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bekleyen Onay</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingAppointments}</p>
              </div>
            </div>
          </div>

          {/* Bu Hafta */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bu Hafta</p>
                <p className="text-2xl font-bold text-gray-900">{stats.weekAppointments}</p>
              </div>
            </div>
          </div>

          {/* Toplam Hizmet */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Hizmet</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol taraf - Bugünkü Randevular */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Bugünkü Randevular</h3>
              <Link 
                href="/owner/appointments"
                className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
              >
                Tümünü Gör
                <ArrowRight size={14} />
              </Link>
            </div>
            
            {todayAppointments.length > 0 ? (
              <div className="space-y-4">
                {todayAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="text-purple-600" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{appointment.userId?.fullName}</p>
                        <p className="text-sm text-gray-600">
                          {appointment.serviceSnapshot?.name} - {appointment.departmentId?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(appointment.startDateTime).toLocaleTimeString('tr-TR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        appointment.status === 'approved' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status === 'approved' ? 'Onaylı' : 
                         appointment.status === 'pending' ? 'Bekliyor' : appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-600">Bugün randevu bulunmuyor</p>
              </div>
            )}
          </div>

          {/* Sağ taraf - Hızlı İşlemler ve İstatistikler */}
          <div className="space-y-6">
            {/* Hızlı İşlemler */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
              <div className="space-y-3">
                <Link 
                  href="/owner/beauty-center"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Building className="text-purple-600" size={20} />
                  <span className="text-gray-700">İşletme Ayarları</span>
                </Link>
                <Link 
                  href="/owner/departments"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Settings className="text-blue-600" size={20} />
                  <span className="text-gray-700">Departmanlar</span>
                </Link>
                <Link 
                  href="/owner/appointments"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="text-green-600" size={20} />
                  <span className="text-gray-700">Randevu Yönetimi</span>
                </Link>
              </div>
            </div>

            {/* Popüler Hizmetler */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popüler Hizmetler</h3>
              {topServices.length > 0 ? (
                <div className="space-y-3">
                  {topServices.map(([serviceName, count], index) => (
                    <div key={serviceName} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-50 text-gray-600'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-900">{serviceName}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">{count} randevu</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">Henüz randevu verisi yok</p>
              )}
            </div>

            {/* Sistem Durumu */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sistem Durumu</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Departman Sayısı</span>
                  <span className="font-medium">{stats.totalDepartments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Aktif Hizmet</span>
                  <span className="font-medium">{stats.totalServices}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Toplam Randevu</span>
                  <span className="font-medium">{stats.totalAppointments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Onay Durumu</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    beautyCenter.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {beautyCenter.isApproved ? 'Onaylı' : 'Beklemede'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OwnerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['owner']}>
      <OwnerDashboardContent />
    </ProtectedRoute>
  )
}