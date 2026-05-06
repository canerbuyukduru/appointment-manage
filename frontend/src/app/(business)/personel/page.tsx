'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useBusinessStaff, useCreateStaff, useUpdateStaff, useDeleteStaff, useUpdateStaffHours } from '@/hooks/use-business-dashboard'
import type { Staff, StaffWorkingHour } from '@/types'

const DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']

function useBusinessId() {
  return (useAuthStore.getState() as { user?: { businessId?: string } }).user?.businessId ?? ''
}

export default function PersonelPage() {
  const businessId = useBusinessId()
  const { data: staff, isLoading } = useBusinessStaff(businessId || undefined)
  const { mutate: create, isPending: creating } = useCreateStaff(businessId)
  const { mutate: update, isPending: updating } = useUpdateStaff(businessId)
  const { mutate: remove } = useDeleteStaff(businessId)

  const [showForm, setShowForm] = useState(false)
  const [editingHours, setEditingHours] = useState<Staff | null>(null)
  const [editing, setEditing] = useState<Staff | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', specialization: '', bio: '' })

  const [hours, setHours] = useState<StaffWorkingHour[]>(
    DAYS.map((_, i) => ({ dayOfWeek: i, isAvailable: i >= 1 && i <= 5, startTime: '09:00', endTime: '18:00' }))
  )

  const { mutate: updateHours, isPending: savingHours } = useUpdateStaffHours(businessId, editingHours?.id ?? '')

  function openCreate() {
    setEditing(null)
    setForm({ name: '', email: '', phone: '', specialization: '', bio: '' })
    setShowForm(true)
  }

  function openEdit(s: Staff) {
    setEditing(s)
    setForm({ name: s.name, email: s.email ?? '', phone: s.phone ?? '', specialization: s.specialization ?? '', bio: s.bio ?? '' })
    setShowForm(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data = { name: form.name, email: form.email || undefined, phone: form.phone || undefined, specialization: form.specialization || undefined, bio: form.bio || undefined }
    if (editing) {
      update({ id: editing.id, ...data }, { onSuccess: () => setShowForm(false) })
    } else {
      create(data, { onSuccess: () => setShowForm(false) })
    }
  }

  function openHoursEdit(s: Staff) {
    setEditingHours(s)
    if (s.workingHours && s.workingHours.length > 0) {
      const filled = DAYS.map((_, i) => {
        const wh = s.workingHours?.find((w) => w.dayOfWeek === i)
        return wh ?? { dayOfWeek: i, isAvailable: false, startTime: '09:00', endTime: '18:00' }
      })
      setHours(filled)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Personel</h1>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Personel Ekle
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{editing ? 'Personel Düzenle' : 'Yeni Personel'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                { key: 'name', label: 'Ad Soyad', required: true },
                { key: 'email', label: 'E-posta' },
                { key: 'phone', label: 'Telefon' },
                { key: 'specialization', label: 'Uzmanlık' },
              ].map(({ key, label, required }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type="text"
                    required={required}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={creating || updating} className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
                  {creating || updating ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50">İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Çalışma Saatleri Modal */}
      {editingHours && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{editingHours.name} — Çalışma Saatleri</h2>
            <div className="space-y-2">
              {DAYS.map((day, i) => (
                <div key={i} className="flex items-center gap-3">
                  <label className="flex items-center gap-2 w-28 shrink-0">
                    <input
                      type="checkbox"
                      checked={hours[i]?.isAvailable ?? false}
                      onChange={(e) => setHours(hours.map((h, idx) => idx === i ? { ...h, isAvailable: e.target.checked } : h))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">{day}</span>
                  </label>
                  {hours[i]?.isAvailable && (
                    <>
                      <input type="time" value={hours[i]?.startTime ?? '09:00'}
                        onChange={(e) => setHours(hours.map((h, idx) => idx === i ? { ...h, startTime: e.target.value } : h))}
                        className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <span className="text-gray-400 text-sm">—</span>
                      <input type="time" value={hours[i]?.endTime ?? '18:00'}
                        onChange={(e) => setHours(hours.map((h, idx) => idx === i ? { ...h, endTime: e.target.value } : h))}
                        className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => updateHours(hours, { onSuccess: () => setEditingHours(null) })}
                disabled={savingHours}
                className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {savingHours ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              <button onClick={() => setEditingHours(null)} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50">İptal</button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : !staff?.length ? (
        <div className="py-16 text-center text-gray-400">Henüz personel eklenmemiş.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((s) => (
            <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                    {s.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                    {s.specialization && <p className="text-xs text-gray-500">{s.specialization}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(s)} className="p-1 text-gray-400 hover:text-blue-600 transition-colors"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => remove(s.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <button onClick={() => openHoursEdit(s)} className="w-full rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
                Çalışma Saatleri
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
