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
      
      // Form alanlarını doldur
      setValue('name', existingCenter.name)
      setValue('address', existingCenter.address)
      setValue('phone', existingCenter.phone)
      setValue('email', existingCenter.email || '')
      setValue('description', existingCenter.description || '')
      setValue('location', existingCenter.location || '')
      
      // Çalışma saatleri varsa doldur
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
      console.error('Error:', error)
      toast.error(error.data?.message || 'İşlem başarısız')
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">İşletme bilgileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  // İşletme henüz oluşturulmamış
  const hasCenter = existingCenter && !error

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
                Dashboard
              </Link>
              <div className="w-px h-6 bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Building className="text-purple-600" size={28} />
                {hasCenter ? 'İşletme Yönetimi' : 'İşletme Oluştur'}
              </h1>
            </div>
            
            {hasCenter && (
              <div className="flex items-center gap-3">
                <Link 
                  href="/owner/departments"
                  className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
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
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center gap-3">
              {existingCenter?.isApproved ? (
                <>
                  <CheckCircle className="text-green-600" size={24} />
                  <div>
                    <h3 className="font-medium text-green-900">İşletmeniz Onaylandı ✨</h3>
                    <p className="text-green-700 text-sm">Müşteriler artık işletmenizi görebilir ve randevu alabilir.</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="text-yellow-600" size={24} />
                  <div>
                    <h3 className="font-medium text-yellow-900">Onay Bekleniyor ⏳</h3>
                    <p className="text-yellow-700 text-sm">İşletmeniz admin onayında. Onaylandıktan sonra müşteriler tarafından görünür olacak.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* İşletme yoksa özel mesaj */}
        {!hasCenter && !isLoadingCenter && (
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6 text-center">
            <Building className="mx-auto text-purple-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">İlk İşletmenizi Oluşturun</h2>
            <p className="text-gray-600 mb-6">
              Güzellik merkezi bilgilerinizi girerek müşterilerin sizi bulabilmesini sağlayın.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <h4 className="font-medium text-blue-900 mb-2">💡 İpucu:</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• İşletme bilgilerinizi eksiksiz doldurun</li>
                <li>• Çalışma saatlerinizi doğru belirleyin</li>
                <li>• Admin onayından sonra müşteriler sizi görebilir</li>
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Temel Bilgiler */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Building className="text-purple-600" size={20} />
              Temel Bilgiler
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* İşletme Adı */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İşletme Adı *
                </label>
                <input
                  {...register('name', { 
                    required: 'İşletme adı zorunludur',
                    minLength: { value: 2, message: 'En az 2 karakter olmalıdır' }
                  })}
                  type="text"
                  className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="Bella Beauty Salon"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Telefon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    {...register('phone', { 
                      required: 'Telefon zorunludur',
                      pattern: {
                        value: /^[0-9\s\-\+\(\)]+$/,
                        message: 'Geçerli bir telefon numarası giriniz'
                      }
                    })}
                    type="text"
                    className="w-full pl-10 pr-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="+90 555 123 4567"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* E-posta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    {...register('email', {
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Geçerli bir e-posta adresi giriniz'
                      }
                    })}
                    type="email"
                    className="w-full pl-10 pr-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="info@bellasalon.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Konum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konum/Şehir
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    {...register('location')}
                    type="text"
                    className="w-full pl-10 pr-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="Ankara, Türkiye"
                  />
                </div>
              </div>
            </div>

            {/* Adres */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adres *
              </label>
              <textarea
                {...register('address', { 
                  required: 'Adres zorunludur',
                  minLength: { value: 10, message: 'En az 10 karakter olmalıdır' }
                })}
                rows={3}
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="Kızılay Mah. Atatürk Bulvarı No:123 Çankaya/ANKARA"
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
              )}
            </div>

            {/* Açıklama */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İşletme Açıklaması
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="Profesyonel güzellik hizmetleri sunan modern salonumuzda saç, cilt ve makyaj hizmetleri veriyoruz..."
              />
              <p className="text-black text-sm mt-2">Müşteriler işletmenizi ararken bu açıklamayı görecek.</p>
            </div>
          </div>

          {/* Çalışma Saatleri */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="text-purple-600" size={20} />
              Çalışma Saatleri
            </h2>
            
            <div className="space-y-4">
              {Object.entries(dayNames).map(([day, dayLabel]) => (
                <div key={day} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-24 text-sm font-medium text-gray-700">
                    {dayLabel}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register(`workingHours.${day}.isClosed`)}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-600">Kapalı</span>
                  </div>
                  
                  {!watchedWorkingHours?.[day]?.isClosed && (
                    <div className="flex items-center gap-2 ml-4">
                      <input
                        type="time"
                        {...register(`workingHours.${day}.open`)}
                        className="px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="time"
                        {...register(`workingHours.${day}.close`)}
                        className="px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>💡 İpucu:</strong> Çalışma saatlerinizi doğru belirleyin. Müşteriler sadece bu saatlerde randevu alabilir.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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