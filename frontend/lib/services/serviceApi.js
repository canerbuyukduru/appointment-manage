// lib/services/serviceApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const serviceApi = createApi({
  reducerPath: 'serviceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/services',
    credentials: 'include',
  }),
  tagTypes: ['Service'],
  endpoints: (builder) => ({
    // Yeni service oluştur (departmana bağlı)
    createService: builder.mutation({
      query: (serviceData) => ({
        url: '/',
        method: 'POST',
        body: serviceData, // { name, description, price, duration, departmentId }
      }),
      invalidatesTags: ['Service'],
    }),

    // Belirli departmana ait servisleri getir
    getServicesByDepartment: builder.query({
      query: (departmentId) => `/department/${departmentId}`,
      providesTags: ['Service'],
    }),

    // Tüm servisleri getir (owner'ın tüm departmanlarından)
    getAllServices: builder.query({
      query: () => '/',
      providesTags: ['Service'],
    }),

    // Service güncelle
    updateService: builder.mutation({
      query: ({ id, ...serviceData }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: serviceData,
      }),
      invalidatesTags: ['Service'],
    }),

    // Service sil
    deleteService: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Service'],
    }),
  }),
})

// Hook'ları export et
export const {
  useCreateServiceMutation,
  useGetServicesByDepartmentQuery,
  useGetAllServicesQuery,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = serviceApi

// Default export da ekle
export default serviceApi