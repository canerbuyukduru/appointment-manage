import { Router } from 'express'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'
import { validate } from '../middleware/validate'
import { createPaymentIntentSchema, confirmPaymentSchema, refundSchema } from '../schemas/payment.schema'
import * as paymentController from '../controllers/payment.controller'

const router = Router()

router.post('/intent', authenticate, authorize('customer'), validate(createPaymentIntentSchema), paymentController.createIntent)
router.post('/confirm', authenticate, authorize('customer'), validate(confirmPaymentSchema), paymentController.confirm)
router.post('/refund', authenticate, validate(refundSchema), paymentController.refund)

export default router
