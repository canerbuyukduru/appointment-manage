import { Router } from 'express'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'
import * as adminController from '../controllers/admin.controller'

const router = Router()

router.get('/businesses', authenticate, authorize('admin'), adminController.getBusinesses)
router.put('/businesses/:id/approve', authenticate, authorize('admin'), adminController.approveBusiness)
router.put('/businesses/:id/reject', authenticate, authorize('admin'), adminController.rejectBusiness)
router.put('/businesses/:id/suspend', authenticate, authorize('admin'), adminController.suspendBusiness)
router.get('/stats', authenticate, authorize('admin'), adminController.getStats)

export default router
