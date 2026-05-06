'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useAdminBusinesses, useApproveBusiness, useRejectBusiness, useSuspendBusiness } from '@/hooks/use-admin'
import { Badge } from '@/components/ui/badge'

const statusConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'error' | 'secondary' }> = {
  pending: { label: 'Bekliyor', variant: 'warning' },
  active: { label: 'Aktif', variant: 'success' },
  suspended: { label: 'Askıda', variant: 'error' },
  rejected: { label: 'Reddedildi', variant: 'secondary' },
}

export default function AdminIsletmelerPage() {
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useAdminBusinesses({ status: status || undefined, search: search || undefined, page, limit: 20 })
  const { mutate: approve } = useApproveBusiness()
  const { mutate: reject } = useRejectBusiness()
  const { mutate: suspend } = useSuspendBusiness()

  const items = data?.data ?? []
  const meta = data?.meta

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">İşletme Yönetimi</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="İşletme ara..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tüm Durumlar</option>
          <option value="pending">Bekliyor</option>
          <option value="active">Aktif</option>
          <option value="suspended">Askıda</option>
          <option value="rejected">Reddedildi</option>
        </select>
        {meta && <span className="flex items-center text-sm text-gray-500">Toplam: {meta.total}</span>}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 rounded-lg bg-gray-100 animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-gray-400">İşletme bulunamadı.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['İşletme', 'Sahibi', 'Şehir', 'Kategori', 'Durum', 'Kayıt', 'İşlem'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {items.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{b.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {b.owner?.firstName} {b.owner?.lastName}
                      <br /><span className="text-xs text-gray-400">{b.owner?.email}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{b.city ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{b.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={statusConfig[b.status]?.variant ?? 'secondary'}>
                        {statusConfig[b.status]?.label ?? b.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {b.createdAt ? format(new Date(b.createdAt), 'd MMM yyyy', { locale: tr }) : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        {b.status === 'pending' && (
                          <>
                            <button onClick={() => approve(b.id)} className="text-xs font-medium text-green-600 hover:text-green-800">Onayla</button>
                            <button onClick={() => reject({ id: b.id })} className="text-xs font-medium text-red-600 hover:text-red-800">Reddet</button>
                          </>
                        )}
                        {b.status === 'active' && (
                          <button onClick={() => suspend(b.id)} className="text-xs font-medium text-orange-600 hover:text-orange-800">Askıya Al</button>
                        )}
                        {b.status === 'suspended' && (
                          <button onClick={() => approve(b.id)} className="text-xs font-medium text-green-600 hover:text-green-800">Aktifleştir</button>
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
