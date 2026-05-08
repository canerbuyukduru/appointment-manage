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

  const generateTimeSlots = () => {
    const slots = []
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
      ...(name === 'departmentId' && { serviceId: '' })
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

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
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Geri Dön
          </button>

          <h1 className="text-3xl font-bold text-zinc-100 mb-2">
            Müşteri İçin Randevu Oluştur
          </h1>
          <p className="text-zinc-400">
            Müşteriniz adına yeni bir randevu oluşturun
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Müşteri Bilgileri */}
            <div className="border-b border-zinc-800 pb-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <User className="text-blue-400" size={20} />
                Müşteri Bilgileri
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    name="customerFullName"
                    value={formData.customerFullName}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors"
                    placeholder="Müşteri adı"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    <Mail className="inline mr-1" size={16} />
                    Email
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors"
                    placeholder="ornek@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    <Phone className="inline mr-1" size={16} />
                    Telefon
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors"
                    placeholder="0555 123 45 67"
                  />
                </div>
              </div>

              <p className="text-sm text-zinc-500 mt-2">
                * Email veya telefon bilgilerinden en az biri zorunludur
              </p>
            </div>

            {/* Randevu Bilgileri */}
            <div className="border-b border-zinc-800 pb-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <Calendar className="text-purple-400" size={20} />
                Randevu Bilgileri
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Departman
                  </label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none appearance-none transition-colors"
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
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Hizmet
                  </label>
                  <select
                    name="serviceId"
                    value={formData.serviceId}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none appearance-none transition-colors disabled:opacity-50"
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
            <div className="border-b border-zinc-800 pb-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <Clock className="text-green-400" size={20} />
                Tarih ve Saat
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Tarih
                  </label>
                  <select
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none appearance-none transition-colors"
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
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Saat
                  </label>
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none appearance-none transition-colors"
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
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                <FileText className="inline mr-1" size={16} />
                Notlar (Opsiyonel)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors"
                placeholder="Randevu ile ilgili notlar..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg transition-colors"
              >
                İptal
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
