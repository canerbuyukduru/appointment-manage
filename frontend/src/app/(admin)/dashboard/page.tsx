'use client'

import { Building2, Users, Calendar, DollarSign, Clock } from 'lucide-react'
import { useAdminStats, useAdminBusinesses, useApproveBusiness, useRejectBusiness } from '@/hooks/use-admin'
import { Badge } from '@/components/ui/badge'

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats()
  const { data: pendingData } = useAdminBusinesses({ status: 'pending', limit: 10 })
  const { mutate: approve } = useApproveBusiness()
  const { mutate: reject } = useRejectBusiness()

  const pendingBusinesses = pendingData?.data ?? []

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 mb-8">
        {[
          { icon: Building2, label: 'Toplam İşletme', value: stats?.totalBusinesses ?? '—', color: 'blue' },
          { icon: Clock, label: 'Onay Bekleyen', value: stats?.pendingBusinesses ?? '—', color: 'yellow' },
          { icon: Users, label: 'Toplam Üye', value: stats?.totalUsers ?? '—', color: 'purple' },
          { icon: Calendar, label: 'Bu Ay Randevu', value: stats?.totalAppointments ?? '—', color: 'green' },
          { icon: DollarSign, label: 'Bu Ay Gelir', value: stats ? `₺${stats.totalRevenue.toFixed(0)}` : '—', color: 'emerald' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className={`inline-flex rounded-lg p-2 mb-3 bg-${color}-50 text-${color}-600`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{statsLoading ? '...' : String(value)}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Onay bekleyenler */}
      {pendingBusinesses.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
            <h2 className="font-semibold text-gray-900">Onay Bekleyen İşletmeler</h2>
            <Badge variant="warning">{pendingBusinesses.length}</Badge>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingBusinesses.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-5 py-3 gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{b.name}</p>
                  <p className="text-xs text-gray-500">{b.city} · {b.owner?.email}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => approve(b.id)} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors">Onayla</button>
                  <button onClick={() => reject({ id: b.id })} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors">Reddet</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
