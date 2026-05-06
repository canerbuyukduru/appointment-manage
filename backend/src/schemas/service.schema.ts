import { z } from 'zod'

export const createServiceSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(1000).optional(),
    duration: z.number().int().min(5).max(480),
    price: z.number().positive(),
    categoryId: z.string().cuid().optional(),
    image: z.string().url().optional(),
  }),
})

export const updateServiceSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(1000).optional(),
    duration: z.number().int().min(5).max(480).optional(),
    price: z.number().positive().optional(),
    categoryId: z.string().cuid().optional(),
    image: z.string().url().optional(),
    isActive: z.boolean().optional(),
  }),
})

export const serviceStaffSchema = z.object({
  body: z.object({
    staffIds: z.array(z.string().cuid()),
  }),
})

export type CreateServiceDto = z.infer<typeof createServiceSchema>['body']
export type UpdateServiceDto = z.infer<typeof updateServiceSchema>['body']
export type ServiceStaffDto = z.infer<typeof serviceStaffSchema>['body']
