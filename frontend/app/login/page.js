'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { useLoginUserMutation, useLoginOwnerMutation } from '@/lib/services/authApi'
import { setCredentials } from '@/lib/features/authSlice'
import { Eye, EyeOff, User, Building, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { getErrorMessage, getToastDuration } from '@/lib/utils/errorMessages'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState('user')
  const router = useRouter()
  const dispatch = useDispatch()

  const [loginUser, { isLoading: isUserLoading }] = useLoginUserMutation()
  const [loginOwner, { isLoading: isOwnerLoading }] = useLoginOwnerMutation()

  const { register, handleSubmit, formState: { errors } } = useForm()
  const isLoading = isUserLoading || isOwnerLoading

  const onSubmit = async (data) => {
    try {
      let result
      if (userType === 'user') {
        result = await loginUser(data).unwrap()
        if (result.user) dispatch(setCredentials({ user: result.user }))
      } else {
        result = await loginOwner(data).unwrap()
        if (result.owner) dispatch(setCredentials({ user: result.owner }))
      }
      toast.success(result.message)
      const pendingBooking = localStorage.getItem('pendingBooking')
      if (pendingBooking) {
        const bookingData = JSON.parse(pendingBooking)
        localStorage.removeItem('pendingBooking')
        router.push(bookingData.redirectTo)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Giriş yapılamadı'), { duration: getToastDuration(error) })
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-zinc-50">BeautyBook</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-zinc-50 mb-1">Giriş Yap</h1>
            <p className="text-zinc-400 text-sm">Hesabınıza erişim sağlayın</p>
          </div>

          {/* Kullanıcı Tipi */}
          <div className="flex bg-zinc-800 rounded-xl p-1 mb-6 gap-1">
            <button
              type="button"
              onClick={() => setUserType('user')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all text-sm font-medium ${
                userType === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/30'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <User size={15} />
              Kullanıcı
            </button>
            <button
              type="button"
              onClick={() => setUserType('owner')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all text-sm font-medium ${
                userType === 'owner'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/30'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Building size={15} />
              İşletme
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                E-posta Adresi
              </label>
              <input
                {...register('email', {
                  required: 'E-posta adresi zorunludur',
                  pattern: { value: /^\S+@\S+$/i, message: 'Geçerli bir e-posta adresi giriniz' },
                })}
                type="email"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="ornek@email.com"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Şifre
              </label>
              <div className="relative">
                <input
                  {...register('password', { required: 'Şifre zorunludur' })}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-12 bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm mt-1.5">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/30"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Giriş yapılıyor...
                </div>
              ) : 'Giriş Yap'}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-zinc-800">
            <p className="text-zinc-500 text-sm text-center mb-3">Hesabınız yok mu?</p>
            <div className="grid grid-cols-1 gap-2.5">
              <Link
                href="/register/user"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-xl hover:bg-zinc-700 hover:border-zinc-600 transition-colors text-sm font-medium"
              >
                <User size={16} className="text-purple-400" />
                Kullanıcı Kayıt (Randevu Al)
              </Link>
              <Link
                href="/register/owner"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-xl hover:bg-zinc-700 hover:border-zinc-600 transition-colors text-sm font-medium"
              >
                <Building size={16} className="text-pink-400" />
                İşletme Sahibi Kayıt
              </Link>
            </div>
            <p className="text-xs text-zinc-600 text-center mt-4">
              İşletme sahibi kaydı admin onayı gerektirir
            </p>
          </div>

          <div className="text-center mt-5">
            <Link href="/admin/login" className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors">
              Admin Girişi
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
