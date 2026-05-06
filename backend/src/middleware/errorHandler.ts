import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../lib/errors'
import logger from '../lib/logger'

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    })
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Geçersiz veri',
        details: err.flatten().fieldErrors,
      },
    })
  }

  logger.error('Beklenmeyen hata:', err)
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Sunucu hatası' },
  })
}
