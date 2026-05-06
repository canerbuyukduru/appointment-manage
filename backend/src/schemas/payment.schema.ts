import { z } from 'zod'

export const createPaymentIntentSchema = z.object({
  body: z.object({
    appointmentId: z.string().cuid(),
  }),
})

export const confirmPaymentSchema = z.object({
  body: z.object({
    appointmentId: z.string().cuid(),
    paymentIntentId: z.string(),
  }),
})

export const refundSchema = z.object({
  body: z.object({
    appointmentId: z.string().cuid(),
    reason: z.string().max(500).optional(),
  }),
})

export type CreatePaymentIntentDto = z.infer<typeof createPaymentIntentSchema>['body']
export type ConfirmPaymentDto = z.infer<typeof confirmPaymentSchema>['body']
export type RefundDto = z.infer<typeof refundSchema>['body']
