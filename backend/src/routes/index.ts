import { Router } from 'express'
import authRoutes from './auth.routes'
import categoryRoutes from './category.routes'
import businessRoutes from './business.routes'
import appointmentRoutes from './appointment.routes'
import paymentRoutes from './payment.routes'
import adminRoutes from './admin.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/categories', categoryRoutes)
router.use('/businesses', businessRoutes)
router.use('/appointments', appointmentRoutes)
router.use('/payments', paymentRoutes)
router.use('/admin', adminRoutes)

router.get('/', (_req, res) => {
  res.json({ success: true, message: 'Randevu API v1.0' })
})

export default router
