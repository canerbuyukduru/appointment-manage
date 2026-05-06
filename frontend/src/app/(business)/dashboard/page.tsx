'use client'

import { Calendar, DollarSign, Users, Star } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useBusinessAppointments } from '@/hooks/use-business-dashboard'
import { useConfirmAppointment, useCompleteAppointment } from '@/hooks/use-business-dashboard'
import { AppointmentStatusBadge } from '@/components/shared/appointment-status-badge'

export default function BusinessDashboardPage() {
  const { user } = useAuthStore()
  const today = new Date().toISOString().split('T')[0]

  // İşletme ID'sini JWT payload'undan alıyoruz (ileride businessId store'a eklenebilir)
  const { data: appointments, isLoading } = useBusinessAppointments({
    fromDate: today,
    toDate: today,
    limit: 20,
  })

  const { mutate: confirm } = useConfirmAppointment()
  const { mutate: complete } = useCompleteAppointment()

  const items = appointments?.data ?? []
  const todayCount = items.length
  const todayRevenue = items
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => sum + Number(a.totalPrice), 0)

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        <StatCard icon={Calendar} label="Bugünkü Randevular" value={String(todayCount)} color="blue" />
        <StatCard icon={DollarSign} label="Bugünkü Gelir" value={`₺${todayRevenue.toFixed(0)}`} color="green" />
        <StatCard icon={Users} label="Bekleyen" value={String(items.filter((a) => a.status === 'pending').length)} color="yellow" />
        <StatCard icon={Star} label="Tamamlanan" value={String(items.filter((a) => a.status === 'completed').length)} color="purple" />
      </div>

      {/* Bugünkü randevular */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Bugünkü Randevular</h2>
        </div>
        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-gray-400">Bugün randevu yok.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between px-5 py-3 gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {apt.customer?.firstName} {apt.customer?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{apt.service?.name} • {apt.startTime} — {apt.endTime}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <AppointmentStatusBadge status={apt.status} />
                  {apt.status === 'pending' && (
                    <button
                      onClick={() => confirm(apt.id)}
                      className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      Onayla
                    </button>
                  )}
                  {apt.status === 'started' && (
                    <button
                      onClick={() => complete(apt.id)}
                      className="rounded-lg bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                    >
                      Tamamla
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className={`inline-flex rounded-lg p-2 mb-3 ${colors[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}
