// lib/services/departmentApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const departmentApi = createApi({
  reducerPath: 'departmentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/departments',
    credentials: 'include',
  }),
  tagTypes: ['Department'],
  endpoints: (builder) => ({
    // Yeni department oluştur
    createDepartment: builder.mutation({
      query: (departmentData) => ({
        url: '/',
        method: 'POST',
        body: departmentData,
      }),
      invalidatesTags: ['Department'],
    }),

    // Owner'ın department'larını getir
    getDepartments: builder.query({
      query: () => '/',
      providesTags: ['Department'],
    }),

    // Department güncelle
    updateDepartment: builder.mutation({
      query: ({ id, ...departmentData }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: departmentData,
      }),
      invalidatesTags: ['Department'],
    }),

    // Department sil
    deleteDepartment: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Department'],
    }),
  }),
})

// Named exports
export const {
  useCreateDepartmentMutation,
  useGetDepartmentsQuery,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentApi

// Default export
export default departmentApi
export { departmentApi }