'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { useLogin } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

export default function GirisForm() {
  const [showPassword, setShowPassword] = useState(false)
  const login = useLogin()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (data: LoginFormData) => login.mutate(data)

  const apiError =
    login.isError && login.error
      ? (login.error as { message?: string })?.message || 'Giriş başarısız, tekrar deneyin.'
      : null

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Giriş Yap</h1>
        <p className="mt-1.5 text-sm text-gray-500">Hesabınıza giriş yaparak devam edin.</p>
      </div>

      {apiError && (
        <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400">{apiError}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300 text-sm">E-posta</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="ornek@email.com"
                    autoComplete="email"
                    className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-600 focus:border-blue-500 focus:ring-blue-500/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400 text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-gray-300 text-sm">Şifre</FormLabel>
                  <Link href="/sifremi-unuttum" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    Şifremi unuttum
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-600 focus:border-blue-500 focus:ring-blue-500/20 pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-400 text-xs" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
            disabled={login.isPending}
          >
            {login.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {login.isPending ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
        </form>
      </Form>

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-800" />
        <span className="text-xs text-gray-600">veya</span>
        <div className="flex-1 h-px bg-gray-800" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full border-gray-700 bg-gray-800/60 text-gray-300 hover:bg-gray-800 hover:text-gray-100"
        disabled
        title="Yakında aktif olacak"
      >
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Google ile giriş yap
        <span className="ml-1 text-xs text-gray-600">(Yakında)</span>
      </Button>

      <p className="mt-6 text-center text-sm text-gray-500">
        Hesabın yok mu?{' '}
        <Link href="/kayit-ol" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
          Kayıt ol
        </Link>
      </p>
    </div>
  )
}
