import { Request, Response } from 'express'

export function notFound(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `${req.method} ${req.path} bulunamadı` },
  })
}
