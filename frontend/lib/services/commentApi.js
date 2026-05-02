// lib/services/commentApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Environment'dan API URL'ini alıyoruz
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const commentApi = createApi({
  reducerPath: 'commentApi',
  baseQuery: fetchBaseQuery({
    // Base URL'i yorumlar için özelleştiriyoruz
    baseUrl: `${BASE_URL}/comments`,
    credentials: 'include',
  }),
  tagTypes: ['Comments'],
  endpoints: (builder) => ({
    // Yorum oluştur
    createComment: builder.mutation({
      query: (data) => ({
        url: '/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Comments'],
    }),

    // Merkeze ait yorumları getir
    getCommentsByCenter: builder.query({
      query: ({ beautyCenterId, page = 1, limit = 10 }) => 
        `/${beautyCenterId}?page=${page}&limit=${limit}`,
      providesTags: ['Comments'],
    }),

    // Yorumu sil
    deleteComment: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Comments'],
    }),
  }),
});

// Hook'ları export et
export const {
  useCreateCommentMutation,
  useGetCommentsByCenterQuery,
  useDeleteCommentMutation,
} = commentApi;

export default commentApi;