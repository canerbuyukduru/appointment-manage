// lib/services/adminApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
// Değişkeni fonksiyonun DIŞINDA tanımlıyoruz
const baseUrl = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/admin` 
  : 'http://localhost:5000/api/admin';

  
export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    credentials: 'include', // Cookie'leri gönder
  }),
  tagTypes: ['AdminStats', 'PendingOwners', 'AllOwners', 'AllUsers', 'BeautyCenters', 'OwnerDetails'],
  endpoints: (builder) => ({
    // Admin Login
    loginAdmin: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    logoutAdmin: builder.mutation({
        query: () => ({
            url: '/logout',
            method: 'POST',
        })
    }),
    // Dashboard İstatistikleri
    getAdminStats: builder.query({
      query: () => '/stats',
      providesTags: ['AdminStats'],
    }),

    // Owner Management
    getPendingOwners: builder.query({
      query: () => '/owners/pending',
      providesTags: ['PendingOwners'],
    }),

    getAllOwners: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams()
        if (params.status) searchParams.append('status', params.status)
        if (params.page) searchParams.append('page', params.page)
        if (params.limit) searchParams.append('limit', params.limit)
        if (params.search) searchParams.append('search', params.search)
        
        return `/owners?${searchParams.toString()}`
      },
      providesTags: ['AllOwners'],
    }),

    getOwnerDetails: builder.query({
      query: (id) => `/owners/${id}`,
      providesTags: (result, error, id) => [{ type: 'OwnerDetails', id }],
    }),

    approveOwner: builder.mutation({
      query: ({ id, notes }) => ({
        url: `/owners/${id}/approve`,
        method: 'PATCH',
        body: { notes },
      }),
      invalidatesTags: ['PendingOwners', 'AllOwners', 'AdminStats'],
    }),

    rejectOwner: builder.mutation({
      query: ({ id, notes }) => ({
        url: `/owners/${id}/reject`,
        method: 'PATCH',
        body: { reason: notes },
      }),
      invalidatesTags: ['PendingOwners', 'AllOwners', 'AdminStats'],
    }),

    // User Management
    getAllUsers: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams()
        if (params.role) searchParams.append('role', params.role)
        if (params.status) searchParams.append('status', params.status)
        if (params.page) searchParams.append('page', params.page)
        if (params.limit) searchParams.append('limit', params.limit)
        if (params.search) searchParams.append('search', params.search)
        
        return `/users?${searchParams.toString()}`
      },
      providesTags: ['AllUsers'],
    }),

    toggleUserBan: builder.mutation({
      query: ({ id, action, reason }) => ({
        url: `/users/${id}/ban`,
        method: 'PATCH',
        body: { action, reason },
      }),
      invalidatesTags: ['AllUsers', 'AdminStats'],
    }),

    // Beauty Center Management
    getAllBeautyCenters: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams()
        if (params.status) searchParams.append('status', params.status)
        if (params.page) searchParams.append('page', params.page)
        if (params.limit) searchParams.append('limit', params.limit)
        if (params.search) searchParams.append('search', params.search)
        
        return `/beauty-centers?${searchParams.toString()}`
      },
      providesTags: ['BeautyCenters'],
    }),

    toggleBeautyCenterStatus: builder.mutation({
      query: ({ id, action, reason }) => ({
        url: `/beauty-centers/${id}/toggle-status`,
        method: 'PATCH',
        body: { action, reason },
      }),
      invalidatesTags: ['BeautyCenters', 'AdminStats'],
    }),
  }),
})

// Hook'ları export et
export const {
  useLoginAdminMutation,
  useGetAdminStatsQuery,
  useGetPendingOwnersQuery,
  useGetAllOwnersQuery,
  useGetOwnerDetailsQuery,
  useApproveOwnerMutation,
  useRejectOwnerMutation,
  useGetAllUsersQuery,
  useToggleUserBanMutation,
  useGetAllBeautyCentersQuery,
  useToggleBeautyCenterStatusMutation,
  useLogoutAdminMutation
} = adminApi

export default adminApi