'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useRegisterUserMutation } from '@/lib/services/authApi'
import toast from 'react-hot-toast'
import { Eye, EyeOff, User, ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { getErrorMessage, getToastDuration } from '@/lib/utils/errorMessages'

export default function UserRegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const [registerUser, { isLoading }] = useRegisterUserMutation()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const watchPassword = watch('password')

  const onSubmit = async (data) => {
    try {
      if (data.password !== data.confirmPassword) {
        toast.error('Şifreler eşleşmiyor')
        return
      }
      const userData = { fullName: data.fullName, email: data.email, password: data.password, phone: data.phone, role: 'user' }
      await registerUser(userData).unwrap()
      toast.success('Kayıt başarılı! Şimdi giriş yapabilirsiniz.')
      router.push('/login')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Kayıt işlemi başarısız'), { duration: getToastDuration(error) })
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
            Geri Dön
          </Link>

          <div className="text-center mb-7">
            <div className="w-14 h-14 bg-purple-950 border border-purple-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="text-purple-400" size={26} />
            </div>
            <h1 className="text-2xl font-bold text-zinc-50 mb-1">Kullanıcı Kayıt</h1>
            <p className="text-zinc-400 text-sm">Randevu alabilmek için hesap oluşturun</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Ad Soyad *</label>
              <input
                {...register('fullName', { required: 'Ad soyad zorunludur', minLength: { value: 2, message: 'En az 2 karakter olmalıdır' } })}
                type="text"
                className={inputClass}
                placeholder="Adınızı ve soyadınızı girin"
              />
              {errors.fullName && <p className="text-red-400 text-sm mt-1.5">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">E-posta *</label>
              <input
                {...register('email', {
                  required: 'E-posta zorunludur',
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Geçersiz e-posta formatı' }
                })}
                type="email"
                className={inputClass}
                placeholder="ornek@email.com"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Telefon *</label>
              <input
                {...register('phone', {
                  required: 'Telefon numarası zorunludur',
                  pattern: { value: /^[0-9]{10,11}$/, message: 'Geçersiz telefon formatı (10-11 rakam)' }
                })}
                type="tel"
                className={inputClass}
                placeholder="05xxxxxxxxx"
              />
              {errors.phone && <p className="text-red-400 text-sm mt-1.5">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Şifre *</label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Şifre zorunludur',
                    validate: (v) => {
                      if (v.length < 8) return 'Şifre en az 8 karakter olmalıdır'
                      if (!/[A-Z]/.test(v)) return 'En az bir büyük harf içermeli'
                      if (!/[a-z]/.test(v)) return 'En az bir küçük harf içermeli'
                      if (!/[0-9]/.test(v)) return 'En az bir rakam içermeli'
                      if (!/[^A-Za-z0-9]/.test(v)) return 'En az bir özel karakter içermeli'
                      return true
                    }
                  })}
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
                    validate: (v) => v === watchPassword || 'Şifreler eşleşmiyor'
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
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/30 mt-2"
            >
              {isLoading ? 'Kayıt yapılıyor...' : 'Hesap Oluştur'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-zinc-800 space-y-2 text-center text-sm">
            <p className="text-zinc-500">
              Zaten hesabınız var mı?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Giriş yapın
              </Link>
            </p>
            <p className="text-zinc-500">
              İşletme sahibi misiniz?{' '}
              <Link href="/register/owner" className="text-pink-400 hover:text-pink-300 font-medium transition-colors">
                İşletme kaydı yapın
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
