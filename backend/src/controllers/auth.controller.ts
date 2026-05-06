import { Request, Response, NextFunction } from 'express'
import * as authService from '../services/auth.service'
import { UnauthorizedError } from '../lib/errors'

/**
 * POST /api/auth/register
 * Body: { email, password, firstName, lastName, phone? }
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user, accessToken } = await authService.register(req.body, res)
    res.status(201).json({ success: true, data: { user, accessToken } })
  } catch (err) {
    next(err)
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body
    const { user, accessToken } = await authService.login(email, password, res)
    res.status(200).json({ success: true, data: { user, accessToken } })
  } catch (err) {
    next(err)
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await authService.logout(req.user!.userId, res)
    res.status(200).json({ success: true, data: { message: 'Başarıyla çıkış yapıldı' } })
  } catch (err) {
    next(err)
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token: string | undefined = req.cookies?.refresh_token
    if (!token) throw new UnauthorizedError('Refresh token bulunamadı')

    let userId: string
    try {
      const jwt = await import('jsonwebtoken')
      const payload = jwt.default.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string }
      userId = payload.userId
    } catch {
      throw new UnauthorizedError('Geçersiz veya süresi dolmuş refresh token')
    }

    const { accessToken: newAccessToken } = await authService.refreshToken(token, userId, res)
    res.status(200).json({ success: true, data: { accessToken: newAccessToken } })
  } catch (err) {
    next(err)
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.getMe(req.user!.userId)
    res.status(200).json({ success: true, data: { user } })
  } catch (err) {
    next(err)
  }
}
