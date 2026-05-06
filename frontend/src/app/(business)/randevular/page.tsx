'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useBusinessAppointments, useConfirmAppointment, useCompleteAppointment, useCancelBusinessAppointment, useMarkNoShow } from '@/hooks/use-business-dashboard'
import { AppointmentStatusBadge } from '@/components/shared/appointment-status-badge'
import type { AppointmentStatus } from '@/types'

export default function BusinessAppointmentsPage() {
  const [status, setStatus] = useState<string>('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useBusinessAppointments({ status: status || undefined, page, limit: 20 })
  const { mutate: confirm } = useConfirmAppointment()
  const { mutate: complete } = useCompleteAppointment()
  const { mutate: cancel } = useCancelBusinessAppointment()
  const { mutate: noShow } = useMarkNoShow()

  const items = data?.data ?? []
  const meta = data?.meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Randevular</h1>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tüm Durumlar</option>
          <option value="pending">Bekliyor</option>
          <option value="confirmed">Onaylandı</option>
          <option value="started">Başladı</option>
          <option value="completed">Tamamlandı</option>
          <option value="cancelled_by_customer">İptal (Müşteri)</option>
          <option value="cancelled_by_business">İptal (İşletme)</option>
          <option value="no_show">Gelmedi</option>
        </select>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 rounded-lg bg-gray-100 animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-gray-400">Randevu bulunamadı.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Müşteri', 'Hizmet', 'Personel', 'Tarih / Saat', 'Fiyat', 'Durum', 'İşlem'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {items.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {apt.customer?.firstName} {apt.customer?.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{apt.service?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{apt.staff?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {format(new Date(apt.appointmentDate), 'd MMM yyyy', { locale: tr })} {apt.startTime}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      ₺{Number(apt.totalPrice).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <AppointmentStatusBadge status={apt.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        {apt.status === 'pending' && (
                          <button onClick={() => confirm(apt.id)} className="text-xs font-medium text-blue-600 hover:text-blue-800">Onayla</button>
                        )}
                        {apt.status === 'confirmed' && (
                          <>
                            <button onClick={() => noShow(apt.id)} className="text-xs font-medium text-gray-500 hover:text-gray-700">No-Show</button>
                            <button onClick={() => cancel({ id: apt.id })} className="text-xs font-medium text-red-600 hover:text-red-800">İptal</button>
                          </>
                        )}
                        {apt.status === 'started' && (
                          <button onClick={() => complete(apt.id)} className="text-xs font-medium text-green-600 hover:text-green-800">Tamamla</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {meta && meta.total > meta.limit && (
        <div className="mt-4 flex justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-40 hover:bg-gray-50">Önceki</button>
          <span className="flex items-center px-4 text-sm text-gray-600">{page} / {Math.ceil(meta.total / meta.limit)}</span>
          <button disabled={page >= Math.ceil(meta.total / meta.limit)} onClick={() => setPage(page + 1)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-40 hover:bg-gray-50">Sonraki</button>
        </div>
      )}
    </div>
  )
}
