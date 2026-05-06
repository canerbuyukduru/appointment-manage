import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { authenticate } from '../middleware/authenticate'
import { validate } from '../middleware/validate'
import { registerSchema, loginSchema, refreshTokenSchema } from '../schemas/auth.schema'
import * as authController from '../controllers/auth.controller'

const router = Router()

// Ekstra rate limit: login endpoint'i için 10 istek/dk/IP
const loginRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Çok fazla giriş denemesi. Lütfen 1 dakika bekleyin.',
    },
  },
})

// POST /api/auth/register
router.post(
  '/register',
  validate(registerSchema),
  authController.register,
)

// POST /api/auth/login
router.post(
  '/login',
  loginRateLimit,
  validate(loginSchema),
  authController.login,
)

// POST /api/auth/logout  (kimlik doğrulama gerekli)
router.post(
  '/logout',
  authenticate,
  authController.logout,
)

// POST /api/auth/refresh-token
router.post(
  '/refresh-token',
  validate(refreshTokenSchema),
  authController.refreshToken,
)

// GET /api/auth/me  (kimlik doğrulama gerekli)
router.get(
  '/me',
  authenticate,
  authController.getMe,
)

export default router
