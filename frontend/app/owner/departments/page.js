// app/owner/departments/page.jsx
'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useGetDepartmentsQuery,useCreateDepartmentMutation,useUpdateDepartmentMutation,useDeleteDepartmentMutation} from '@/lib/services/departmentApi'
import {
  Folder,
  Plus, 
  Edit2, 
  Trash2, 
  ArrowLeft, 
  Settings,
  ChevronRight,
  X 
} from 'lucide-react'
import Link from 'next/link'

function DepartmentsManager() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState(null)

  // API hooks
  const { data: departmentsData, isLoading: isLoadingDepartments } = useGetDepartmentsQuery()
  const [createDepartment, { isLoading: isCreating }] = useCreateDepartmentMutation()
  const [updateDepartment, { isLoading: isUpdating }] = useUpdateDepartmentMutation()
  const [deleteDepartment, { isLoading: isDeleting }] = useDeleteDepartmentMutation()

  const departments = departmentsData || []
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm()

  // Modal açma/kapama
  const openModal = (department = null) => {
    setEditingDepartment(department)
    setIsModalOpen(true)
    
    if (department) {
      setValue('name', department.name)
      setValue('description', department.description)
    } else {
      reset()
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingDepartment(null)
    reset()
  }

  // Form submit
  const onSubmit = async (data) => {
    try {
      if (editingDepartment) {
        // Güncelleme
        await updateDepartment({ 
          id: editingDepartment._id, 
          ...data 
        }).unwrap()
        toast.success('Departman güncellendi!')
      } else {
        // Yeni oluşturma
        await createDepartment(data).unwrap()
        toast.success('Departman oluşturuldu!')
      }
      closeModal()
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.data?.message || 'İşlem başarısız')
    }
  }

  // Departman silme
  const handleDelete = async (id, name) => {
    if (confirm(`"${name}" departmanını silmek istediğinizden emin misiniz?`)) {
      try {
        await deleteDepartment(id).unwrap()
        toast.success('Departman silindi!')
      } catch (error) {
        toast.error('Silme işlemi başarısız')
      }
    }
  }

  const isLoading = isCreating || isUpdating || isDeleting

  if (isLoadingDepartments) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Departmanlar yükleniyor...</p>
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
                href="/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
                Dashboard
              </Link>
              <div className="w-px h-6 bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Folder className="text-purple-600" size={28} />
                Departmanlar
              </h1>
            </div>
            
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all"
            >
              <Plus size={20} />
              Yeni Departman
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {departments.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Folder className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Henüz departman oluşturmadınız
            </h3>
            <p className="text-gray-600 mb-6">
              İşletmeniz için departmanlar oluşturun (Saç Bakım, Cilt Bakım, Makyaj vb.)
            </p>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all mx-auto"
            >
              <Plus size={20} />
              İlk Departmanınızı Oluşturun
            </button>
          </div>
        ) : (
          // Departments Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((department) => (
              <div
                key={department._id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Folder className="text-purple-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{department.name}</h3>
                      <p className="text-sm text-gray-600">
                        {department.services?.length || 0} hizmet
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(department)}
                      className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(department._id, department.name)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={isDeleting}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                {department.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {department.description}
                  </p>
                )}
                
                {/* Services Management Button */}
                <button
                  onClick={() => router.push(`/owner/departments/${department._id}/services`)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-purple-50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <Settings size={18} className="text-gray-600 group-hover:text-purple-600" />
                    <span className="font-medium text-gray-900">Hizmetleri Yönet</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-purple-600" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingDepartment ? 'Departman Düzenle' : 'Yeni Departman'}
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
                    Departman Adı *
                  </label>
                  <input
                    {...register('name', { 
                      required: 'Departman adı zorunludur',
                      minLength: { value: 2, message: 'En az 2 karakter olmalıdır' }
                    })}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="Saç Bakım, Cilt Bakım, Makyaj..."
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Departman hakkında kısa açıklama..."
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
                    ? (editingDepartment ? 'Güncelleniyor...' : 'Oluşturuluyor...') 
                    : (editingDepartment ? 'Güncelle' : 'Oluştur')
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

export default function DepartmentsPage() {
  return <DepartmentsManager />
}