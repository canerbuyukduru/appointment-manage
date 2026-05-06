import { Request, Response, NextFunction } from 'express'
import * as paymentService from '../services/payment.service'

export async function createIntent(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await paymentService.createPaymentIntent(req.body.appointmentId, req.user!.userId)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function confirm(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await paymentService.confirmPayment(req.body.appointmentId, req.body.paymentIntentId, req.user!.userId)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function refund(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await paymentService.refund(req.body.appointmentId, req.user!.userId, req.user!.role, req.body.reason)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}
