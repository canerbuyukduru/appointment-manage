'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { BusinessCard } from '@/components/business/business-card'
import { useBusinesses, useCategories } from '@/hooks/use-businesses'

export default function BusinessesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '')
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)

  const { data, isLoading } = useBusinesses({ search, city, categoryId, page, limit: 12 })
  const { data: categories } = useCategories()

  function applyFilter() {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (city) params.set('city', city)
    if (categoryId) params.set('categoryId', categoryId)
    params.set('page', '1')
    router.push(`/isletmeler?${params.toString()}`)
    setPage(1)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') applyFilter()
  }

  const items = data?.data ?? []
  const meta = data?.meta
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 1

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Filtreler */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-5">
              <SlidersHorizontal className="h-4 w-4 text-gray-400" />
              <h2 className="font-semibold text-white">Filtreler</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Arama</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="İşletme veya hizmet"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 pl-9 pr-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Şehir</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="İstanbul, Ankara..."
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Kategori</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                >
                  <option value="">Tümü</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={applyFilter}
                className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
              >
                Filtrele
              </button>

              {(search || city || categoryId) && (
                <button
                  onClick={() => { setSearch(''); setCity(''); setCategoryId(''); router.push('/isletmeler') }}
                  className="w-full rounded-lg border border-gray-700 py-2 text-xs font-medium text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-all"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Liste */}
        <div className="flex-1">
          <div className="mb-5 flex items-center justify-between">
            <h1 className="text-lg font-semibold text-white">
              {meta ? (
                <span>{meta.total} <span className="text-gray-400 font-normal">işletme bulundu</span></span>
              ) : 'İşletmeler'}
            </h1>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-gray-800 bg-gray-900 p-4 animate-pulse">
                  <div className="h-40 rounded-xl bg-gray-800 mb-4" />
                  <div className="h-4 rounded bg-gray-800 mb-2 w-3/4" />
                  <div className="h-3 rounded bg-gray-800 w-1/2" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-gray-800 bg-gray-900">
              <div className="h-16 w-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-600" />
              </div>
              <p className="text-lg font-semibold text-gray-300">Sonuç bulunamadı</p>
              <p className="text-sm text-gray-500 mt-1">Farklı filtreler deneyin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((b) => <BusinessCard key={b.id} business={b} />)}
            </div>
          )}

          {/* Pagination */}
          {meta && meta.total > meta.limit && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-medium text-gray-300 disabled:opacity-30 hover:bg-gray-800 hover:border-gray-600 transition-all"
              >
                Önceki
              </button>
              <span className="px-4 py-2 text-sm text-gray-400">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-medium text-gray-300 disabled:opacity-30 hover:bg-gray-800 hover:border-gray-600 transition-all"
              >
                Sonraki
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
