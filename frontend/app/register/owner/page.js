// app/register/owner/page.jsx
'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useRegisterOwnerMutation } from '@/lib/services/authApi'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Building, ArrowLeft, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

export default function OwnerRegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const [registerOwner, { isLoading }] = useRegisterOwnerMutation()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const watchPassword = watch('password')

  const onSubmit = async (data) => {
    try {
      // Confirm password kontrolü
      if (data.password !== data.confirmPassword) {
        toast.error('Şifreler eşleşmiyor')
        return
      }

      // API'ye gönderilecek data (confirmPassword hariç)
      const ownerData = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone
      }

      const result = await registerOwner(ownerData).unwrap()
      toast.success('İşletme sahibi kaydı başarılı! Admin onayından sonra giriş yapabilirsiniz.')
      
      // Login sayfasına yönlendir
      router.push('/login')
    } catch (error) {
      toast.error(error.data?.message || 'Kayıt başarısız')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Back Button */}
        <div className="flex items-center mb-6">
          <Link 
            href="/login"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            Geri
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mb-4">
            <Building className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">İşletme Sahibi Kayıt</h1>
          <p className="text-gray-600 mt-2">Güzellik merkezinizi sisteme kaydedin</p>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Clock className="text-blue-600 mt-0.5" size={20} />
            <div>
              <h4 className="font-medium text-blue-900">Onay Süreci</h4>
              <p className="text-blue-800 text-sm mt-1">
                Kaydınız admin onayından sonra aktif olacak. Bu süreçte:
              </p>
              <ul className="text-blue-800 text-sm mt-2 space-y-1">
                <li>• İşletme bilgilerinizi girebilirsiniz</li>
                <li>• Admin onayından sonra müşteriler görebilir</li>
                <li>• Randevu almaya başlayabilirsiniz</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Ad Soyad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ad Soyad *
            </label>
            <input
              {...register('fullName', {
                required: 'Ad soyad zorunludur',
                minLength: { value: 2, message: 'En az 2 karakter olmalıdır' },
              })}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              placeholder="Ahmet Yılmaz"
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
            )}
          </div>

          {/* E-posta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-posta Adresi *
            </label>
            <input
              {...register('email', {
                required: 'E-posta adresi zorunludur',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Geçerli bir e-posta adresi giriniz',
                },
              })}
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              placeholder="ahmet@beautysalon.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Telefon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon Numarası *
            </label>
            <input
              {...register('phone', {
                required: 'Telefon numarası zorunludur',
                pattern: {
                  value: /^[0-9\s\-\+\(\)]+$/,
                  message: 'Geçerli bir telefon numarası giriniz',
                },
              })}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              placeholder="+90 555 123 4567"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Şifre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şifre *
            </label>
            <div className="relative">
              <input
                {...register('password', {
                  required: 'Şifre zorunludur',
                  minLength: { value: 6, message: 'Şifre en az 6 karakter olmalıdır' },
                })}
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Şifre Tekrar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şifre Tekrar *
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword', {
                  required: 'Şifre tekrarı zorunludur',
                  validate: (value) => {
                    if (watchPassword !== value) {
                      return 'Şifreler eşleşmiyor'
                    }
                  },
                })}
                type={showConfirmPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Kayıt yapılıyor...
              </div>
            ) : (
              'İşletme Sahibi Olarak Kayıt Ol'
            )}
          </button>
        </form>

        {/* Success Steps */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-xl">
          <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
            <CheckCircle size={18} />
            Kayıt Sonrası Adımlar
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-green-800 text-sm">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <span>Giriş yapın ve işletme bilgilerinizi tamamlayın</span>
            </div>
            <div className="flex items-center gap-3 text-green-800 text-sm">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <span>Departmanlarınızı ve hizmetlerinizi ekleyin</span>
            </div>
            <div className="flex items-center gap-3 text-green-800 text-sm">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <span>Admin onayından sonra müşteriler sizi görebilir</span>
            </div>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-gray-600">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}