'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { useMyBusiness, useUpdateBusinessHours } from '@/hooks/use-business-dashboard'
import type { BusinessHour } from '@/types'

const DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']

function useBusinessId() {
  return (useAuthStore.getState() as { user?: { businessId?: string } }).user?.businessId ?? ''
}

export default function CalismaSaatleriPage() {
  const businessId = useBusinessId()
  const { data: business, isLoading } = useMyBusiness(businessId || undefined)
  const { mutate: updateHours, isPending, isSuccess } = useUpdateBusinessHours(businessId)

  const [hours, setHours] = useState<BusinessHour[]>(
    DAYS.map((_, i) => ({
      dayOfWeek: i,
      isOpen: i >= 1 && i <= 5,
      openTime: '09:00',
      closeTime: '18:00',
      breakStart: '',
      breakEnd: '',
    }))
  )

  useEffect(() => {
    if (business?.businessHours && business.businessHours.length > 0) {
      const filled = DAYS.map((_, i) => {
        const bh = business.businessHours?.find((h) => h.dayOfWeek === i)
        return bh ?? { dayOfWeek: i, isOpen: false, openTime: '09:00', closeTime: '18:00' }
      })
      setHours(filled)
    }
  }, [business])

  function updateHour(i: number, field: keyof BusinessHour, value: string | boolean) {
    setHours((prev) => prev.map((h, idx) => idx === i ? { ...h, [field]: value } : h))
  }

  function handleSave() {
    updateHours(hours.map((h) => ({
      dayOfWeek: h.dayOfWeek,
      isOpen: h.isOpen,
      openTime: h.openTime,
      closeTime: h.closeTime,
      ...(h.breakStart ? { breakStart: h.breakStart } : {}),
      ...(h.breakEnd ? { breakEnd: h.breakEnd } : {}),
    })))
  }

  if (isLoading) return <div className="py-8 text-center text-gray-400 animate-pulse">Yükleniyor...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Çalışma Saatleri</h1>
        {isSuccess && <span className="text-sm text-green-600 font-medium">Kaydedildi ✓</span>}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="space-y-3">
          {DAYS.map((day, i) => (
            <div key={i} className="flex flex-wrap items-center gap-3 py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-2 w-32 shrink-0">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={hours[i]?.isOpen ?? false}
                    onChange={(e) => updateHour(i, 'isOpen', e.target.checked)}
                  />
                  <div className="h-5 w-9 rounded-full bg-gray-200 peer-checked:bg-blue-600 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
                </label>
                <span className={`text-sm font-medium ${hours[i]?.isOpen ? 'text-gray-900' : 'text-gray-400'}`}>{day}</span>
              </div>

              {hours[i]?.isOpen ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input type="time" value={hours[i]?.openTime ?? '09:00'}
                    onChange={(e) => updateHour(i, 'openTime', e.target.value)}
                    className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <span className="text-gray-400">—</span>
                  <input type="time" value={hours[i]?.closeTime ?? '18:00'}
                    onChange={(e) => updateHour(i, 'closeTime', e.target.value)}
                    className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <span className="text-xs text-gray-400 ml-2">Mola:</span>
                  <input type="time" value={hours[i]?.breakStart ?? ''}
                    onChange={(e) => updateHour(i, 'breakStart', e.target.value)}
                    className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <span className="text-gray-400">—</span>
                  <input type="time" value={hours[i]?.breakEnd ?? ''}
                    onChange={(e) => updateHour(i, 'breakEnd', e.target.value)}
                    className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ) : (
                <span className="text-sm text-gray-400">Kapalı</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-xl bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {isPending ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}
