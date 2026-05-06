import { z } from 'zod'

export const slotQuerySchema = z.object({
  query: z.object({
    serviceId: z.string().cuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD formatında olmalı'),
    staffId: z.string().cuid().optional(),
  }),
})

export type SlotQuery = z.infer<typeof slotQuerySchema>['query']
