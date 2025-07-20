import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { apiSlice } from "./apiSlice";
import { USERS_URL } from "../constants";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/auth`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    registerUser: builder.mutation({
      query: (userData) => ({
        url: USERS_URL,
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),

    getUser: builder.query({
      query: () => `${USERS_URL}/current-user`,
      providesTags: ["User"],
    }),

    logout:builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

  }),
});
export const { useRegisterUserMutation, useLoginMutation, useGetUserQuery, useLogoutMutation } = userApi;
