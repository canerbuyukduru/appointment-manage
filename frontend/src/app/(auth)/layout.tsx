import type { Metadata } from 'next'
import { Calendar, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: {
    template: '%s | Randevu Sistemi',
    default: 'Randevu Sistemi',
  },
}

const features = [
  'Online randevu alma ve yönetimi',
  'Otomatik hatırlatma bildirimleri',
  'Çoklu şube ve personel desteği',
  'Detaylı analiz ve raporlar',
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* Sol panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-2/5 flex-col justify-between p-12 relative overflow-hidden bg-gray-900 border-r border-gray-800">
        {/* Glow efektleri */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-100px] left-[-100px] w-80 h-80 rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute bottom-[-80px] right-[-60px] w-64 h-64 rounded-full bg-blue-500/8 blur-3xl" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 mb-16">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Randevu<span className="text-blue-400">.</span>
            </span>
          </Link>

          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Randevularınızı<br />
            <span className="text-blue-400">kolayca yönetin</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-10">
            İşletmeniz için akıllı randevu sistemi. Müşterileriniz 7/24 randevu alabilsin,
            siz de takvimi kolayca takip edin.
          </p>

          <ul className="space-y-4">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600/20 flex-shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                </div>
                <span className="text-sm text-gray-300">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10">
          <div className="rounded-2xl border border-gray-700 bg-gray-800/50 p-5">
            <p className="text-sm text-gray-300 italic leading-relaxed">
              "Randevu Sistemi sayesinde müşteri sayımız %40 arttı. Online ödeme özelliği harika!"
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">M</div>
              <div>
                <p className="text-sm font-semibold text-white">Mehmet K.</p>
                <p className="text-xs text-gray-500">İstanbul Kuaför</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sağ panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobil logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Randevu<span className="text-blue-400">.</span></span>
          </Link>

          {children}
        </div>
      </div>
    </div>
  )
}
