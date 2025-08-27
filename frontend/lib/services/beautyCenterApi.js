// lib/services/beautyCenterApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const beautyCenterApi = createApi({
  reducerPath: 'beautyCenterApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/beauty-centers',
    credentials: 'include', // Cookie'leri gönder
  }),
  tagTypes: ['BeautyCenter'],
  endpoints: (builder) => ({
    // Owner kendi merkezini oluşturur
    createBeautyCenter: builder.mutation({
      query: (centerData) => ({
        url: '/',
        method: 'POST',
        body: centerData,
      }),
      invalidatesTags: ['BeautyCenter'],
    }),

    // Owner kendi merkezini görür
    getMyBeautyCenter: builder.query({
      query: () => '/mine',
      providesTags: ['BeautyCenter'],
    }),

    // Owner kendi merkezini günceller
    updateMyBeautyCenter: builder.mutation({
      query: (centerData) => ({
        url: '/mine',
        method: 'PUT',
        body: centerData,
      }),
      invalidatesTags: ['BeautyCenter'],
    }),

    // Herkes için tüm merkezleri listele (PUBLIC - Authentication YOK)
    getAllBeautyCenters: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams()
        if (params.search) searchParams.append('search', params.search)
        if (params.location) searchParams.append('location', params.location)
        if (params.page) searchParams.append('page', params.page)
        
        return {
          url: `http://localhost:5000/api/beauty-centers?${searchParams.toString()}`
          // credentials kaldırdık, çünkü public endpoint
        }
      },
      providesTags: ['BeautyCenter'],
    }),

    // Belirli bir merkezi detaylarıyla getir (public)
    getBeautyCenterById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ['BeautyCenter'],
    }),

    // Belirli bir center'ın department'larını getir (public)
    getCenterDepartments: builder.query({
      query: (centerId) => `/${centerId}/departments`,
      providesTags: ['BeautyCenter'],
    }),
  }),
})

// Hook'ları export et
export const {
  useCreateBeautyCenterMutation,
  useGetMyBeautyCenterQuery,
  useUpdateMyBeautyCenterMutation,
  useGetAllBeautyCentersQuery,
  useGetBeautyCenterByIdQuery,
  useGetCenterDepartmentsQuery,
} = beautyCenterApi

// Default export da ekle
export default beautyCenterApi