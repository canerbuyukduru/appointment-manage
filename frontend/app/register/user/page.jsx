// app/register/user/page.jsx
'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useRegisterUserMutation } from '@/lib/services/authApi'
import toast from 'react-hot-toast'
import { Eye, EyeOff, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function UserRegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const [registerUser, { isLoading }] = useRegisterUserMutation()

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
      const userData = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: 'user'  // Backend için role belirt
      }

      const result = await registerUser(userData).unwrap()
      toast.success('Kayıt başarılı! Şimdi giriş yapabilirsiniz.')
      router.push('/login')
    } catch (error) {
      toast.error(error.data?.message || 'Kayıt işlemi başarısız')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Back Button */}
        <Link 
          href="/login"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Geri Dön
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-blue-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kullanıcı Kayıt</h1>
          <p className="text-gray-600">Randevu alabilmek için hesap oluşturun</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Ad Soyad *
            </label>
            <input
              {...register('fullName', {
                required: 'Ad soyad zorunludur',
                minLength: {
                  value: 2,
                  message: 'En az 2 karakter olmalıdır'
                }
              })}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Adınızı ve soyadınızı girin"
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-posta *
            </label>
            <input
              {...register('email', {
                required: 'E-posta zorunludur',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Geçersiz e-posta formatı'
                }
              })}
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="ornek@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefon *
            </label>
            <input
              {...register('phone', {
                required: 'Telefon numarası zorunludur',
                pattern: {
                  value: /^[0-9]{10,11}$/,
                  message: 'Geçersiz telefon formatı (10-11 rakam)'
                }
              })}
              type="tel"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="05xxxxxxxxx"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Şifre *
            </label>
            <div className="relative">
              <input
                {...register('password', {
                  required: 'Şifre zorunludur',
                  validate: (value) => {
                    if (value.length < 8) return 'Şifre en az 8 karakter olmalıdır'
                    if (!/[A-Z]/.test(value)) return 'En az bir büyük harf içermeli'
                    if (!/[a-z]/.test(value)) return 'En az bir küçük harf içermeli'
                    if (!/[0-9]/.test(value)) return 'En az bir rakam içermeli'
                    if (!/[^A-Za-z0-9]/.test(value)) return 'En az bir özel karakter içermeli'
                    return true
                  }
                })}
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Şifre Tekrar *
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword', {
                  required: 'Şifre tekrarı zorunludur',
                  validate: (value) =>
                    value === watchPassword || 'Şifreler eşleşmiyor'
                })}
                type={showConfirmPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Kayıt yapılıyor...' : 'Hesap Oluştur'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Zaten hesabınız var mı?{' '}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Giriş yapın
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            İşletme sahibi misiniz?{' '}
            <Link
              href="/register/owner"
              className="text-purple-600 hover:text-purple-700 font-semibold"
            >
              İşletme kaydı yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}