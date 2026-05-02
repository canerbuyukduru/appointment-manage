// lib/services/authApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Environment'dan URL'i al, yoksa fallback olarak localhost kullan
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // User Login
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: '/users/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    // User Register
    registerUser: builder.mutation({
      query: (userData) => ({
        url: '/users/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    // Owner Register
    registerOwner: builder.mutation({
      query: (ownerData) => ({
        url: '/owners/register',
        method: 'POST',
        body: ownerData,
      }),
      invalidatesTags: ['User'],
    }),

    // Owner Login
    loginOwner: builder.mutation({
      query: (credentials) => ({
        url: '/owners/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    // Get Current User
    getCurrentUser: builder.query({
      query: () => '/users/me',
      providesTags: ['User'],
    }),

    // Update User Profile
    updateUserProfile: builder.mutation({
      query: (userData) => ({
        url: '/users/profile',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    // Update Owner Profile
    updateOwnerProfile: builder.mutation({
      query: (ownerData) => ({
        url: '/owners/profile',
        method: 'PUT',
        body: ownerData,
      }),
      invalidatesTags: ['User'],
    }),

    // Logout
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
  useUpdateUserProfileMutation,
  useUpdateOwnerProfileMutation,
  useLogoutMutation,
} = authApi