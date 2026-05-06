'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Globe, Star, Clock, ChevronRight } from 'lucide-react'
import { useBusiness } from '@/hooks/use-businesses'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'

const DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']

export default function BusinessDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { data: business, isLoading } = useBusiness(slug)
  const [activeTab, setActiveTab] = useState<'services' | 'staff' | 'reviews' | 'about'>('services')

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 animate-pulse">
        <div className="h-48 rounded-xl bg-gray-200 mb-6" />
        <div className="h-8 rounded bg-gray-200 w-1/3 mb-4" />
        <div className="h-4 rounded bg-gray-200 w-1/2" />
      </div>
    )
  }

  if (!business) {
    return <div className="py-20 text-center text-gray-500">İşletme bulunamadı.</div>
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Cover */}
      <div className="relative h-56 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 mb-6">
        {business.coverImage && (
          <Image src={business.coverImage} alt={business.name} fill className="object-cover" />
        )}
        {business.logo && (
          <div className="absolute bottom-4 left-4 h-16 w-16 rounded-full border-3 border-white overflow-hidden bg-white shadow-md">
            <Image src={business.logo} alt={business.name} fill className="object-cover" />
          </div>
        )}
      </div>

      {/* Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
          {business.category && (
            <p className="text-gray-500 mt-1">{business.category.name}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
            {business.city && (
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{business.city}</span>
            )}
            {business.phone && (
              <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{business.phone}</span>
            )}
            {business.website && (
              <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                <Globe className="h-4 w-4" />Website
              </a>
            )}
          </div>
          {business.ratingCount > 0 && (
            <div className="mt-2 flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{business.ratingAverage.toFixed(1)}</span>
              <span className="text-gray-500">({business.ratingCount} yorum)</span>
            </div>
          )}
        </div>
        <Link
          href={`/rezervasyon/${business.slug}`}
          className="shrink-0 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition-colors text-center"
        >
          Randevu Al
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6 overflow-x-auto">
          {(['services', 'staff', 'reviews', 'about'] as const).map((tab) => {
            const labels = { services: 'Hizmetler', staff: 'Personel', reviews: 'Yorumlar', about: 'Hakkında' }
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {labels[tab]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab içerikleri */}
      {activeTab === 'services' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {business.services?.map((s) => (
            <Link
              key={s.id}
              href={`/rezervasyon/${business.slug}?serviceId=${s.id}`}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-400 hover:shadow-sm transition-all"
            >
              <div>
                <p className="font-medium text-gray-900">{s.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  <Clock className="inline h-3.5 w-3.5 mr-1" />{s.duration} dk
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-blue-600">₺{Number(s.price).toFixed(0)}</p>
                <ChevronRight className="h-4 w-4 text-gray-400 mt-1 ml-auto" />
              </div>
            </Link>
          ))}
          {!business.services?.length && <p className="text-gray-500 col-span-2">Henüz hizmet eklenmemiş.</p>}
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {business.staff?.map((s) => (
            <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-gray-100 overflow-hidden">
                {s.avatar ? <Image src={s.avatar} alt={s.name} width={64} height={64} className="object-cover" /> : (
                  <div className="flex h-full items-center justify-center text-2xl font-bold text-gray-400">
                    {s.name[0]}
                  </div>
                )}
              </div>
              <p className="font-medium text-gray-900">{s.name}</p>
              {s.specialization && <p className="text-sm text-gray-500 mt-0.5">{s.specialization}</p>}
            </div>
          ))}
          {!business.staff?.length && <p className="text-gray-500">Personel bilgisi yok.</p>}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {business.reviews?.map((r) => (
            <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {r.customer?.firstName} {r.customer?.lastName?.[0]}.
                  </p>
                  <div className="flex mt-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true, locale: tr })}
                </span>
              </div>
              {r.comment && <p className="mt-2 text-sm text-gray-600">{r.comment}</p>}
            </div>
          ))}
          {!business.reviews?.length && <p className="text-gray-500">Henüz yorum yapılmamış.</p>}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="space-y-4">
          {business.description && (
            <p className="text-gray-700 leading-relaxed">{business.description}</p>
          )}
          {business.address && (
            <p className="text-gray-600"><span className="font-medium">Adres: </span>{business.address}</p>
          )}
          {business.businessHours && business.businessHours.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Çalışma Saatleri</h3>
              <div className="space-y-1">
                {business.businessHours.map((h) => (
                  <div key={h.dayOfWeek} className="flex justify-between text-sm">
                    <span className="text-gray-600 w-28">{DAYS[h.dayOfWeek]}</span>
                    <span className={h.isOpen ? 'text-gray-900' : 'text-gray-400'}>
                      {h.isOpen ? `${h.openTime} — ${h.closeTime}` : 'Kapalı'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
