'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Business, AdminStats, ApiResponse, PaginatedApiResponse } from '@/types'

export interface AdminBusinessFilters {
  status?: string
  page?: number
  limit?: number
  search?: string
}

export function useAdminBusinesses(filters: AdminBusinessFilters = {}) {
  return useQuery({
    queryKey: ['adminBusinesses', filters],
    queryFn: () =>
      api.get<never, PaginatedApiResponse<Business>>('/admin/businesses', { params: filters }),
    staleTime: 1000 * 30,
  })
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: () => api.get<never, ApiResponse<AdminStats>>('/admin/stats'),
    staleTime: 1000 * 60,
    select: (res) => res.data,
  })
}

export function useApproveBusiness() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.put(`/admin/businesses/${id}/approve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminBusinesses'] })
      qc.invalidateQueries({ queryKey: ['adminStats'] })
    },
  })
}

export function useRejectBusiness() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.put(`/admin/businesses/${id}/reject`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminBusinesses'] })
      qc.invalidateQueries({ queryKey: ['adminStats'] })
    },
  })
}

export function useSuspendBusiness() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.put(`/admin/businesses/${id}/suspend`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminBusinesses'] }),
  })
}
