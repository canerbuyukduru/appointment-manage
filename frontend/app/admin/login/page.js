// app/admin/login/page.jsx
'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useLoginAdminMutation } from '@/lib/services/adminApi'
import { useSelector } from 'react-redux'  
import toast from 'react-hot-toast'
import { Eye, EyeOff, Shield, Lock, Mail } from 'lucide-react'

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const [loginAdmin, { isLoading }] = useLoginAdminMutation()
  
  // ✅ Sadece Redux state'den kontrol - API çağrısı yapmıyor
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  // ✅ Eğer admin zaten giriş yapmışsa yönlendir (ama API çağrısı yapma)
  if (isAuthenticated && user?.role === 'admin') {
    router.push('/admin/dashboard')
    return null
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    try {
      const result = await loginAdmin(data).unwrap()
      toast.success('Admin girişi başarılı!')
      router.push('/admin/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.data?.message || 'Giriş başarısız')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full mb-4">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Paneli</h1>
          <p className="text-gray-600 mt-2">Sistem yönetimi için giriş yapın</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-posta Adresi
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                {...register('email', {
                  required: 'E-posta adresi zorunludur',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Geçerli bir e-posta adresi giriniz',
                  },
                })}
                type="email"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                placeholder="admin@example.com"
              />
            </div>
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
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                {...register('password', {
                  required: 'Şifre zorunludur',
                  minLength: { value: 6, message: 'Şifre en az 6 karakter olmalıdır' },
                })}
                type={showPassword ? 'text' : 'password'}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
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
            className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:from-red-600 hover:to-orange-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Giriş yapılıyor...
              </div>
            ) : (
              'Admin Girişi'
            )}
          </button>
        </form>

        {/* Warning */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="text-yellow-600 mt-0.5" size={16} />
            <div>
              <p className="text-yellow-800 text-sm font-medium">Güvenlik Uyarısı</p>
              <p className="text-yellow-700 text-xs mt-1">
                Bu panel sadece yetkili sistem yöneticileri içindir. 
                Yetkisiz erişim suçtur.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            ← Ana sayfaya dön
          </button>
        </div>
      </div>
    </div>
  )
}