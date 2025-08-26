// app/owner/beauty-center/page.jsx
'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { 
  beautyCenterApi,
  useCreateBeautyCenterMutation, 
  useGetMyBeautyCenterQuery,
  useUpdateMyBeautyCenterMutation 
} from '@/lib/services/beautyCenterApi'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Building, MapPin, Phone, Mail, Clock, Calendar, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

function BeautyCenterForm() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)

  // API hooks
  const { data: existingCenter, isLoading: isLoadingCenter } = useGetMyBeautyCenterQuery()
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
      },
      customHolidays: []
    }
  })

  // Mevcut center varsa form'u doldur
  useEffect(() => {
    if (existingCenter?.center) {
      const center = existingCenter.center
      setIsEditing(true)
      
      // Form alanlarını doldur
      setValue('name', center.name)
      setValue('address', center.address)
      setValue('phone', center.phone)
      setValue('email', center.email)
      setValue('description', center.description)
      setValue('location', center.location)
      setValue('workingHours', center.workingHours)
      setValue('customHolidays', center.customHolidays || [])
    }
  }, [existingCenter, setValue])

  const onSubmit = async (data) => {
    try {
      console.log('Form data:', data)
      
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

  const isLoading = isCreating || isUpdating || isLoadingCenter

  const daysOfWeek = [
    { key: 'monday', label: 'Pazartesi' },
    { key: 'tuesday', label: 'Salı' },
    { key: 'wednesday', label: 'Çarşamba' },
    { key: 'thursday', label: 'Perşembe' },
    { key: 'friday', label: 'Cuma' },
    { key: 'saturday', label: 'Cumartesi' },
    { key: 'sunday', label: 'Pazar' },
  ]

  if (isLoadingCenter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

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
                {isEditing ? 'İşletme Düzenle' : 'İşletme Oluştur'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Temel Bilgiler */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Building size={24} className="text-purple-600" />
              Temel Bilgiler
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* İşletme Adı */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İşletme Adı *
                </label>
                <input
                  {...register('name', { 
                    required: 'İşletme adı zorunludur',
                    minLength: { value: 2, message: 'En az 2 karakter olmalıdır' }
                  })}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="Güzel Salon"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Telefon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} className="inline mr-1" />
                  Telefon *
                </label>
                <input
                  {...register('phone', { 
                    required: 'Telefon numarası zorunludur',
                    pattern: {
                      value: /^[0-9]{10,11}$/,
                      message: 'Geçersiz telefon formatı'
                    }
                  })}
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="05xxxxxxxxx"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-1" />
                  E-posta *
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="salon@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Adres */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-1" />
                  Adres *
                </label>
                <textarea
                  {...register('address', { 
                    required: 'Adres zorunludur',
                    minLength: { value: 10, message: 'En az 10 karakter olmalıdır' }
                  })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Tam adresinizi yazın..."
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                )}
              </div>

              {/* Konum (İsteğe bağlı) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konum Bilgisi (İsteğe bağlı)
                </label>
                <input
                  {...register('location')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="Şehir, İlçe"
                />
              </div>

              {/* Açıklama */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İşletme Açıklaması
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="İşletmenizi tanıtın..."
                />
              </div>
            </div>
          </div>

          {/* Çalışma Saatleri */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Clock size={24} className="text-purple-600" />
              Çalışma Saatleri
            </h2>
            
            <div className="space-y-4">
              {daysOfWeek.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-24 text-sm font-medium text-gray-700">
                    {label}
                  </div>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register(`workingHours.${key}.isClosed`)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-600">Kapalı</span>
                  </label>
                  
                  {!watch(`workingHours.${key}.isClosed`) && (
                    <>
                      <input
                        type="time"
                        {...register(`workingHours.${key}.open`)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="time"
                        {...register(`workingHours.${key}.close`)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {isLoading 
                ? (isEditing ? 'Güncelleniyor...' : 'Oluşturuluyor...') 
                : (isEditing ? 'Güncelle' : 'Oluştur')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Protected route ile sarmalayalım
export default function BeautyCenterPage() {
  return (
    <ProtectedRoute allowedRoles={['owner']}>
      <BeautyCenterForm />
    </ProtectedRoute>
  )
}