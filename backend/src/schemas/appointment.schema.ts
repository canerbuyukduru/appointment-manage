import { z } from 'zod'

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

export const createAppointmentSchema = z.object({
  body: z.object({
    businessId: z.string().cuid(),
    serviceId: z.string().cuid(),
    staffId: z.string().cuid(),
    appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD formatında olmalı'),
    startTime: z.string().regex(timeRegex, 'HH:MM formatında olmalı'),
    customerNotes: z.string().max(500).optional(),
  }),
})

export const cancelAppointmentSchema = z.object({
  body: z.object({
    reason: z.string().max(500).optional(),
  }),
})

export const appointmentQuerySchema = z.object({
  query: z.object({
    status: z
      .enum(['pending', 'confirmed', 'started', 'completed', 'cancelled_by_customer', 'cancelled_by_business', 'no_show'])
      .optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
    businessId: z.string().cuid().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
  }),
})

export type CreateAppointmentDto = z.infer<typeof createAppointmentSchema>['body']
export type CancelAppointmentDto = z.infer<typeof cancelAppointmentSchema>['body']
export type AppointmentQuery = z.infer<typeof appointmentQuerySchema>['query']
