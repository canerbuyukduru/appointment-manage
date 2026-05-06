'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Business, Category, Slot, ApiResponse, PaginatedApiResponse } from '@/types'

export interface BusinessFilters {
  categoryId?: string
  city?: string
  search?: string
  page?: number
  limit?: number
}

export function useBusinesses(filters: BusinessFilters = {}) {
  return useQuery({
    queryKey: ['businesses', filters],
    queryFn: () =>
      api.get<never, PaginatedApiResponse<Business>>('/businesses', { params: filters }),
    staleTime: 1000 * 60 * 2,
  })
}

export function useBusiness(slug: string) {
  return useQuery({
    queryKey: ['business', slug],
    queryFn: () => api.get<never, ApiResponse<Business>>(`/businesses/${slug}`),
    enabled: !!slug,
    staleTime: 1000 * 60 * 2,
    select: (res) => res.data,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<never, ApiResponse<Category[]>>('/categories'),
    staleTime: 1000 * 60 * 60,
    select: (res) => res.data,
  })
}

export interface SlotParams {
  businessId: string
  serviceId: string
  date: string
  staffId?: string
}

export function useAvailableSlots(params: Partial<SlotParams>) {
  return useQuery({
    queryKey: ['slots', params],
    queryFn: () =>
      api.get<never, ApiResponse<{ slots: Slot[] }>>(`/businesses/${params.businessId}/slots`, {
        params: { serviceId: params.serviceId, date: params.date, staffId: params.staffId },
      }),
    enabled: !!(params.businessId && params.serviceId && params.date),
    staleTime: 1000 * 30,
    select: (res) => res.data.slots,
  })
}
