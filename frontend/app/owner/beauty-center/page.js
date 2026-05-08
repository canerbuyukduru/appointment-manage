// app/owner/beauty-center/page.jsx
'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  useCreateBeautyCenterMutation,
  useGetMyBeautyCenterQuery,
  useUpdateMyBeautyCenterMutation
} from '@/lib/services/beautyCenterApi'

import { Building, MapPin, Phone, Mail, Clock, Calendar, ArrowLeft, Save, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { getErrorMessage, getToastDuration } from '@/lib/utils/errorMessages'

function BeautyCenterManager() {
  const [isEditing, setIsEditing] = useState(false)

  // API hooks
  const { data: existingCenter, isLoading: isLoadingCenter, error } = useGetMyBeautyCenterQuery()
  const [createCenter, { isLoading: isCreating }] = useCreateBeautyCenterMutation()
  const [updateCenter, { isLoading: isUpdating }] = useUpdateMyBeautyCenterMutation()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      workingHours: {
        monday: { open: '09:00', close: '18:00', isClosed: false },
        tuesday: { open: '09:00', close: '18:00', isClosed: false },
        wednesday: { open: '09:00', close: '18:00', isClosed: false },
        thursday: { open: '09:00', close: '18:00', isClosed: false },
        friday: { open: '09:00', close: '18:00', isClosed: false },
        saturday: { open: '09:00', close: '17:00', isClosed: false },
        sunday: { open: '10:00', close: '16:00', isClosed: true },
      }
    }
  })

  // Mevcut center varsa form'u doldur
  useEffect(() => {
    if (existingCenter) {
      setIsEditing(true)

      setValue('name', existingCenter.name)
      setValue('address', existingCenter.address)
      setValue('phone', existingCenter.phone)
      setValue('email', existingCenter.email || '')
      setValue('description', existingCenter.description || '')
      setValue('location', existingCenter.location || '')

      if (existingCenter.workingHours) {
        setValue('workingHours', existingCenter.workingHours)
      }
    }
  }, [existingCenter, setValue])

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        const result = await updateCenter(data).unwrap()
        toast.success('İşletme bilgileri güncellendi!')
      } else {
        const result = await createCenter(data).unwrap()
        toast.success('İşletmeniz başarıyla oluşturuldu!')
        setIsEditing(true)
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'İşlem başarısız'), { duration: getToastDuration(error) })
    }
  }

  const watchedWorkingHours = watch('workingHours')

  const dayNames = {
    monday: 'Pazartesi',
    tuesday: 'Salı',
    wednesday: 'Çarşamba',
    thursday: 'Perşembe',
    friday: 'Cuma',
    saturday: 'Cumartesi',
    sunday: 'Pazar'
  }

  if (isLoadingCenter) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">İşletme bilgileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  // İşletme henüz oluşturulmamış
  const hasCenter = existingCenter && !error

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                <ArrowLeft size={20} />
                Dashboard
              </Link>
              <div className="w-px h-6 bg-zinc-700"></div>
              <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
                <Building className="text-purple-600" size={28} />
                {hasCenter ? 'İşletme Yönetimi' : 'İşletme Oluştur'}
              </h1>
            </div>

            {hasCenter && (
              <div className="flex items-center gap-3">
                <Link
                  href="/owner/departments"
                  className="px-4 py-2 text-purple-400 border border-purple-800 rounded-lg hover:bg-purple-950/30 transition-colors"
                >
                  Departmanları Yönet
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Approval Status */}
        {hasCenter && (
          <div className={`mb-6 p-4 rounded-xl border ${
            existingCenter?.isApproved
              ? 'bg-green-950/30 border-green-900'
              : 'bg-yellow-950/30 border-yellow-900'
          }`}>
            <div className="flex items-center gap-3">
              {existingCenter?.isApproved ? (
                <>
                  <CheckCircle className="text-green-400" size={24} />
                  <div>
                    <h3 className="font-medium text-green-400">İşletmeniz Onaylandı ✨</h3>
                    <p className="text-green-400 text-sm opacity-80">Müşteriler artık işletmenizi görebilir ve randevu alabilir.</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="text-yellow-400" size={24} />
                  <div>
                    <h3 className="font-medium text-yellow-400">Onay Bekleniyor ⏳</h3>
                    <p className="text-yellow-400 text-sm opacity-80">İşletmeniz admin onayında. Onaylandıktan sonra müşteriler tarafından görünür olacak.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* İşletme yoksa özel mesaj */}
        {!hasCenter && !isLoadingCenter && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-6 text-center">
            <Building className="mx-auto text-purple-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-zinc-100 mb-2">İlk İşletmenizi Oluşturun</h2>
            <p className="text-zinc-400 mb-6">
              Güzellik merkezi bilgilerinizi girerek müşterilerin sizi bulabilmesini sağlayın.
            </p>
            <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-lg text-left">
              <h4 className="font-medium text-zinc-300 mb-2">💡 İpucu:</h4>
              <ul className="text-zinc-300 text-sm space-y-1">
                <li>• İşletme bilgilerinizi eksiksiz doldurun</li>
                <li>• Çalışma saatlerinizi doğru belirleyin</li>
                <li>• Admin onayından sonra müşteriler sizi görebilir</li>
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Temel Bilgiler */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-zinc-100 mb-6 flex items-center gap-2">
              <Building className="text-purple-600" size={20} />
              Temel Bilgiler
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* İşletme Adı */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  İşletme Adı *
                </label>
                <input
                  {...register('name', {
                    required: 'İşletme adı zorunludur',
                    minLength: { value: 2, message: 'En az 2 karakter olmalıdır' }
                  })}
                  type="text"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="Bella Beauty Salon"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Telefon */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Telefon *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
                  <input
                    {...register('phone', {
                      required: 'Telefon zorunludur',
                      pattern: {
                        value: /^[0-9\s\-\+\(\)]+$/,
                        message: 'Geçerli bir telefon numarası giriniz'
                      }
                    })}
                    type="text"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="+90 555 123 4567"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* E-posta */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  E-posta
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
                  <input
                    {...register('email', {
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Geçerli bir e-posta adresi giriniz'
                      }
                    })}
                    type="email"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="info@bellasalon.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Konum */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Konum/Şehir
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
                  <input
                    {...register('location')}
                    type="text"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="Ankara, Türkiye"
                  />
                </div>
              </div>
            </div>

            {/* Adres */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Adres *
              </label>
              <textarea
                {...register('address', {
                  required: 'Adres zorunludur',
                  minLength: { value: 10, message: 'En az 10 karakter olmalıdır' }
                })}
                rows={3}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="Kızılay Mah. Atatürk Bulvarı No:123 Çankaya/ANKARA"
              />
              {errors.address && (
                <p className="text-red-400 text-sm mt-1">{errors.address.message}</p>
              )}
            </div>

            {/* Açıklama */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                İşletme Açıklaması
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="Profesyonel güzellik hizmetleri sunan modern salonumuzda saç, cilt ve makyaj hizmetleri veriyoruz..."
              />
              <p className="text-zinc-400 text-sm mt-2">Müşteriler işletmenizi ararken bu açıklamayı görecek.</p>
            </div>
          </div>

          {/* Çalışma Saatleri */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-zinc-100 mb-6 flex items-center gap-2">
              <Clock className="text-purple-600" size={20} />
              Çalışma Saatleri
            </h2>

            <div className="space-y-4">
              {Object.entries(dayNames).map(([day, dayLabel]) => (
                <div key={day} className="flex items-center gap-4 p-4 border border-zinc-700 rounded-lg bg-zinc-800/50">
                  <div className="w-24 text-sm font-medium text-zinc-300">
                    {dayLabel}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register(`workingHours.${day}.isClosed`)}
                      className="w-4 h-4 text-purple-600 bg-zinc-700 border-zinc-600 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-sm text-zinc-400">Kapalı</span>
                  </div>

                  {!watchedWorkingHours?.[day]?.isClosed && (
                    <div className="flex items-center gap-2 ml-4">
                      <input
                        type="time"
                        {...register(`workingHours.${day}.open`)}
                        className="px-3 py-2 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      />
                      <span className="text-zinc-500">-</span>
                      <input
                        type="time"
                        {...register(`workingHours.${day}.close`)}
                        className="px-3 py-2 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
              <p className="text-zinc-300 text-sm">
                <strong>💡 İpucu:</strong> Çalışma saatlerinizi doğru belirleyin. Müşteriler sadece bu saatlerde randevu alabilir.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {isCreating || isUpdating
                ? (hasCenter ? 'Güncelleniyor...' : 'Oluşturuluyor...')
                : (hasCenter ? 'Değişiklikleri Kaydet' : 'İşletme Oluştur')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function BeautyCenterPage() {
  return <BeautyCenterManager />
}
