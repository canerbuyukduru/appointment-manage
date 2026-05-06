import { Request, Response, NextFunction } from 'express'
import { ForbiddenError, UnauthorizedError } from '../lib/errors'
import { JwtPayload } from './authenticate'

type Role = JwtPayload['role']

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new UnauthorizedError()
    if (!roles.includes(req.user.role)) throw new ForbiddenError()
    next()
  }
}
