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
      icon: <Shield className="text-red-600" size={24} />,
      title: 'Güvenlik',
      description: 'JWT token süresi, oturum yönetimi ve rate limiting ayarları.',
      items: ['JWT_SECRET ortam değişkeni ile yapılandırılır', 'Rate limit: 100 istek/15dk (genel), 5 giriş/15dk', 'HttpOnly secure cookie tabanlı kimlik doğrulama'],
    },
    {
      icon: <Mail className="text-blue-600" size={24} />,
      title: 'E-posta',
      description: 'Gmail SMTP ile e-posta bildirimleri.',
      items: ['EMAIL_USER ve EMAIL_PASS ortam değişkenleri ile yapılandırılır', 'Otomatik: randevu oluşturma, onay/red, hatırlatma', 'Gmail App Password kullanılmalıdır'],
    },
    {
      icon: <Bell className="text-yellow-600" size={24} />,
      title: 'Bildirimler',
      description: 'Otomatik randevu hatırlatmaları ve sistem bildirimleri.',
      items: ['Cron job: her gün 09:00\'da çalışır', 'Randevu hatırlatması: 24 saat öncesinde gönderilir', 'İptal edilen randevular 30 gün sonra otomatik silinir'],
    },
    {
      icon: <Database className="text-green-600" size={24} />,
      title: 'Veritabanı',
      description: 'MongoDB bağlantı ve koleksiyon ayarları.',
      items: ['MONGO_URI ortam değişkeni ile yapılandırılır', 'TTL index: iptal randevular 30 gün sonra otomatik silinir', 'Koleksiyonlar: Users, BeautyCenters, Appointments, Departments, Services, Comments'],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link href="/admin/dashboard" className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={20} />
          </Link>
          <Settings className="text-gray-600" size={24} />
          <h1 className="text-xl font-bold text-gray-900">Sistem Ayarları</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-yellow-800 text-sm">
            Sistem ayarları ortam değişkenleri (<code className="bg-yellow-100 px-1 rounded">.env</code>) aracılığıyla yapılandırılır.
            Değişiklik yapmak için sunucudaki <code className="bg-yellow-100 px-1 rounded">backend/.env</code> dosyasını güncelleyin ve servisi yeniden başlatın.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section) => (
            <div key={section.title} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  {section.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{section.title}</h3>
                  <p className="text-sm text-gray-500">{section.description}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
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
