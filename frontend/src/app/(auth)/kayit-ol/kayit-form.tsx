'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'
import { useRegister } from '@/hooks/use-auth'
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

function getPasswordStrength(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

const strengthConfig = [
  { label: 'Zayıf', bar: 'bg-red-500' },
  { label: 'Orta', bar: 'bg-orange-500' },
  { label: 'İyi', bar: 'bg-yellow-500' },
  { label: 'Güçlü', bar: 'bg-emerald-500' },
]

const textColors = ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-emerald-400']

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = getPasswordStrength(password)
  if (!password) return null
  const config = strengthConfig[strength - 1]
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              level <= strength ? config.bar : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">
        Şifre gücü:{' '}
        <span className={textColors[strength - 1]}>{config?.label}</span>
      </p>
    </div>
  )
}

export default function KayitForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')
  const register = useRegister()

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', phone: '' },
  })

  const onSubmit = (data: RegisterFormData) => {
    register.mutate({ ...data, phone: data.phone || undefined } as RegisterFormData)
  }

  const apiError =
    register.isError && register.error
      ? (register.error as { message?: string })?.message || 'Kayıt başarısız, tekrar deneyin.'
      : null

  const inputClass = "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-600 focus:border-blue-500 focus:ring-blue-500/20"

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Hesap Oluştur</h1>
        <p className="mt-1.5 text-sm text-gray-500">Ücretsiz hesabınızı oluşturun, randevu almaya başlayın.</p>
      </div>

      {apiError && (
        <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400">{apiError}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300 text-sm">Ad</FormLabel>
                  <FormControl>
                    <Input placeholder="Ahmet" autoComplete="given-name" className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300 text-sm">Soyad</FormLabel>
                  <FormControl>
                    <Input placeholder="Yılmaz" autoComplete="family-name" className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300 text-sm">E-posta</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="ornek@email.com" autoComplete="email" className={inputClass} {...field} />
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
                <FormLabel className="text-gray-300 text-sm">Şifre</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={`${inputClass} pr-10`}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        setPasswordValue(e.target.value)
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormControl>
                <PasswordStrengthBar password={passwordValue} />
                <FormMessage className="text-red-400 text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300 text-sm">
                  Telefon <span className="text-xs font-normal text-gray-600">(opsiyonel)</span>
                </FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="0532 123 45 67" autoComplete="tel" className={inputClass} {...field} />
                </FormControl>
                <FormMessage className="text-red-400 text-xs" />
              </FormItem>
            )}
          />

          <div className="pt-1">
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
              disabled={register.isPending}
            >
              {register.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {register.isPending ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
            </Button>
          </div>

          <p className="text-xs text-gray-600 text-center">
            Kayıt olarak{' '}
            <Link href="/kullanim-kosullari" className="text-blue-400 hover:text-blue-300 transition-colors">
              Kullanım Koşulları
            </Link>
            'nı ve{' '}
            <Link href="/gizlilik" className="text-blue-400 hover:text-blue-300 transition-colors">
              Gizlilik Politikası
            </Link>
            'nı kabul etmiş olursunuz.
          </p>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Zaten hesabın var mı?{' '}
        <Link href="/giris" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
          Giriş yap
        </Link>
      </p>
    </div>
  )
}
