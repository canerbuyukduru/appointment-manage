// app/owner/departments/[departmentId]/services/page.jsx
'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  serviceApi,
  useGetServicesByDepartmentQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} from '@/lib/services/serviceApi'
import { useGetDepartmentsQuery } from '@/lib/services/departmentApi'
import {
  Settings,
  Plus, 
  Edit2, 
  Trash2, 
  ArrowLeft, 
  Clock,
  DollarSign,
  X,
  Folder
} from 'lucide-react'
import Link from 'next/link'

function ServicesManager() {
  const params = useParams()
  const router = useRouter()
  const departmentId = params.departmentId

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)

  // API hooks
  const { data: departmentsData } = useGetDepartmentsQuery()
  const { data: servicesData, isLoading: isLoadingServices } = useGetServicesByDepartmentQuery(departmentId)
  const [createService, { isLoading: isCreating }] = useCreateServiceMutation()
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation()
  const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation()

  const departments = departmentsData || []
  const currentDepartment = departments.find(dept => dept._id === departmentId)
  const services = servicesData || []

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm()

  // Modal açma/kapama
  const openModal = (service = null) => {
    setEditingService(service)
    setIsModalOpen(true)
    
    if (service) {
      setValue('name', service.name)
      setValue('description', service.description)
      setValue('price', service.price)
      setValue('duration', service.duration)
    } else {
      reset()
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingService(null)
    reset()
  }

  // Form submit
  const onSubmit = async (data) => {
    try {
      const serviceData = {
        ...data,
        departmentId: departmentId,
        price: parseFloat(data.price),
        duration: parseInt(data.duration)
      }

      if (editingService) {
        // Güncelleme
        await updateService({ 
          id: editingService._id, 
          ...serviceData 
        }).unwrap()
        toast.success('Hizmet güncellendi!')
      } else {
        // Yeni oluşturma
        await createService(serviceData).unwrap()
        toast.success('Hizmet oluşturuldu!')
      }
      closeModal()
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.data?.message || 'İşlem başarısız')
    }
  }

  // Service silme
  const handleDelete = async (id, name) => {
    if (confirm(`"${name}" hizmetini silmek istediğinizden emin misiniz?`)) {
      try {
        await deleteService(id).unwrap()
        toast.success('Hizmet silindi!')
      } catch (error) {
        toast.error('Silme işlemi başarısız')
      }
    }
  }

  // Süreyi formatlama (dakika -> saat:dakika)
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} dakika`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 
      ? `${hours} saat ${remainingMinutes} dakika`
      : `${hours} saat`
  }

  const isLoading = isCreating || isUpdating || isDeleting

  if (isLoadingServices) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Hizmetler yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Department bulunamazsa
  if (!currentDepartment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Departman bulunamadı</h2>
          <Link 
            href="/owner/departments"
            className="text-purple-600 hover:text-purple-700"
          >
            Departmanlar sayfasına dön
          </Link>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link 
                href="/owner/departments"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
                Departmanlar
              </Link>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <Folder className="text-purple-600" size={24} />
                <span className="text-gray-600">{currentDepartment.name}</span>
              </div>
              <div className="w-px h-6 bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Settings className="text-purple-600" size={28} />
                Hizmetler
              </h1>
            </div>
            
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all"
            >
              <Plus size={20} />
              Yeni Hizmet
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {services.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Settings className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {currentDepartment.name} için henüz hizmet eklemediniz
            </h3>
            <p className="text-gray-600 mb-6">
              Bu departmana ait hizmetleri ekleyin (fiyat ve süre belirterek)
            </p>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all mx-auto"
            >
              <Plus size={20} />
              İlk Hizmetinizi Ekleyin
            </button>
          </div>
        ) : (
          // Services Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service._id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Settings className="text-indigo-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-green-600">
                          <DollarSign size={14} />
                          <span className="font-medium">{service.price}₺</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-600">
                          <Clock size={14} />
                          <span className="text-sm">{formatDuration(service.duration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(service)}
                      className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(service._id, service.name)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={isDeleting}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                {service.description && (
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {service.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingService ? 'Hizmet Düzenle' : 'Yeni Hizmet'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hizmet Adı *
                  </label>
                  <input
                    {...register('name', { 
                      required: 'Hizmet adı zorunludur',
                      minLength: { value: 2, message: 'En az 2 karakter olmalıdır' }
                    })}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="Saç Kesimi, Boyama, Makyaj..."
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fiyat (₺) *
                    </label>
                    <input
                      {...register('price', { 
                        required: 'Fiyat zorunludur',
                        min: { value: 0, message: 'Fiyat 0\'dan küçük olamaz' }
                      })}
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                      placeholder="100"
                    />
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Süre (dakika) *
                    </label>
                    <input
                      {...register('duration', { 
                        required: 'Süre zorunludur',
                        min: { value: 1, message: 'En az 1 dakika olmalıdır' }
                      })}
                      type="number"
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                      placeholder="60"
                    />
                    {errors.duration && (
                      <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Hizmet hakkında detaylar..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50"
                >
                  {isLoading 
                    ? (editingService ? 'Güncelleniyor...' : 'Oluşturuluyor...') 
                    : (editingService ? 'Güncelle' : 'Oluştur')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ServicesPage() {
  return <ServicesManager />
}