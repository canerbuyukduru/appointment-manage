import { z } from 'zod'

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

export const createBusinessSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    categoryId: z.string().cuid(),
    description: z.string().max(2000).optional(),
    address: z.string().max(300).optional(),
    city: z.string().max(100).optional(),
    phone: z.string().max(20).optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
  }),
})

export const updateBusinessSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    categoryId: z.string().cuid().optional(),
    description: z.string().max(2000).optional(),
    address: z.string().max(300).optional(),
    city: z.string().max(100).optional(),
    phone: z.string().max(20).optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
  }),
})

export const businessQuerySchema = z.object({
  query: z.object({
    categoryId: z.string().optional(),
    city: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
    status: z.enum(['pending', 'active', 'suspended', 'rejected']).optional(),
  }),
})

export const businessHoursSchema = z.object({
  body: z.object({
    hours: z
      .array(
        z.object({
          dayOfWeek: z.number().int().min(0).max(6),
          isOpen: z.boolean(),
          openTime: z.string().regex(timeRegex, 'HH:MM formatında olmalı'),
          closeTime: z.string().regex(timeRegex, 'HH:MM formatında olmalı'),
          breakStart: z.string().regex(timeRegex).optional(),
          breakEnd: z.string().regex(timeRegex).optional(),
        })
      )
      .min(1)
      .max(7),
  }),
})

export type CreateBusinessDto = z.infer<typeof createBusinessSchema>['body']
export type UpdateBusinessDto = z.infer<typeof updateBusinessSchema>['body']
export type BusinessQuery = z.infer<typeof businessQuerySchema>['query']
export type HoursDto = z.infer<typeof businessHoursSchema>['body']['hours'][number]
