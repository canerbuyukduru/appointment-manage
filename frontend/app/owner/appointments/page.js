// app/owner/appointments/page.jsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { 
  useGetOwnerAppointmentsQuery, 
  useUpdateAppointmentStatusMutation 
} from '@/lib/services/appointmentApi'
import ProtectedRoute from '@/components/ProtectedRoute'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Phone,
  Check,
  X,
  AlertCircle,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'

function OwnerAppointmentsManager() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState('') // 'approve' | 'reject'
  const [actionNotes, setActionNotes] = useState('')

  // API hooks
  const { data: appointmentsData, isLoading, refetch } = useGetOwnerAppointmentsQuery({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    date: dateFilter || undefined
  })
  const [updateAppointmentStatus, { isLoading: isUpdating }] = useUpdateAppointmentStatusMutation()

  const appointments = appointmentsData || []
  // Status rengini döndür
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      'no-show': 'bg-orange-100 text-orange-800 border-orange-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  // Status Türkçe metni
  const getStatusText = (status) => {
    const texts = {
      pending: 'Onay Bekliyor',
      approved: 'Onaylandı',
      rejected: 'Reddedildi',
      cancelled: 'İptal Edildi',
      completed: 'Tamamlandı',
      'no-show': 'Gelmedi'
    }
    return texts[status] || status
  }

  // Tarih formatlama
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'short'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Bugünün tarihini al (input için)
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0]
  }

  // Action modal aç
  const openActionModal = (appointment, type) => {
    setSelectedAppointment(appointment)
    setActionType(type)
    setActionNotes('')
    setShowActionModal(true)
  }

  // Action işlemini gerçekleştir
  const handleAction = async () => {
    if (!selectedAppointment) return

    try {
      await updateAppointmentStatus({
        id: selectedAppointment._id,
        status: actionType === 'approve' ? 'approved' : 'rejected',
        notes: actionNotes
      }).unwrap()

      toast.success(
        actionType === 'approve' 
          ? 'Randevu onaylandı!' 
          : 'Randevu reddedildi!'
      )
      
      setShowActionModal(false)
      setSelectedAppointment(null)
      setActionNotes('')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'İşlem başarısız')
    }
  }

  // Randevuyu tamamla
  const markAsCompleted = async (appointmentId) => {
    try {
      await updateAppointmentStatus({
        id: appointmentId,
        status: 'completed'
      }).unwrap()
      toast.success('Randevu tamamlandı olarak işaretlendi')
      refetch()
    } catch (error) {
      toast.error('İşlem başarısız')
    }
  }

  // No-show olarak işaretle
  const markAsNoShow = async (appointmentId) => {
    try {
      await updateAppointmentStatus({
        id: appointmentId,
        status: 'no-show'
      }).unwrap()
      toast.success('Müşteri gelmedi olarak işaretlendi')
      refetch()
    } catch (error) {
      toast.error('İşlem başarısız')
    }
  }

  // Randevu bugün mü?
  const isToday = (dateString) => {
    const appointmentDate = new Date(dateString).toDateString()
    const today = new Date().toDateString()
    return appointmentDate === today
  }

  // Randevu geçmiş mi?
  const isPast = (dateString) => {
    return new Date(dateString) < new Date()
  }

  const statusOptions = [
    { value: 'all', label: 'Tümü' },
    { value: 'pending', label: 'Bekleyenler' },
    { value: 'approved', label: 'Onaylılar' },
    { value: 'completed', label: 'Tamamlananlar' },
    { value: 'cancelled', label: 'İptaller' },
    { value: 'rejected', label: 'Reddedilenler' }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Randevular yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <Calendar className="text-purple-600" size={28} />
                Randevu Yönetimi
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter size={16} className="inline mr-1" />
                Durum
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Tarih
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                min={getTodayString()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hızlı Erişim
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDateFilter(getTodayString())}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  Bugün
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('pending')
                    setDateFilter('')
                  }}
                  className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                >
                  Bekleyenler
                </button>
              </div>
            </div>
          </div>
        </div>

        {appointments.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {statusFilter === 'all' 
                ? 'Henüz randevu bulunmuyor' 
                : `${statusOptions.find(o => o.value === statusFilter)?.label} randevu bulunmuyor`
              }
            </h3>
            <p className="text-gray-600">
              Müşterilerinizin randevu alması bekleniyor
            </p>
          </div>
        ) : (
          // Appointments List
          <div className="space-y-4">
            {appointments?.appointments?.map((appointment) => (
              <div
                key={appointment._id}
                className={`bg-white rounded-xl shadow-sm p-6 transition-all hover:shadow-md ${
                  isToday(appointment.startDateTime) ? 'ring-2 ring-blue-200 bg-blue-50' : ''
                } ${isPast(appointment.startDateTime) && appointment.status === 'approved' ? 'bg-orange-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Customer & Service Info */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        {/* Customer Avatar */}
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="text-blue-600" size={24} />
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {appointment.userId?.fullName || 'Müşteri'}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
                            {appointment.userId?.phone && (
                              <a
                                href={`tel:${appointment.userId.phone}`}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                              >
                                <Phone size={14} />
                                {appointment.userId.phone}
                              </a>
                            )}
                            {appointment.userId?.email && (
                              <span className="text-gray-600 text-sm">{appointment.userId.email}</span>
                            )}
                          </div>
                          
                          {/* Service Info */}
                          <div className="mt-3">
                            <p className="font-medium text-purple-600">
                              {appointment.serviceSnapshot?.name || 'Hizmet'}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span>{appointment.serviceSnapshot?.duration} dakika</span>
                              <span className="font-semibold text-green-600">
                                {appointment.serviceSnapshot?.price}₺
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </div>
                        {isToday(appointment.startDateTime) && (
                          <div className="text-xs text-blue-600 font-medium mt-1">
                            📅 BUGÜN
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-center gap-6 mb-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span className="text-sm font-medium">{formatDate(appointment.startDateTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span className="text-sm font-medium">
                          {formatTime(appointment.startDateTime)} - {formatTime(appointment.endDateTime)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => openActionModal(appointment, 'approve')}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            disabled={isUpdating}
                          >
                            <Check size={16} />
                            Onayla
                          </button>
                          <button
                            onClick={() => openActionModal(appointment, 'reject')}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            disabled={isUpdating}
                          >
                            <X size={16} />
                            Reddet
                          </button>
                        </>
                      )}

                      {appointment.status === 'approved' && isPast(appointment.startDateTime) && (
                        <>
                          <button
                            onClick={() => markAsCompleted(appointment._id)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            disabled={isUpdating}
                          >
                            <CheckCircle size={16} />
                            Tamamlandı
                          </button>
                          <button
                            onClick={() => markAsNoShow(appointment._id)}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                            disabled={isUpdating}
                          >
                            <XCircle size={16} />
                            Gelmedi
                          </button>
                        </>
                      )}

                      {/* Müşteri ile iletişim */}
                      {appointment.userId?.phone && (
                        <a
                          href={`tel:${appointment.userId.phone}`}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          <Phone size={16} />
                          Ara
                        </a>
                      )}

                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        <Eye size={16} />
                        Detay
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Randevuyu {actionType === 'approve' ? 'Onayla' : 'Reddet'}
              </h3>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="font-medium text-gray-900">
                  {selectedAppointment.userId?.fullName}
                </p>
                <p className="text-purple-600 text-sm">
                  {selectedAppointment.serviceSnapshot?.name}
                </p>
                <p className="text-gray-600 text-sm">
                  {formatDate(selectedAppointment.startDateTime)} - {formatTime(selectedAppointment.startDateTime)}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare size={16} className="inline mr-1" />
                  {actionType === 'approve' ? 'Onay Notu (Opsiyonel)' : 'Red Sebebi'}
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                  placeholder={
                    actionType === 'approve' 
                      ? 'Randevunuz onaylanmıştır...'
                      : 'Üzgünüz, randevunuz reddedilmiştir çünkü...'
                  }
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleAction}
                  disabled={isUpdating || (actionType === 'reject' && !actionNotes.trim())}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                    actionType === 'approve'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isUpdating 
                    ? (actionType === 'approve' ? 'Onaylanıyor...' : 'Reddediliyor...') 
                    : (actionType === 'approve' ? 'Onayla' : 'Reddet')
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function OwnerAppointmentsPage() {
  return (
    <ProtectedRoute allowedRoles={['owner']}>
      <OwnerAppointmentsManager />
    </ProtectedRoute>
  )
}