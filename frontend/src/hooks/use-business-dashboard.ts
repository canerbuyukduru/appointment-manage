'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Business, Service, Staff, Appointment, ApiResponse, PaginatedApiResponse } from '@/types'

export function useMyBusiness(businessId?: string) {
  return useQuery({
    queryKey: ['myBusiness', businessId],
    queryFn: () => api.get<never, ApiResponse<Business>>(`/businesses/${businessId}`),
    enabled: !!businessId,
    select: (res) => res.data,
  })
}

export function useUpdateBusiness(businessId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Business>) =>
      api.put<never, ApiResponse<Business>>(`/businesses/${businessId}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myBusiness', businessId] }),
  })
}

export function useUpdateBusinessHours(businessId: string) {
  return useMutation({
    mutationFn: (hours: unknown[]) =>
      api.put(`/businesses/${businessId}/hours`, { hours }),
  })
}

export function useBusinessServices(businessId?: string) {
  return useQuery({
    queryKey: ['businessServices', businessId],
    queryFn: () => api.get<never, ApiResponse<Service[]>>(`/businesses/${businessId}/services`),
    enabled: !!businessId,
    select: (res) => res.data,
  })
}

export function useCreateService(businessId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Service>) =>
      api.post<never, ApiResponse<Service>>(`/businesses/${businessId}/services`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['businessServices', businessId] }),
  })
}

export function useUpdateService(businessId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Service> & { id: string }) =>
      api.put<never, ApiResponse<Service>>(`/businesses/${businessId}/services/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['businessServices', businessId] }),
  })
}

export function useDeleteService(businessId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/businesses/${businessId}/services/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['businessServices', businessId] }),
  })
}

export function useBusinessStaff(businessId?: string) {
  return useQuery({
    queryKey: ['businessStaff', businessId],
    queryFn: () => api.get<never, ApiResponse<Staff[]>>(`/businesses/${businessId}/staff`),
    enabled: !!businessId,
    select: (res) => res.data,
  })
}

export function useCreateStaff(businessId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Staff>) =>
      api.post<never, ApiResponse<Staff>>(`/businesses/${businessId}/staff`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['businessStaff', businessId] }),
  })
}

export function useUpdateStaff(businessId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Staff> & { id: string }) =>
      api.put<never, ApiResponse<Staff>>(`/businesses/${businessId}/staff/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['businessStaff', businessId] }),
  })
}

export function useDeleteStaff(businessId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/businesses/${businessId}/staff/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['businessStaff', businessId] }),
  })
}

export function useUpdateStaffHours(businessId: string, staffId: string) {
  return useMutation({
    mutationFn: (hours: unknown[]) =>
      api.put(`/businesses/${businessId}/staff/${staffId}/hours`, { hours }),
  })
}

export function useBusinessAppointments(filters: { businessId?: string; status?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['businessAppointments', filters],
    queryFn: () =>
      api.get<never, PaginatedApiResponse<Appointment>>('/appointments', { params: filters }),
    enabled: !!filters.businessId,
    staleTime: 1000 * 30,
  })
}

export function useConfirmAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.put(`/appointments/${id}/confirm`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['businessAppointments'] }),
  })
}

export function useCompleteAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.put(`/appointments/${id}/complete`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['businessAppointments'] }),
  })
}

export function useCancelBusinessAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.put(`/appointments/${id}/cancel`, { reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['businessAppointments'] }),
  })
}

export function useMarkNoShow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.put(`/appointments/${id}/no-show`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['businessAppointments'] }),
  })
}
