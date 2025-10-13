// lib/services/commentApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const commentApi = createApi({
  reducerPath: 'commentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/comments',
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

export const {
  useCreateCommentMutation,
  useGetCommentsByCenterQuery,
  useDeleteCommentMutation,
} = commentApi;

export default commentApi;