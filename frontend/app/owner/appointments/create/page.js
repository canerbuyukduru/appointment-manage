'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGetMyBeautyCenterQuery, useGetCenterDepartmentsQuery } from '@/lib/services/beautyCenterApi'
import { useGetServicesByDepartmentQuery } from '@/lib/services/serviceApi'
import { useCreateAppointmentForCustomerMutation } from '@/lib/services/appointmentApi'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Calendar, Clock, User, Phone, Mail, FileText } from 'lucide-react'

export default function CreateAppointmentPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    customerFullName: '',
    customerEmail: '',
    customerPhone: '',
    departmentId: '',
    serviceId: '',
    date: '',
    time: '',
    notes: ''
  })

  const { data: centerInfo } = useGetMyBeautyCenterQuery()
  const { data: departments } = useGetCenterDepartmentsQuery(centerInfo?._id, {
    skip: !centerInfo?._id
  })
  const { data: services } = useGetServicesByDepartmentQuery(formData.departmentId, {
    skip: !formData.departmentId
  })

  const [createAppointmentForCustomer, { isLoading }] = useCreateAppointmentForCustomerMutation()

  // Bugünden itibaren 30 gün için tarih seçenekleri
  const generateAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('tr-TR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      })
    }
    return dates
  }

  // Saat seçenekleri (merkez çalışma saatlerine göre)
  const generateTimeSlots = () => {
    const slots = []
    // Basit bir implementasyon - 09:00'dan 18:00'e kadar 30dk aralıklarla
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push({
          value: timeString,
          label: timeString
        })
      }
    }
    return slots
  }

  const availableDates = generateAvailableDates()
  const timeSlots = generateTimeSlots()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Departman değiştiğinde servisi sıfırla
      ...(name === 'departmentId' && { serviceId: '' })
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validasyon
    if (!formData.customerEmail && !formData.customerPhone) {
      toast.error('Müşteri email veya telefon bilgisi zorunludur')
      return
    }

    if (!formData.departmentId || !formData.serviceId || !formData.date || !formData.time) {
      toast.error('Tüm gerekli alanları doldurun')
      return
    }

    try {
      const startDateTime = new Date(`${formData.date}T${formData.time}:00`)
      await createAppointmentForCustomer({
        customerFullName: formData.customerFullName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        departmentId: formData.departmentId,
        serviceId: formData.serviceId,
        startDateTime: startDateTime.toISOString(),
        notes: formData.notes
      }).unwrap()

      toast.success('Randevu başarıyla oluşturuldu!')
      router.push('/owner/appointments')
    } catch (error) {
      toast.error(error?.data?.message || 'Randevu oluşturulurken hata oluştu')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft size={20} />
            Geri Dön
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Müşteri İçin Randevu Oluştur
          </h1>
          <p className="text-gray-600">
            Müşteriniz adına yeni bir randevu oluşturun
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Müşteri Bilgileri */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="text-blue-600" size={20} />
                Müşteri Bilgileri
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    name="customerFullName"
                    value={formData.customerFullName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Müşteri adı"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline mr-1" size={16} />
                    Email
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="ornek@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline mr-1" size={16} />
                    Telefon
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0555 123 45 67"
                  />
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mt-2">
                * Email veya telefon bilgilerinden en az biri zorunludur
              </p>
            </div>

            {/* Randevu Bilgileri */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="text-purple-600" size={20} />
                Randevu Bilgileri
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departman
                  </label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    required
                  >
                    <option value="">Departman Seçin</option>
                    {departments?.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hizmet
                  </label>
                  <select
                    name="serviceId"
                    value={formData.serviceId}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    required
                    disabled={!formData.departmentId}
                  >
                    <option value="">Hizmet Seçin</option>
                    {services?.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.name} - {service.duration}dk - ₺{service.price}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tarih ve Saat */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="text-green-600" size={20} />
                Tarih ve Saat
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarih
                  </label>
                  <select
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    required
                  >
                    <option value="">Tarih Seçin</option>
                    {availableDates.map((date) => (
                      <option key={date.value} value={date.value}>
                        {date.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Saat
                  </label>
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    required
                  >
                    <option value="">Saat Seçin</option>
                    {timeSlots.map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Notlar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline mr-1" size={16} />
                Notlar (Opsiyonel)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Randevu ile ilgili notlar..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Oluşturuluyor...' : 'Randevu Oluştur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}