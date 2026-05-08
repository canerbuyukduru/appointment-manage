'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useRegisterOwnerMutation } from '@/lib/services/authApi'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Building, ArrowLeft, CheckCircle, Clock, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { getErrorMessage, getToastDuration } from '@/lib/utils/errorMessages'

export default function OwnerRegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const [registerOwner, { isLoading }] = useRegisterOwnerMutation()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const watchPassword = watch('password')

  const onSubmit = async (data) => {
    try {
      if (data.password !== data.confirmPassword) {
        toast.error('Şifreler eşleşmiyor')
        return
      }
      const ownerData = { fullName: data.fullName, email: data.email, password: data.password, phone: data.phone }
      await registerOwner(ownerData).unwrap()
      toast.success('İşletme sahibi kaydı başarılı! Admin onayından sonra giriş yapabilirsiniz.')
      router.push('/login')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Kayıt başarısız'), { duration: getToastDuration(error) })
    }
  }

  const inputClass = "w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="text-xl font-bold text-zinc-50">BeautyBook</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8">
          <Link href="/login" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 mb-6 transition-colors text-sm">
            <ArrowLeft size={16} />
            Geri
          </Link>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl mb-4 shadow-lg shadow-purple-900/40">
              <Building className="text-white" size={26} />
            </div>
            <h1 className="text-2xl font-bold text-zinc-50">İşletme Sahibi Kayıt</h1>
            <p className="text-zinc-400 text-sm mt-1">Güzellik merkezinizi sisteme kaydedin</p>
          </div>

          {/* Bilgi Kartı */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Clock className="text-purple-400 mt-0.5 shrink-0" size={18} />
              <div>
                <h4 className="font-semibold text-zinc-200 text-sm">Onay Süreci</h4>
                <p className="text-zinc-400 text-xs mt-1">
                  Kaydınız admin onayından sonra aktif olacak.
                </p>
                <ul className="text-zinc-400 text-xs mt-2 space-y-0.5">
                  <li>• İşletme bilgilerinizi girebilirsiniz</li>
                  <li>• Admin onayından sonra müşteriler görebilir</li>
                  <li>• Randevu almaya başlayabilirsiniz</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Ad Soyad *</label>
              <input
                {...register('fullName', { required: 'Ad soyad zorunludur', minLength: { value: 2, message: 'En az 2 karakter olmalıdır' } })}
                type="text"
                className={inputClass}
                placeholder="Ahmet Yılmaz"
              />
              {errors.fullName && <p className="text-red-400 text-sm mt-1.5">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">E-posta Adresi *</label>
              <input
                {...register('email', {
                  required: 'E-posta adresi zorunludur',
                  pattern: { value: /^\S+@\S+$/i, message: 'Geçerli bir e-posta adresi giriniz' }
                })}
                type="email"
                className={inputClass}
                placeholder="ahmet@beautysalon.com"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Telefon Numarası *</label>
              <input
                {...register('phone', {
                  required: 'Telefon numarası zorunludur',
                  pattern: { value: /^[0-9\s\-\+\(\)]+$/, message: 'Geçerli bir telefon numarası giriniz' }
                })}
                type="text"
                className={inputClass}
                placeholder="+90 555 123 4567"
              />
              {errors.phone && <p className="text-red-400 text-sm mt-1.5">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Şifre *</label>
              <div className="relative">
                <input
                  {...register('password', { required: 'Şifre zorunludur', minLength: { value: 6, message: 'Şifre en az 6 karakter olmalıdır' } })}
                  type={showPassword ? 'text' : 'password'}
                  className={`${inputClass} pr-12`}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm mt-1.5">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Şifre Tekrar *</label>
              <div className="relative">
                <input
                  {...register('confirmPassword', {
                    required: 'Şifre tekrarı zorunludur',
                    validate: (v) => watchPassword === v || 'Şifreler eşleşmiyor'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`${inputClass} pr-12`}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-sm mt-1.5">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/30 mt-2"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Kayıt yapılıyor...
                </div>
              ) : 'İşletme Sahibi Olarak Kayıt Ol'}
            </button>
          </form>

          {/* Sonraki Adımlar */}
          <div className="mt-6 p-4 bg-zinc-800 border border-zinc-700 rounded-xl">
            <h4 className="font-semibold text-zinc-200 text-sm mb-3 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" />
              Kayıt Sonrası Adımlar
            </h4>
            <div className="space-y-2">
              {['Giriş yapın ve işletme bilgilerinizi tamamlayın', 'Departmanlarınızı ve hizmetlerinizi ekleyin', 'Admin onayından sonra müşteriler sizi görebilir'].map((step, i) => (
                <div key={i} className="flex items-center gap-3 text-zinc-400 text-xs">
                  <div className="w-5 h-5 bg-zinc-700 rounded-full flex items-center justify-center text-xs font-bold text-zinc-300 shrink-0">{i + 1}</div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-5 pt-5 border-t border-zinc-800">
            <p className="text-zinc-500 text-sm">
              Zaten hesabınız var mı?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
