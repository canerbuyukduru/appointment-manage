import { z } from 'zod'

export const categoryQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    parentId: z.string().optional(),
  }),
})

export type CategoryQuery = z.infer<typeof categoryQuerySchema>['query']
