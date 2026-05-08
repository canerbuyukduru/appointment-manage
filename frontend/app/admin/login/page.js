'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useLoginAdminMutation } from '@/lib/services/adminApi'
import { setCredentials } from '@/lib/features/authSlice'
import toast from 'react-hot-toast'
import { ShieldCheck, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { getErrorMessage, getToastDuration } from '@/lib/utils/errorMessages'

export default function AdminLoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const dispatch = useDispatch()
  const [loginAdmin, { isLoading }] = useLoginAdminMutation()

  const onSubmit = async (data) => {
    try {
      const result = await loginAdmin(data).unwrap()
      dispatch(setCredentials({ user: result.user }))
      toast.success('Giriş başarılı')
      router.push('/admin/dashboard')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Giriş başarısız'), { duration: getToastDuration(err) })
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-950 border border-red-900 rounded-2xl mb-4">
            <ShieldCheck size={28} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-50">Admin Girişi</h1>
          <p className="text-zinc-500 text-sm mt-1">Yönetici paneline erişin</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">E-posta</label>
              <input
                type="email"
                {...register('email', { required: 'E-posta gerekli' })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="admin@beautybook.com"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Şifre</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Şifre gerekli' })}
                  className="w-full px-4 py-3 pr-12 bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
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
              className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Giriş yapılıyor...
                </div>
              ) : 'Giriş Yap'}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link href="/login" className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors">
            ← Kullanıcı Girişine Dön
          </Link>
        </div>
      </div>
    </div>
  )
}
