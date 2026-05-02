// lib/services/appointmentApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// .env dosyasından URL'i çek, yoksa varsayılan olarak localhost kullan
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const appointmentApi = createApi({
  reducerPath: "appointmentApi",
  baseQuery: fetchBaseQuery({
    // Temel API adresi (Tüm isteklerin başına otomatik eklenir)
    baseUrl: `${BASE_URL}/api`, 
    credentials: "include",
  }),
  tagTypes: ["Appointment"],
  endpoints: (builder) => ({
    createAppointment: builder.mutation({
      query: (appointmentData) => ({
        url: "/appointments", // Sadece son eki yazıyoruz
        method: "POST",
        body: appointmentData,
      }),
      invalidatesTags: ["Appointment"],
    }),

    getMyAppointments: builder.query({
      query: () => "/appointments/my",
      providesTags: ["Appointment"],
    }),

    getOwnerAppointments: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.status && params.status !== "all") searchParams.append("status", params.status);
        if (params.date) searchParams.append("date", params.date);

        // baseUrl zaten "/api" ile bittiği için sadece devamını yazıyoruz
        return `/owners/appointments?${searchParams.toString()}`;
      },
      providesTags: ["Appointment"],
    }),

    updateAppointmentStatus: builder.mutation({
      query: ({ id, status, notes }) => ({
        url: `/owners/appointments/${id}/status`,
        method: "PATCH",
        body: { status, notes },
      }),
      invalidatesTags: ["Appointment"],
    }),

    createAppointmentForCustomer: builder.mutation({
      query: (appointmentData) => ({
        url: `/owners/appointments/create-for-customer`,
        method: "POST",
        body: appointmentData,
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

        return `/appointments/availability?${params.toString()}`;
      },
      providesTags: ["Appointment"],
    }),
  }),
});

export const {
  useCreateAppointmentMutation,
  useGetMyAppointmentsQuery,
  useCancelAppointmentMutation,
  useGetAvailableSlotsQuery,
  useGetOwnerAppointmentsQuery,
  useUpdateAppointmentStatusMutation,
  useCreateAppointmentForCustomerMutation,
} = appointmentApi;

export default appointmentApi;