'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useBusinessServices, useCreateService, useUpdateService, useDeleteService } from '@/hooks/use-business-dashboard'
import type { Service } from '@/types'

interface ServiceFormData {
  name: string
  description: string
  duration: number
  price: number
}

// İleride businessId store'dan alınacak; şimdilik URL param veya user context ile
function useBusinessId() {
  return (useAuthStore.getState() as { user?: { businessId?: string } }).user?.businessId ?? ''
}

export default function HizmetlerPage() {
  const businessId = useBusinessId()
  const { data: services, isLoading } = useBusinessServices(businessId || undefined)
  const { mutate: create, isPending: creating } = useCreateService(businessId)
  const { mutate: update, isPending: updating } = useUpdateService(businessId)
  const { mutate: remove } = useDeleteService(businessId)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState<ServiceFormData>({ name: '', description: '', duration: 30, price: 0 })

  function openCreate() {
    setEditing(null)
    setForm({ name: '', description: '', duration: 30, price: 0 })
    setShowForm(true)
  }

  function openEdit(s: Service) {
    setEditing(s)
    setForm({ name: s.name, description: s.description ?? '', duration: s.duration, price: Number(s.price) })
    setShowForm(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editing) {
      update({ id: editing.id, ...form }, { onSuccess: () => setShowForm(false) })
    } else {
      create(form, { onSuccess: () => setShowForm(false) })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Hizmetler</h1>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" /> Hizmet Ekle
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{editing ? 'Hizmet Düzenle' : 'Yeni Hizmet'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hizmet Adı</label>
                <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Süre (dk)</label>
                  <input required type="number" min={5} max={480} value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat (₺)</label>
                  <input required type="number" min={0} step={0.01} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={creating || updating}
                  className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
                  {creating || updating ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : !services?.length ? (
        <div className="py-16 text-center text-gray-400">Henüz hizmet eklenmemiş.</div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Hizmet', 'Süre', 'Fiyat', 'Durum', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                    {s.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{s.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.duration} dk</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">₺{Number(s.price).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(s)} className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => remove(s.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
