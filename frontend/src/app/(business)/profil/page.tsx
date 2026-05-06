'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { useMyBusiness, useUpdateBusiness } from '@/hooks/use-business-dashboard'
import { useCategories } from '@/hooks/use-businesses'
import { Badge } from '@/components/ui/badge'

function useBusinessId() {
  return (useAuthStore.getState() as { user?: { businessId?: string } }).user?.businessId ?? ''
}

export default function ProfilPage() {
  const businessId = useBusinessId()
  const { data: business, isLoading } = useMyBusiness(businessId || undefined)
  const { mutate: update, isPending, isSuccess } = useUpdateBusiness(businessId)
  const { data: categories } = useCategories()

  const [form, setForm] = useState({
    name: '', categoryId: '', description: '', address: '', city: '', phone: '', email: '', website: '',
  })

  useEffect(() => {
    if (business) {
      setForm({
        name: business.name ?? '',
        categoryId: business.categoryId ?? '',
        description: business.description ?? '',
        address: business.address ?? '',
        city: business.city ?? '',
        phone: business.phone ?? '',
        email: business.email ?? '',
        website: business.website ?? '',
      })
    }
  }, [business])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    update({ name: form.name, categoryId: form.categoryId, description: form.description, address: form.address, city: form.city, phone: form.phone, email: form.email || undefined, website: form.website || undefined })
  }

  if (isLoading) return <div className="py-8 text-center text-gray-400 animate-pulse">Yükleniyor...</div>

  const statusConfig: Record<string, { label: string; variant: 'warning' | 'default' | 'success' | 'error' }> = {
    pending: { label: 'Onay Bekliyor', variant: 'warning' },
    active: { label: 'Aktif', variant: 'success' },
    suspended: { label: 'Askıya Alındı', variant: 'error' },
    rejected: { label: 'Reddedildi', variant: 'error' },
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">İşletme Profili</h1>
        {business?.status && (
          <Badge variant={statusConfig[business.status]?.variant}>
            {statusConfig[business.status]?.label}
          </Badge>
        )}
      </div>

      {business?.status === 'pending' && (
        <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
          İşletmeniz inceleme sürecindedir. Onaylandığında müşteriler sizi görebilecek.
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-5 space-y-4 max-w-2xl">
        {isSuccess && <p className="text-sm text-green-600 font-medium">Değişiklikler kaydedildi ✓</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">İşletme Adı</label>
            <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seçiniz</option>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { key: 'address', label: 'Adres' },
            { key: 'city', label: 'Şehir' },
            { key: 'phone', label: 'Telefon' },
            { key: 'email', label: 'E-posta' },
            { key: 'website', label: 'Website' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type="text" value={form[key as keyof typeof form]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
        </div>

        <div className="pt-2">
          <button type="submit" disabled={isPending}
            className="rounded-xl bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors">
            {isPending ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  )
}
