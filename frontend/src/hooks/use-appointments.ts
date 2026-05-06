'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Appointment, Payment, ApiResponse, PaginatedApiResponse } from '@/types'

export interface AppointmentFilters {
  status?: string
  page?: number
  limit?: number
  fromDate?: string
  toDate?: string
}

export function useAppointments(filters: AppointmentFilters = {}) {
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: () =>
      api.get<never, PaginatedApiResponse<Appointment>>('/appointments', { params: filters }),
    staleTime: 1000 * 30,
  })
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: () => api.get<never, ApiResponse<Appointment>>(`/appointments/${id}`),
    enabled: !!id,
    select: (res) => res.data,
  })
}

export function useCreateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      businessId: string
      serviceId: string
      staffId: string
      appointmentDate: string
      startTime: string
      customerNotes?: string
    }) => api.post<never, ApiResponse<Appointment>>('/appointments', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}

export function useCancelAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.put<never, ApiResponse<Appointment>>(`/appointments/${id}/cancel`, { reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (appointmentId: string) =>
      api.post<never, ApiResponse<{ clientSecret: string; paymentIntentId: string }>>('/payments/intent', { appointmentId }),
    select: (res: ApiResponse<{ clientSecret: string; paymentIntentId: string }>) => res.data,
  })
}

export function useConfirmPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { appointmentId: string; paymentIntentId: string }) =>
      api.post<never, ApiResponse<Payment>>('/payments/confirm', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}
