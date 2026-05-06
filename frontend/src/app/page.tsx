'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Calendar, Star, ArrowRight, Zap, Shield, Clock } from 'lucide-react'
import { useCategories } from '@/hooks/use-businesses'

const steps = [
  {
    icon: Search,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    title: '1. Ara',
    desc: 'İstediğiniz hizmeti ve şehri girerek işletmeleri listeleyin.',
  },
  {
    icon: Star,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    title: '2. Seç',
    desc: 'Yorumları okuyun, değerlendirmeleri inceleyin, hizmet seçin.',
  },
  {
    icon: Calendar,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    title: '3. Randevu Al',
    desc: 'Uygun tarih ve saati seçin, online ödeyin.',
  },
]

const stats = [
  { value: '10K+', label: 'Aktif İşletme' },
  { value: '250K+', label: 'Alınan Randevu' },
  { value: '4.9', label: 'Ortalama Puan' },
  { value: '7/24', label: 'Erişilebilirlik' },
]

export default function HomePage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const { data: categories } = useCategories()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (city) params.set('city', city)
    router.push(`/isletmeler?${params.toString()}`)
  }

  return (
    <main className="bg-gray-950">
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-24 px-4">
        {/* Arka plan glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-amber-500/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 mb-6">
            <Zap className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-xs font-medium text-blue-300">Türkiye'nin en hızlı randevu platformu</span>
          </div>

          <h1 className="text-5xl font-bold text-white sm:text-6xl leading-tight tracking-tight">
            Online Randevu,{' '}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Kolay Yönetim
            </span>
          </h1>
          <p className="mt-5 text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
            Berber, güzellik salonu, psikolog ve daha fazlası için anında randevu alın.
          </p>

          <form onSubmit={handleSearch} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Ne arıyorsunuz? (berber, masaj...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-gray-900 pl-11 pr-4 py-3.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <input
              type="text"
              placeholder="Şehir"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all sm:w-36"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25 whitespace-nowrap"
            >
              <Search className="h-4 w-4" />
              Ara
            </button>
          </form>

          <p className="mt-4 text-xs text-gray-600">Berber · Güzellik Salonu · Psikolog · Fizyoterapist · Diş Hekimi</p>
        </div>
      </section>

      {/* İstatistikler */}
      <section className="border-y border-gray-800 bg-gray-900/50 py-8 px-4">
        <div className="mx-auto max-w-4xl grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Kategoriler */}
      {categories && categories.length > 0 && (
        <section className="py-16 px-4">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-white">Kategoriler</h2>
              <p className="text-gray-500 mt-2 text-sm">İhtiyacınıza göre hizmet kategorisi seçin</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/isletmeler?categoryId=${cat.id}`}
                  className="flex flex-col items-center gap-2.5 rounded-xl border border-gray-800 bg-gray-900 p-4 text-center hover:border-blue-500/50 hover:bg-gray-800 transition-all group"
                >
                  {cat.icon && <span className="text-3xl">{cat.icon}</span>}
                  <span className="text-xs font-medium text-gray-400 group-hover:text-gray-200 transition-colors">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Nasıl Çalışır */}
      <section className="py-16 px-4 bg-gray-900/30">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white">Nasıl Çalışır?</h2>
            <p className="text-gray-500 mt-2 text-sm">3 adımda randevu alın</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.title} className={`rounded-2xl border ${s.bg} p-6 text-center`}>
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${s.bg} mb-4`}>
                  <s.icon className={`h-6 w-6 ${s.color}`} />
                </div>
                <h3 className="font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Özellikler */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white">Neden Randevu Sistemi?</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: Zap, title: 'Anında Onay', desc: 'Randevunuz anında onaylanır, SMS ve e-posta ile bildirim alırsınız.', color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { icon: Shield, title: 'Güvenli Ödeme', desc: 'Stripe ile güvenli ödeme. Kart bilgileriniz asla saklanmaz.', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { icon: Clock, title: '7/24 Erişim', desc: 'Gece yarısı da randevu alabilirsiniz. İşletme kapalıyken bile.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${f.bg} mb-4`}>
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-900 to-gray-950 p-12">
            <h2 className="text-3xl font-bold text-white mb-4">İşletmenizi Platforma Ekleyin</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Müşterileriniz online randevu alsın, siz takvimi kolayca yönetin. Ücretsiz başlayın.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/kayit-ol"
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 font-semibold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25"
              >
                Ücretsiz Başla
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/isletmeler"
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-800/60 px-8 py-3.5 font-semibold text-gray-200 hover:bg-gray-800 hover:border-gray-600 transition-all"
              >
                İşletmeleri Keşfet
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
