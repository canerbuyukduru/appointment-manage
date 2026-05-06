import { z } from 'zod'

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

export const createStaffSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email().optional(),
    phone: z.string().max(20).optional(),
    specialization: z.string().max(200).optional(),
    bio: z.string().max(1000).optional(),
  }),
})

export const updateStaffSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    phone: z.string().max(20).optional(),
    specialization: z.string().max(200).optional(),
    bio: z.string().max(1000).optional(),
    isActive: z.boolean().optional(),
  }),
})

export const staffWorkingHoursSchema = z.object({
  body: z.object({
    hours: z
      .array(
        z.object({
          dayOfWeek: z.number().int().min(0).max(6),
          isAvailable: z.boolean(),
          startTime: z.string().regex(timeRegex, 'HH:MM formatında olmalı'),
          endTime: z.string().regex(timeRegex, 'HH:MM formatında olmalı'),
          breakStart: z.string().regex(timeRegex).optional(),
          breakEnd: z.string().regex(timeRegex).optional(),
        })
      )
      .min(1)
      .max(7),
  }),
})

export type CreateStaffDto = z.infer<typeof createStaffSchema>['body']
export type UpdateStaffDto = z.infer<typeof updateStaffSchema>['body']
export type StaffWorkingHoursDto = z.infer<typeof staffWorkingHoursSchema>['body']['hours'][number]
