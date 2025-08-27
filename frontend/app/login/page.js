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
import Link from 'next/link'

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
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <User size={18} />
            <span className="font-medium">Kullanıcı</span>
          </button>
          <button
            type="button"
            onClick={() => setUserType('owner')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
              userType === 'owner'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Building size={18} />
            <span className="font-medium">İşletme</span>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-posta Adresi
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
              placeholder="ornek@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şifre
            </label>
            <div className="relative">
              <input
                {...register('password', {
                  required: 'Şifre zorunludur',
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Giriş yapılıyor...
              </div>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>

        {/* Register Links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center space-y-3">
            <p className="text-gray-600 font-medium">Hesabınız yok mu?</p>
            
            <div className="grid grid-cols-1 gap-3">
              {/* User Register */}
              <Link
                href="/register/user"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              >
                <User size={18} />
                Kullanıcı Kayıt (Randevu Al)
              </Link>
              
              {/* Owner Register */}
              <Link
                href="/register/owner"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium"
              >
                <Building size={18} />
                İşletme Sahibi Kayıt
              </Link>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              İşletme sahibi kaydı admin onayı gerektirir
            </p>
          </div>
        </div>

        {/* Admin Link */}
        <div className="text-center mt-6">
          <Link 
            href="/admin/login"
            className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
          >
            Admin Girişi
          </Link>
        </div>
      </div>
    </div>
  )
}