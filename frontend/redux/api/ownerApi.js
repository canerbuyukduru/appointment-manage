import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { apiSlice } from "./apiSlice";
import { BASE_URL, USERS_URL } from "../constants";

export const ownerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerOwner: builder.mutation({
      query: (ownerData) => ({
        url: `${USERS_URL}/register-owner`,  // Bu kısım backend yapına göre sorun yoksa kalabilir
        method: "POST",
        body: ownerData,
      }),
      invalidatesTags: ["User", "BeautyCenter"],
    }),
    getMyBeautyCenter: builder.query({
      query: () => ({
        url: `/owners`,  // baseUrl zaten apiSlice'ta ayarlıysa sadece path yaz
        method: "GET",
      }),
      providesTags: ['BeautyCenter'],
    }),
  }),
});

export const {
  useRegisterOwnerMutation,
  useLazyGetMyBeautyCenterQuery,
} = ownerApi;
