// lib/services/appointmentApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const appointmentApi = createApi({
  reducerPath: "appointmentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/appointments",
    credentials: "include",
  }),
  tagTypes: ["Appointment"],
  endpoints: (builder) => ({
    // Kullanıcı randevu oluşturur
    createAppointment: builder.mutation({
      query: (appointmentData) => ({
        url: "/",
        method: "POST",
        body: appointmentData,
      }),
      invalidatesTags: ["Appointment"],
    }),

    // Kullanıcının kendi randevularını görüntülemesi
    getMyAppointments: builder.query({
      query: () => "/my",
      providesTags: ["Appointment"],
    }),

    // Kullanıcının kendi randevusunu iptal etmesi
    cancelAppointment: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Appointment"],
    }),

    // Owner'ın işletmesine gelen randevuları görüntülemesi
    getOwnerAppointments: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.status && params.status !== "all")
          searchParams.append("status", params.status);
        if (params.date) searchParams.append("date", params.date);

        // Backend route: /api/owners/appointments
        return {
          url: `http://localhost:5000/api/owners/appointments?${searchParams.toString()}`,
        };
      },
      providesTags: ["Appointment"],
    }),

    // Owner randevu durumunu günceller (approve/reject)
    updateAppointmentStatus: builder.mutation({
      query: ({ id, status, notes }) => ({
        url: `http://localhost:5000/api/owners/appointments/${id}/status`,
        method: "PATCH",
        body: { status, notes },
      }),
      invalidatesTags: ["Appointment"],
    }),
    getAvailableSlots: builder.query({
      query: ({ beautyCenterId, departmentId, serviceId, date }) => {
        const params = new URLSearchParams();
        if (beautyCenterId) params.append("beautyCenterId", beautyCenterId);
        if (departmentId) params.append("departmentId", departmentId);
        if (serviceId) params.append("serviceId", serviceId);
        if (date) params.append("date", date);

        return `/availability?${params.toString()}`;
      },
      providesTags: ["Appointment"],
    }),
    createAppointmentForCustomer: builder.mutation({
      query: (appointmentData) => ({
        url: `http://localhost:5000/api/owners/appointments/create-for-customer`,
        method: "POST",
        body: appointmentData,
      }),
      invalidatesTags: ["Appointment", "OwnerAppointments"],
    }),
  }),
});

// Hook'ları export et
export const {
  useCreateAppointmentMutation,
  useGetMyAppointmentsQuery,
  useCancelAppointmentMutation,
  useGetAvailableSlotsQuery,
  useGetOwnerAppointmentsQuery,
  useUpdateAppointmentStatusMutation,
  useCreateAppointmentForCustomerMutation,
} = appointmentApi;

// Default export da ekle
export default appointmentApi;
