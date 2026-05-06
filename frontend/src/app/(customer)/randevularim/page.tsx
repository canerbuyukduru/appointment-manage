'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, User } from 'lucide-react'
import { useAppointments, useCancelAppointment } from '@/hooks/use-appointments'
import { AppointmentStatusBadge } from '@/components/shared/appointment-status-badge'
import { useAuthStore } from '@/store/auth.store'
import type { AppointmentStatus } from '@/types'

type Tab = 'upcoming' | 'past' | 'cancelled'

const tabStatus: Record<Tab, AppointmentStatus[]> = {
  upcoming: ['pending', 'confirmed', 'started'],
  past: ['completed', 'no_show'],
  cancelled: ['cancelled_by_customer', 'cancelled_by_business'],
}

export default function RandevularimPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>('upcoming')
  const [cancelId, setCancelId] = useState<string | null>(null)

  const { data, isLoading, refetch } = useAppointments({})
  const { mutate: cancelAppointment, isPending: cancelling } = useCancelAppointment()

  if (!isAuthenticated) {
    router.push('/giris')
    return null
  }

  const allItems = data?.data ?? []
  const items = allItems.filter((a) => (tabStatus[activeTab] as string[]).includes(a.status))

  function handleCancel(id: string) {
    cancelAppointment({ id }, {
      onSuccess: () => {
        setCancelId(null)
        refetch()
      },
    })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Randevularım</h1>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 mb-6">
        {(['upcoming', 'past', 'cancelled'] as Tab[]).map((tab) => {
          const labels = { upcoming: 'Yaklaşan', past: 'Geçmiş', cancelled: 'İptal' }
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${activeTab === tab ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {labels[tab]}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse">
              <div className="h-5 rounded bg-gray-200 w-1/3 mb-3" />
              <div className="h-4 rounded bg-gray-200 w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p>Bu kategoride randevu bulunmuyor.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((apt) => (
            <div key={apt.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 truncate">{apt.business?.name}</p>
                    <AppointmentStatusBadge status={apt.status} />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{apt.service?.name}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(apt.appointmentDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {apt.startTime} — {apt.endTime}
                    </span>
                    {apt.staff && (
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {apt.staff.name}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-blue-600">₺{Number(apt.totalPrice).toFixed(2)}</p>
                </div>
              </div>

              {['pending', 'confirmed'].includes(apt.status) && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  {cancelId === apt.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCancel(apt.id)}
                        disabled={cancelling}
                        className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        {cancelling ? 'İptal ediliyor...' : 'Evet, İptal Et'}
                      </button>
                      <button
                        onClick={() => setCancelId(null)}
                        className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Vazgeç
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setCancelId(apt.id)}
                      className="text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      İptal Et
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
