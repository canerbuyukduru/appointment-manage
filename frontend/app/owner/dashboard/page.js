// app/owner/dashboard/page.jsx
'use client'
import { useState } from 'react'
import { useGetMyBeautyCenterQuery } from '@/lib/services/beautyCenterApi'
import { useGetDepartmentsQuery } from '@/lib/services/departmentApi'
import { useGetOwnerAppointmentsQuery } from '@/lib/services/appointmentApi'
import {
  Building,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  Settings,
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

  // En popüler hizmetler
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Dashboard yükleniyor...</p>
        </div>
      </div>
    )
  }

  // İşletme yoksa yönlendirme mesajı
  if (!beautyCenter) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <Building className="mx-auto text-purple-500 mb-6" size={80} />
            <h1 className="text-3xl font-bold text-zinc-100 mb-4">İşletmenizi Oluşturun</h1>
            <p className="text-zinc-400 mb-8 text-lg">
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
    <div>
      {/* Page Header */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
              <p className="text-sm text-zinc-400 mt-1">{beautyCenter.name}</p>
            </div>
            <Link
              href="/owner/beauty-center"
              className="flex items-center gap-2 px-3 py-2 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors text-sm text-zinc-400"
            >
              <Settings size={15} />
              İşletme Ayarları
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Bugünkü Randevular */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-950/50 rounded-lg flex items-center justify-center">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Bugünkü Randevular</p>
                <p className="text-2xl font-bold text-zinc-100">{stats.todayAppointments}</p>
              </div>
            </div>
          </div>

          {/* Bekleyen Onaylar */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-950/50 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Bekleyen Onay</p>
                <p className="text-2xl font-bold text-zinc-100">{stats.pendingAppointments}</p>
              </div>
            </div>
          </div>

          {/* Bu Hafta */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-950/50 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Bu Hafta</p>
                <p className="text-2xl font-bold text-zinc-100">{stats.weekAppointments}</p>
              </div>
            </div>
          </div>

          {/* Toplam Hizmet */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-950/50 rounded-lg flex items-center justify-center">
                <Settings className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Toplam Hizmet</p>
                <p className="text-2xl font-bold text-zinc-100">{stats.totalServices}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol taraf - Bugünkü Randevular */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-zinc-100">Bugünkü Randevular</h3>
              <Link
                href="/owner/appointments"
                className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1"
              >
                Tümünü Gör
                <ArrowRight size={14} />
              </Link>
            </div>

            {todayAppointments.length > 0 ? (
              <div className="space-y-4">
                {todayAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment._id} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-950/50 rounded-full flex items-center justify-center">
                        <Users className="text-purple-600" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-100">{appointment.userId?.fullName}</p>
                        <p className="text-sm text-zinc-400">
                          {appointment.serviceSnapshot?.name} - {appointment.departmentId?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-zinc-100">
                        {new Date(appointment.startDateTime).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        appointment.status === 'approved' ? 'bg-green-950/50 text-green-400' :
                        appointment.status === 'pending' ? 'bg-yellow-950/50 text-yellow-400' :
                        'bg-zinc-700 text-zinc-300'
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
                <Calendar className="mx-auto text-zinc-600 mb-3" size={48} />
                <p className="text-zinc-400">Bugün randevu bulunmuyor</p>
              </div>
            )}
          </div>

          {/* Sağ taraf - Hızlı İşlemler ve İstatistikler */}
          <div className="space-y-6">
            {/* Hızlı İşlemler */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4">Hızlı İşlemler</h3>
              <div className="space-y-3">
                <Link
                  href="/owner/beauty-center"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <Building className="text-purple-600" size={20} />
                  <span className="text-zinc-300">İşletme Ayarları</span>
                </Link>
                <Link
                  href="/owner/departments"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <Settings className="text-blue-600" size={20} />
                  <span className="text-zinc-300">Departmanlar</span>
                </Link>
                <Link
                  href="/owner/appointments"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <Calendar className="text-green-600" size={20} />
                  <span className="text-zinc-300">Randevu Yönetimi</span>
                </Link>
              </div>
            </div>

            {/* Popüler Hizmetler */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4">Popüler Hizmetler</h3>
              {topServices.length > 0 ? (
                <div className="space-y-3">
                  {topServices.map(([serviceName, count], index) => (
                    <div key={serviceName} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          index === 0 ? 'bg-yellow-950/50 text-yellow-400' :
                          index === 1 ? 'bg-zinc-700 text-zinc-300' :
                          index === 2 ? 'bg-orange-950/50 text-orange-400' :
                          'bg-zinc-800 text-zinc-400'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="text-sm text-zinc-300">{serviceName}</span>
                      </div>
                      <span className="text-sm font-medium text-zinc-400">{count} randevu</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-400 text-sm">Henüz randevu verisi yok</p>
              )}
            </div>

            {/* Sistem Durumu */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4">Sistem Durumu</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Departman Sayısı</span>
                  <span className="font-medium text-zinc-100">{stats.totalDepartments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Aktif Hizmet</span>
                  <span className="font-medium text-zinc-100">{stats.totalServices}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Toplam Randevu</span>
                  <span className="font-medium text-zinc-100">{stats.totalAppointments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Onay Durumu</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    beautyCenter.isApproved ? 'bg-green-950/50 text-green-400' : 'bg-yellow-950/50 text-yellow-400'
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
  return <OwnerDashboardContent />
}
