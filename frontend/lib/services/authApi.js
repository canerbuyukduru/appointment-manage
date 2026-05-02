// lib/services/authApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// .env dosyasından URL'i al, yoksa fallback olarak localhost kullan
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL, // Artık dinamik! 
    credentials: 'include',
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: '/users/login', // Tam URL yazma, baseUrl ile birleşir 
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    // ... diğer endpoint'ler aynı kalabilir
  }),
})

export const {
  useLoginUserMutation,
  useRegisterUserMutation,
  useRegisterOwnerMutation,
  useLoginOwnerMutation,
  useGetCurrentUserQuery,
  useUpdateUserProfileMutation,
  useUpdateOwnerProfileMutation,
  useLogoutMutation,
} = authApi