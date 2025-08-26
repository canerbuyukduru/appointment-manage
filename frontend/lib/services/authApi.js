// lib/services/authApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    credentials: 'include', // Cookie'leri otomatik gönder
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // Kullanıcı giriş
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: '/users/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    // Kullanıcı kayıt
    registerUser: builder.mutation({
      query: (userData) => ({
        url: '/users/register',
        method: 'POST',
        body: userData,
      }),
    }),

    // Owner kayıt
    registerOwner: builder.mutation({
      query: (ownerData) => ({
        url: '/owners/register',
        method: 'POST',
        body: ownerData,
      }),
    }),

    // Owner giriş
    loginOwner: builder.mutation({
      query: (credentials) => ({
        url: '/owners/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    // Mevcut kullanıcı bilgisi - URL DÜZELTİLDİ!
    getCurrentUser: builder.query({
      query: () => '/users/profile', // ✅ /users/me yerine /users/profile
      providesTags: ['User'],
    }),

    // Çıkış
    logout: builder.mutation({
      query: () => ({
        url: '/users/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
  }),
})

export const {
  useLoginUserMutation,
  useRegisterUserMutation,
  useRegisterOwnerMutation,
  useLoginOwnerMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
} = authApi