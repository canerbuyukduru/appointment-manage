// app/appointments/page.jsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import {
  useGetMyAppointmentsQuery,
  useCancelAppointmentMutation
} from '@/lib/services/appointmentApi'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  X,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreHorizontal,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import { getErrorMessage, getToastDuration } from '@/lib/utils/errorMessages'

function AppointmentsManager() {
  const router = useRouter()
  const { user } = useSelector((state) => state.auth)
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState(null)

  const { data: appointmentsData, isLoading, refetch } = useGetMyAppointmentsQuery()
  const [cancelAppointment, { isLoading: isCancelling }] = useCancelAppointmentMutation()

  const appointments = appointmentsData || []

  const filteredAppointments = appointments.filter(appointment => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'active') {
      return ['approved'].includes(appointment.status)
    }
    if (statusFilter === 'completed') {
      return ['completed', 'cancelled', 'rejected', 'no-show'].includes(appointment.status)
    }
    return appointment.status === statusFilter
  })

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-950/50 text-yellow-400',
      approved: 'bg-green-950/50 text-green-400',
      rejected: 'bg-red-950/50 text-red-400',
      cancelled: 'bg-zinc-700 text-zinc-300',
      completed: 'bg-blue-950/50 text-blue-400',
      'no-show': 'bg-red-950/50 text-red-400'
    }
    return colors[status] || 'bg-zinc-700 text-zinc-300'
  }

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

  const getStatusIcon = (status) => {
    const iconProps = { size: 16 }
    switch (status) {
      case 'pending':
        return <Clock {...iconProps} />
      case 'approved':
        return <CheckCircle {...iconProps} />
      case 'completed':
        return <CheckCircle {...iconProps} />
      case 'rejected':
      case 'cancelled':
      case 'no-show':
        return <XCircle {...iconProps} />
      default:
        return <AlertCircle {...iconProps} />
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const canCancel = (appointment) => {
    if (!['pending', 'approved'].includes(appointment.status)) return false

    const appointmentDate = new Date(appointment.startDateTime)
    const now = new Date()
    const hoursDiff = (appointmentDate - now) / (1000 * 60 * 60)

    return hoursDiff > 24
  }

  const handleCancelClick = (appointment) => {
    setAppointmentToCancel(appointment)
    setShowCancelModal(true)
  }

  const confirmCancel = async () => {
    try {
      await cancelAppointment(appointmentToCancel._id).unwrap()
      toast.success('Randevunuz iptal edildi')
      setShowCancelModal(false)
      setAppointmentToCancel(null)
      refetch()
    } catch (error) {
      toast.error(getErrorMessage(error, 'İptal işlemi başarısız'), { duration: getToastDuration(error) })
    }
  }

  const isPastAppointment = (appointment) => {
    const appointmentDate = new Date(appointment.startDateTime)
    const now = new Date()
    return appointmentDate < now
  }

  const statusOptions = [
    { value: 'all', label: 'Tümü', count: appointments.length },
    {
      value: 'active',
      label: 'Aktif',
      count: appointments.filter(a => ['approved'].includes(a.status)).length
    },
    {
      value: 'completed',
      label: 'Geçmiş',
      count: appointments.filter(a => ['completed', 'cancelled', 'rejected', 'no-show'].includes(a.status)).length
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Randevularınız yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <ArrowLeft size={20} />
                Dashboard
              </Link>
              <div className="w-px h-6 bg-zinc-700"></div>
              <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
                <Calendar className="text-purple-400" size={28} />
                Randevularım
              </h1>
            </div>

            <Link
              href="/"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all"
            >
              Yeni Randevu Al
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-1">
            <Filter size={20} className="text-zinc-500 mr-2" />
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === option.value
                    ? 'bg-purple-950/50 text-purple-400'
                    : 'text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <Calendar className="mx-auto text-zinc-600 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">
              {statusFilter === 'all'
                ? 'Henüz randevunuz bulunmuyor'
                : `${statusOptions.find(o => o.value === statusFilter)?.label} randevu bulunmuyor`
              }
            </h3>
            <p className="text-zinc-400 mb-6">
              Güzellik merkezlerinden randevu alarak başlayabilirsiniz
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all"
            >
              İlk Randevunuzu Alın
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments?.map((appointment) => (
              <div
                key={appointment._id}
                className={`bg-zinc-900 border border-zinc-800 rounded-xl p-6 transition-all hover:border-zinc-700 ${
                  isPastAppointment(appointment) ? 'opacity-70' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Beauty Center & Service Info */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-100 mb-1">
                          {appointment.beautyCenterId?.name || 'Güzellik Merkezi'}
                        </h3>
                        <p className="text-purple-400 font-medium">
                          {appointment.serviceSnapshot?.name || appointment.serviceId?.name}
                        </p>
                        {appointment.serviceSnapshot?.duration && (
                          <p className="text-sm text-zinc-500">
                            {appointment.serviceSnapshot.duration} dakika
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          {getStatusText(appointment.status)}
                        </div>
                        {appointment.serviceSnapshot?.price && (
                          <p className="text-lg font-semibold text-zinc-100 mt-2">
                            {appointment.serviceSnapshot.price}₺
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Calendar size={16} className="text-zinc-500" />
                        <span className="text-sm">{formatDate(appointment.startDateTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Clock size={16} className="text-zinc-500" />
                        <span className="text-sm">
                          {formatTime(appointment.startDateTime)} - {formatTime(appointment.endDateTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400">
                        <MapPin size={16} className="text-zinc-500" />
                        <span className="text-sm">
                          {appointment.beautyCenterId?.location || appointment.beautyCenterId?.address || 'Adres bilgisi yok'}
                        </span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    {appointment.beautyCenterId?.phone && (
                      <div className="flex items-center gap-2 text-zinc-400 mb-4">
                        <Phone size={16} className="text-zinc-500" />
                        <span className="text-sm">{appointment.beautyCenterId.phone}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {canCancel(appointment) && (
                        <button
                          onClick={() => handleCancelClick(appointment)}
                          className="flex items-center gap-2 px-4 py-2 border border-red-900 text-red-400 rounded-lg hover:bg-red-950/30 transition-colors text-sm"
                          disabled={isCancelling}
                        >
                          <X size={16} />
                          İptal Et
                        </button>
                      )}

                      {appointment.beautyCenterId?.phone && (
                        <a
                          href={`tel:${appointment.beautyCenterId.phone}`}
                          className="flex items-center gap-2 px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors text-sm"
                        >
                          <Phone size={16} />
                          Ara
                        </a>
                      )}

                      <button className="flex items-center gap-2 px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors text-sm">
                        <MoreHorizontal size={16} />
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

      {/* Cancel Confirmation Modal */}
      {showCancelModal && appointmentToCancel && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4">
                Randevu İptali
              </h3>
              <p className="text-zinc-300 mb-2">
                <strong>{appointmentToCancel.serviceSnapshot?.name}</strong> hizmetiniz için
              </p>
              <p className="text-zinc-300 mb-6">
                <strong>{formatDate(appointmentToCancel.startDateTime)}</strong> tarihindeki randevunuzu iptal etmek istediğinizden emin misiniz?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg font-medium transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  onClick={confirmCancel}
                  disabled={isCancelling}
                  className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isCancelling ? 'İptal Ediliyor...' : 'İptal Et'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AppointmentsPage() {
  return <AppointmentsManager />
}
