// app/centers/[centerId]/booking/page.jsx
'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { useGetAllBeautyCentersQuery,useGetCenterDepartmentsQuery } from '@/lib/services/beautyCenterApi'
import { useGetServicesByDepartmentQuery } from '@/lib/services/serviceApi'
import { useCreateAppointmentMutation, useGetAvailableSlotsQuery } from '@/lib/services/appointmentApi'
import ProtectedRoute from '@/components/ProtectedRoute'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  DollarSign, 
  MapPin, 
  Phone,
  CheckCircle,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

function BookingProcess() {
  const params = useParams()
  const router = useRouter()
  const centerId = params.centerId
  const { user } = useSelector((state) => state.auth)

  // State management
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  // API calls
  const { data: centersData, isLoading: isLoadingCenter } = useGetAllBeautyCentersQuery({})
  const center = centersData?.find(c => c._id === centerId)

  const { data: servicesData } = useGetServicesByDepartmentQuery(
    selectedDepartment?._id, 
    { skip: !selectedDepartment }
  )

  const {data:departmentsData} = useGetCenterDepartmentsQuery(centerId)



  const [createAppointment, { isLoading: isCreating }] = useCreateAppointmentMutation()
  
  // Gerçek availability API'si
  const { data: availabilityData, isLoading: isLoadingSlots } = useGetAvailableSlotsQuery({
    beautyCenterId: centerId,
    departmentId: selectedDepartment?._id,
    serviceId: selectedService?._id,
    date: selectedDate
  }, {
    skip: !centerId || !selectedService || !selectedDate
  })

  const departments = departmentsData || []
  const services = servicesData || []

  // Bugünden sonraki 30 günü generate et
  const generateAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      const dateString = date.toISOString().split('T')[0]
      const dayName = date.toLocaleDateString('tr-TR', { weekday: 'long' })
      const dateFormatted = date.toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'long' 
      })
      
      dates.push({
        value: dateString,
        label: `${dateFormatted}, ${dayName}`,
        date: date
      })
    }
    return dates
  }

  // Çalışma saatlerine göre müsait saatleri generate et (fallback - API yoksa)
  const generateAvailableSlots = (date) => {
    if (!center?.workingHours || !date) return []
    
    const selectedDate = new Date(date)
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][selectedDate.getDay()]
    const daySchedule = center.workingHours[dayName]
    
    if (!daySchedule || daySchedule.isClosed) return []
    
    const slots = []
    const openTime = daySchedule.open.split(':')
    const closeTime = daySchedule.close.split(':')
    
    const startHour = parseInt(openTime[0])
    const startMinute = parseInt(openTime[1])
    const endHour = parseInt(closeTime[0])
    const endMinute = parseInt(closeTime[1])
    
    // Service duration'a göre slotlar oluştur
    const duration = selectedService?.duration || 30
    let currentHour = startHour
    let currentMinute = startMinute
    
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
      slots.push({
        value: timeString,
        label: timeString
      })
      
      // Service duration kadar ekle
      currentMinute += duration
      while (currentMinute >= 60) {
        currentHour += 1
        currentMinute -= 60
      }
    }
    
    return slots
  }

  const availableDates = generateAvailableDates()
  
  // API'den gelen slotları kullan, yoksa fallback
  const availableSlots = availabilityData?.slots 
    ? availabilityData.slots.map(slot => ({ value: slot, label: slot }))
    : generateAvailableSlots(selectedDate)

  // Randevu oluştur
  const handleCreateAppointment = async () => {
    try {
      // Backend schema'nıza göre format
      const startDateTime = new Date(`${selectedDate}T${selectedTime}:00.000Z`)
      const endDateTime = new Date(startDateTime.getTime() + (selectedService.duration * 60000)) // duration dakika ekle
      
      const appointmentData = {
        // Backend otomatik userId'yi auth'dan alır
        beautyCenterId: centerId,
        departmentId: selectedDepartment._id,
        serviceId: selectedService._id,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        // Backend default status: 'pending' set eder
        // serviceSnapshot backend'de otomatik oluşturulur
      }

      await createAppointment(appointmentData).unwrap()
      toast.success('Randevunuz başarıyla oluşturuldu! Onay bekleniyor.')
      router.push('/user/appointments') // Randevularım sayfasına git
    } catch (error) {
      console.error('Appointment error:', error)
      toast.error(error.data?.message || 'Randevu oluşturulamadı')
    }
  }

  const steps = [
    { number: 1, title: 'Hizmet Seç', completed: currentStep > 1 },
    { number: 2, title: 'Tarih & Saat', completed: currentStep > 2 },
    { number: 3, title: 'Onay', completed: false },
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

  if (!center) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Güzellik merkezi bulunamadı</h2>
          <Link href="/" className="text-purple-600 hover:text-purple-700">Ana sayfaya dön</Link>
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
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
                Ana Sayfa
              </Link>
              <div className="w-px h-6 bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Randevu Al</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : currentStep === step.number 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.completed ? (
                    <CheckCircle size={20} />
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step.completed || currentStep === step.number 
                    ? 'text-gray-900' 
                    : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="mx-4 text-gray-400" size={20} />
              )}
            </div>
          ))}
        </div>

        {/* Beauty Center Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-600">
                {center.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{center.name}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  <span>{typeof center.location === 'string' ? center.location : center.address || 'Konum bilgisi yok'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone size={16} />
                  <span>{center.phone}</span>
                </div>
              </div>
              {center.description && (
                <p className="text-gray-600 text-sm mt-2">{center.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Step 1: Service Selection */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Hizmet Seçin</h3>
            
            {departments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Bu merkez henüz hizmet eklenmemiş</p>
              </div>
            ) : (
              <div className="space-y-4">
                {departments.map((department) => (
                  <div key={department._id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => {
                        setSelectedDepartment(department)
                        setSelectedService(null) // Service seçimini resetle
                      }}
                      className={`w-full p-4 text-left rounded-lg transition-colors ${
                        selectedDepartment?._id === department._id
                          ? 'bg-purple-50 border-purple-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <h4 className="font-medium text-gray-900">{department.name}</h4>
                      {department.description && (
                        <p className="text-sm text-gray-600 mt-1">{department.description}</p>
                      )}
                    </button>
                    
                    {selectedDepartment?._id === department._id && services.length > 0 && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <h5 className="font-medium text-gray-900 mb-3">Hizmetler:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {services.map((service) => (
                            <button
                              key={service._id}
                              onClick={() => setSelectedService(service)}
                              className={`p-3 rounded-lg border text-left transition-colors ${
                                selectedService?._id === service._id
                                  ? 'bg-purple-100 border-purple-300'
                                  : 'bg-white border-gray-200 hover:border-purple-200'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h6 className="font-medium text-gray-900">{service.name}</h6>
                                <span className="text-green-600 font-medium">{service.price}₺</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock size={14} />
                                <span>{service.duration} dakika</span>
                              </div>
                              {service.description && (
                                <p className="text-sm text-gray-600 mt-2">{service.description}</p>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {selectedService && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Devam Et
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Date & Time Selection */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Tarih ve Saat Seçin</h3>
              <button
                onClick={() => setCurrentStep(1)}
                className="text-gray-600 hover:text-gray-800"
              >
                Geri Dön
              </button>
            </div>

            {/* Selected Service Info */}
            {selectedService && (
              <div className="bg-purple-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedService.name}</h4>
                    <p className="text-sm text-gray-600">{selectedService.duration} dakika</p>
                  </div>
                  <span className="text-lg font-semibold text-purple-600">{selectedService.price}₺</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Selection */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Tarih Seçin</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableDates.map((date) => (
                    <button
                      key={date.value}
                      onClick={() => {
                        setSelectedDate(date.value)
                        setSelectedTime('') // Reset time when date changes
                      }}
                      className={`w-full p-3 text-left rounded-lg border transition-colors ${
                        selectedDate === date.value
                          ? 'bg-purple-100 border-purple-300'
                          : 'border-gray-200 hover:border-purple-200'
                      }`}
                    >
                      {date.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Saat Seçin</h4>
                {selectedDate ? (
                  isLoadingSlots ? (
                    <div className="text-center py-8">
                      <div className="animate-pulse text-gray-500">Müsait saatler yükleniyor...</div>
                    </div>
                  ) : availabilityData?.message ? (
                    <div className="text-center py-8">
                      <p className="text-red-600">{availabilityData.message}</p>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.value}
                          onClick={() => setSelectedTime(slot.value)}
                          className={`p-2 text-sm rounded-lg border transition-colors ${
                            selectedTime === slot.value
                              ? 'bg-purple-100 border-purple-300'
                              : 'border-gray-200 hover:border-purple-200'
                          }`}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Bu tarihte müsait saat yok</p>
                  )
                ) : (
                  <p className="text-gray-500">Önce tarih seçin</p>
                )}
              </div>
            </div>

            {selectedDate && selectedTime && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Devam Et
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Randevu Özeti</h3>
              <button
                onClick={() => setCurrentStep(2)}
                className="text-gray-600 hover:text-gray-800"
              >
                Geri Dön
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between">
                <span className="text-gray-600">Güzellik Merkezi:</span>
                <span className="font-medium">{center.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hizmet:</span>
                <span className="font-medium">{selectedService.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tarih:</span>
                <span className="font-medium">
                  {availableDates.find(d => d.value === selectedDate)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Saat:</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Süre:</span>
                <span className="font-medium">{selectedService.duration} dakika</span>
              </div>
              <div className="flex justify-between border-t pt-4">
                <span className="text-lg font-semibold">Toplam:</span>
                <span className="text-lg font-semibold text-purple-600">{selectedService.price}₺</span>
              </div>
            </div>

            <button
              onClick={handleCreateAppointment}
              disabled={isCreating}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Randevu Oluşturuluyor...' : 'Randevuyu Onayla'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <ProtectedRoute allowedRoles={['user']}>
      <BookingProcess />
    </ProtectedRoute>
  )
}