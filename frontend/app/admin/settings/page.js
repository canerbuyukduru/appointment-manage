'use client'
import { useGetCurrentUserQuery } from '@/lib/services/authApi'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Settings, ArrowLeft, Shield, Bell, Database, Mail } from 'lucide-react'
import Link from 'next/link'

export default function AdminSettingsPage() {
  const router = useRouter()
  const { data: currentUser, isLoading: userLoading } = useGetCurrentUserQuery()

  useEffect(() => {
    if (!userLoading && (!currentUser || currentUser.role !== 'admin')) {
      router.push('/admin/login')
    }
  }, [currentUser, userLoading, router])

  if (userLoading) return null

  const sections = [
    {
      icon: <Shield className="text-red-400" size={24} />,
      title: 'Güvenlik',
      description: 'JWT token süresi, oturum yönetimi ve rate limiting ayarları.',
      items: ['JWT_SECRET ortam değişkeni ile yapılandırılır', 'Rate limit: 100 istek/15dk (genel), 5 giriş/15dk', 'HttpOnly secure cookie tabanlı kimlik doğrulama'],
    },
    {
      icon: <Mail className="text-blue-400" size={24} />,
      title: 'E-posta',
      description: 'Gmail SMTP ile e-posta bildirimleri.',
      items: ['EMAIL_USER ve EMAIL_PASS ortam değişkenleri ile yapılandırılır', 'Otomatik: randevu oluşturma, onay/red, hatırlatma', 'Gmail App Password kullanılmalıdır'],
    },
    {
      icon: <Bell className="text-yellow-400" size={24} />,
      title: 'Bildirimler',
      description: 'Otomatik randevu hatırlatmaları ve sistem bildirimleri.',
      items: ["Cron job: her gün 09:00'da çalışır", 'Randevu hatırlatması: 24 saat öncesinde gönderilir', 'İptal edilen randevular 30 gün sonra otomatik silinir'],
    },
    {
      icon: <Database className="text-green-400" size={24} />,
      title: 'Veritabanı',
      description: 'MongoDB bağlantı ve koleksiyon ayarları.',
      items: ['MONGO_URI ortam değişkeni ile yapılandırılır', 'TTL index: iptal randevular 30 gün sonra otomatik silinir', 'Koleksiyonlar: Users, BeautyCenters, Appointments, Departments, Services, Comments'],
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link href="/admin/dashboard" className="p-2 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <Settings className="text-zinc-400" size={24} />
          <h1 className="text-xl font-bold text-zinc-100">Sistem Ayarları</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 bg-yellow-950/30 border border-yellow-900 rounded-xl p-4">
          <p className="text-yellow-400 text-sm">
            Sistem ayarları ortam değişkenleri (<code className="bg-yellow-950/50 px-1 rounded text-yellow-300">.env</code>) aracılığıyla yapılandırılır.
            Değişiklik yapmak için sunucudaki <code className="bg-yellow-950/50 px-1 rounded text-yellow-300">backend/.env</code> dosyasını güncelleyin ve servisi yeniden başlatın.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section) => (
            <div key={section.title} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
                  {section.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100">{section.title}</h3>
                  <p className="text-sm text-zinc-500">{section.description}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-zinc-600 rounded-full flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
