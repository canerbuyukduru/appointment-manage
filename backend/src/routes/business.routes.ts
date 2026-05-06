import { Router } from 'express'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'
import { validate } from '../middleware/validate'
import { createBusinessSchema, updateBusinessSchema, businessHoursSchema, businessQuerySchema } from '../schemas/business.schema'
import { slotQuerySchema } from '../schemas/slot.schema'
import { createServiceSchema, updateServiceSchema, serviceStaffSchema } from '../schemas/service.schema'
import { createStaffSchema, updateStaffSchema, staffWorkingHoursSchema } from '../schemas/staff.schema'
import * as businessController from '../controllers/business.controller'
import * as serviceController from '../controllers/service.controller'
import * as staffController from '../controllers/staff.controller'

const router = Router()

// İşletme
router.get('/', validate(businessQuerySchema), businessController.getAll)
router.post('/', authenticate, authorize('business_owner'), validate(createBusinessSchema), businessController.create)
router.get('/:slug', businessController.getBySlug)
router.put('/:id', authenticate, authorize('business_owner', 'admin'), validate(updateBusinessSchema), businessController.update)
router.put('/:id/hours', authenticate, authorize('business_owner'), validate(businessHoursSchema), businessController.updateHours)
router.get('/:id/slots', validate(slotQuerySchema), businessController.getAvailableSlots)

// Hizmetler
router.get('/:businessId/services', serviceController.getByBusiness)
router.post('/:businessId/services', authenticate, authorize('business_owner'), validate(createServiceSchema), serviceController.create)
router.put('/:businessId/services/:serviceId', authenticate, authorize('business_owner'), validate(updateServiceSchema), serviceController.update)
router.delete('/:businessId/services/:serviceId', authenticate, authorize('business_owner'), serviceController.remove)
router.post('/:businessId/services/:serviceId/staff', authenticate, authorize('business_owner'), validate(serviceStaffSchema), serviceController.assignStaff)

// Personel
router.get('/:businessId/staff', staffController.getByBusiness)
router.post('/:businessId/staff', authenticate, authorize('business_owner'), validate(createStaffSchema), staffController.create)
router.put('/:businessId/staff/:staffId', authenticate, authorize('business_owner'), validate(updateStaffSchema), staffController.update)
router.delete('/:businessId/staff/:staffId', authenticate, authorize('business_owner'), staffController.remove)
router.put('/:businessId/staff/:staffId/hours', authenticate, authorize('business_owner'), validate(staffWorkingHoursSchema), staffController.updateWorkingHours)

export default router
