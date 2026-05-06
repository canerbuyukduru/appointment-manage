import { Router } from 'express'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'
import { validate } from '../middleware/validate'
import { createAppointmentSchema, cancelAppointmentSchema, appointmentQuerySchema } from '../schemas/appointment.schema'
import * as appointmentController from '../controllers/appointment.controller'

const router = Router()

router.get('/', authenticate, validate(appointmentQuerySchema), appointmentController.getAll)
router.post('/', authenticate, authorize('customer'), validate(createAppointmentSchema), appointmentController.create)
router.get('/:id', authenticate, appointmentController.getById)
router.put('/:id/confirm', authenticate, authorize('business_owner'), appointmentController.confirm)
router.put('/:id/start', authenticate, authorize('business_owner', 'staff'), appointmentController.start)
router.put('/:id/complete', authenticate, authorize('business_owner', 'staff'), appointmentController.complete)
router.put('/:id/cancel', authenticate, validate(cancelAppointmentSchema), appointmentController.cancel)
router.put('/:id/no-show', authenticate, authorize('business_owner', 'staff'), appointmentController.markNoShow)

export default router
