'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react'

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

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'E-posta adresi zorunludur')
    .email('Geçerli bir e-posta adresi giriniz'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function SifremiUnuttumForm() {
  const [isSent, setIsSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    // Şimdilik simüle ediyoruz — backend endpoint hazır olduğunda api.post('/auth/forgot-password', data) yapılacak
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSentEmail(data.email)
    setIsSent(true)
    setIsLoading(false)
  }

  if (isSent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <MailCheck className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">E-posta gönderildi</h1>
        <p className="text-sm text-gray-500 mb-2">
          Şifre sıfırlama bağlantısı şu adrese gönderildi:
        </p>
        <p className="text-sm font-medium text-gray-800 mb-6">{sentEmail}</p>
        <p className="text-xs text-gray-400 mb-8">
          E-postayı göremiyorsanız spam klasörünüzü kontrol edin.
          Bağlantı 15 dakika geçerlidir.
        </p>
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setIsSent(false)
              form.reset()
            }}
          >
            Farklı e-posta ile dene
          </Button>
          <Link href="/giris">
            <Button type="button" variant="ghost" className="w-full">
              <ArrowLeft className="w-4 h-4" />
              Giriş sayfasına dön
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Şifremi Unuttum</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-posta</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="ornek@email.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            size="md"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
          </Button>
        </form>
      </Form>

      <div className="mt-6">
        <Link
          href="/giris"
          className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Giriş sayfasına geri dön
        </Link>
      </div>
    </div>
  )
}
