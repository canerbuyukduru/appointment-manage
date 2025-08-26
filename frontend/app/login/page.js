// app/login/page.jsx
'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { useLoginUserMutation, useLoginOwnerMutation } from '@/lib/services/authApi'
import { setCredentials } from '@/lib/features/authSlice'
import { Eye, EyeOff, User, Building } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState('user')
  const router = useRouter()
  const dispatch = useDispatch()

  const [loginUser, { isLoading: isUserLoading }] = useLoginUserMutation()
  const [loginOwner, { isLoading: isOwnerLoading }] = useLoginOwnerMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const isLoading = isUserLoading || isOwnerLoading

  const onSubmit = async (data) => {
    try {
      let result
      if (userType === 'user') {
        result = await loginUser(data).unwrap()
        if (result.user) {
          dispatch(setCredentials({ user: result.user }))
        }
      } else {
        result = await loginOwner(data).unwrap()
        if (result.owner) {
          dispatch(setCredentials({ user: result.owner }))
        }
      }

      toast.success(result.message)
      
      // Bekleyen booking var mı kontrol et
      const pendingBooking = localStorage.getItem('pendingBooking')
      if (pendingBooking) {
        const bookingData = JSON.parse(pendingBooking)
        localStorage.removeItem('pendingBooking')
        router.push(bookingData.redirectTo)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error(error.data?.message || 'Giriş yapılamadı')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Giriş Yap</h1>
          <p className="text-gray-600">Hesabınıza erişim sağlayın</p>
        </div>

        {/* User Type Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => setUserType('user')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
              userType === 'user'
                ? 'bg-white shadow-sm text-pink-600'
                : 'text-gray-600'
            }`}
          >
            <User size={18} />
            Kullanıcı
          </button>
          <button
            type="button"
            onClick={() => setUserType('owner')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
              userType === 'owner'
                ? 'bg-white shadow-sm text-pink-600'
                : 'text-gray-600'
            }`}
          >
            <Building size={18} />
            İşletme
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-posta
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
              placeholder="ornek@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Şifre
            </label>
            <div className="relative">
              <input
                {...register('password', {
                  required: 'Şifre zorunludur',
                  minLength: {
                    value: 6,
                    message: 'Şifre en az 6 karakter olmalıdır'
                  }
                })}
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all pr-12"
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Hesabınız yok mu?{' '}
            <button
              onClick={() => router.push('/register')}
              className="text-pink-600 hover:text-pink-700 font-semibold"
            >
              Kayıt olun
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}