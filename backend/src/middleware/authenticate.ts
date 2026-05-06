import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UnauthorizedError } from '../lib/errors'

export interface JwtPayload {
  userId: string
  role: 'admin' | 'business_owner' | 'staff' | 'customer'
  businessId?: string
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.access_token || req.headers.authorization?.split(' ')[1]

  if (!token) throw new UnauthorizedError()

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    req.user = payload
    next()
  } catch {
    throw new UnauthorizedError('Geçersiz veya süresi dolmuş token')
  }
}
