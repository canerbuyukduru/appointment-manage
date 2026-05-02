// lib/services/beautyCenterApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Environment'dan gelen URL'i kullan, yoksa fallback olarak localhost kullan
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const beautyCenterApi = createApi({
  reducerPath: 'beautyCenterApi',
  baseQuery: fetchBaseQuery({
    // Artık sonuna /beauty-centers eklemiyoruz çünkü bazı endpointler farklı olabilir
    // veya daha temiz bir yapı için sadece ana API yolunu veriyoruz
    baseUrl: `${BASE_URL}/beauty-centers`, 
    credentials: 'include',
  }),
  tagTypes: ['BeautyCenter'],
  endpoints: (builder) => ({
    createBeautyCenter: builder.mutation({
      query: (centerData) => ({
        url: '/',
        method: 'POST',
        body: centerData,
      }),
      invalidatesTags: ['BeautyCenter'],
    }),

    getMyBeautyCenter: builder.query({
      query: () => '/mine',
      providesTags: ['BeautyCenter'],
    }),

    updateMyBeautyCenter: builder.mutation({
      query: (centerData) => ({
        url: '/mine',
        method: 'PUT',
        body: centerData,
      }),
      invalidatesTags: ['BeautyCenter'],
    }),

    getAllBeautyCenters: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.search) searchParams.append('search', params.search);
        if (params.location) searchParams.append('location', params.location);
        if (params.page) searchParams.append('page', params.page);
        
        // DÜZELTME: Tam URL yazmak yerine sadece sorgu parametrelerini dönüyoruz
        // fetchBaseQuery otomatik olarak baseUrl + '/' + bu url'i birleştirecektir.
        return `?${searchParams.toString()}`;
      },
      providesTags: ['BeautyCenter'],
    }),

    getBeautyCenterById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ['BeautyCenter'],
    }),

    getCenterDepartments: builder.query({
      query: (centerId) => `/${centerId}/departments`,
      providesTags: ['BeautyCenter'],
    }),
  }),
});

export const {
  useCreateBeautyCenterMutation,
  useGetMyBeautyCenterQuery,
  useUpdateMyBeautyCenterMutation,
  useGetAllBeautyCentersQuery,
  useGetBeautyCenterByIdQuery,
  useGetCenterDepartmentsQuery,
} = beautyCenterApi;

export default beautyCenterApi;