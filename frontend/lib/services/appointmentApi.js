import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const appointmentApi = createApi({
  reducerPath: "appointmentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,            // ← DOĞRU
    credentials: "include",
  }),
  tagTypes: ["Appointment"],
  endpoints: (builder) => ({
    createAppointment: builder.mutation({
      query: (appointmentData) => ({
        url: "/appointments",
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
    // DÜZELTME: PATCH → DELETE, URL düzeltildi
    cancelAppointment: builder.mutation({
      query: (appointmentId) => ({
        url: `/appointments/${appointmentId}`,
        method: "DELETE",
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
    // DÜZELTME: /appointments/availability → /availability
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
  }),
});

export const {
  useCreateAppointmentMutation,
  useGetMyAppointmentsQuery,
  useGetOwnerAppointmentsQuery,
  useUpdateAppointmentStatusMutation,
  useCancelAppointmentMutation,
  useCreateAppointmentForCustomerMutation,
  useGetAvailableSlotsQuery,
} = appointmentApi;