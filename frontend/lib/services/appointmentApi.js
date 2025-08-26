// lib/services/appointmentApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const appointmentApi = createApi({
  reducerPath: 'appointmentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/appointments',
    credentials: 'include',
  }),
  tagTypes: ['Appointment'],
  endpoints: (builder) => ({
    // Kullanıcı randevu oluşturur
    createAppointment: builder.mutation({
      query: (appointmentData) => ({
        url: '/',
        method: 'POST',
        body: appointmentData,
      }),
      invalidatesTags: ['Appointment'],
    }),

    // Kullanıcının kendi randevularını görüntülemesi
    getMyAppointments: builder.query({
      query: () => '/my',
      providesTags: ['Appointment'],
    }),

    // Kullanıcının kendi randevusunu iptal etmesi
    cancelAppointment: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Appointment'],
    }),

    // Belirli bir center, service ve tarih için müsait saatleri getir
    getAvailableSlots: builder.query({
      query: ({ beautyCenterId, departmentId, serviceId, date }) => {
        const params = new URLSearchParams()
        if (beautyCenterId) params.append('beautyCenterId', beautyCenterId)
        if (departmentId) params.append('departmentId', departmentId)
        if (serviceId) params.append('serviceId', serviceId)
        if (date) params.append('date', date)
        
        return `/availability?${params.toString()}`
      },
      providesTags: ['Appointment'],
    }),
  }),
})

// Hook'ları export et
export const {
  useCreateAppointmentMutation,
  useGetMyAppointmentsQuery,
  useCancelAppointmentMutation,
  useGetAvailableSlotsQuery,
} = appointmentApi

// Default export da ekle
export default appointmentApi