import { Request, Response, NextFunction } from 'express'
import * as businessService from '../services/business.service'

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await businessService.create(req.body, req.user!.userId)
    res.status(201).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await businessService.getAll(req.query as Parameters<typeof businessService.getAll>[0])
    res.json({ success: true, data: data.items, meta: data.meta })
  } catch (err) {
    next(err)
  }
}

export async function getBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await businessService.getBySlug(req.params.slug)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await businessService.update(req.params.id, req.body, req.user!.userId, req.user!.role)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function updateHours(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await businessService.updateHours(req.params.id, req.body.hours, req.user!.userId)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function getAvailableSlots(req: Request, res: Response, next: NextFunction) {
  try {
    const { serviceId, date, staffId } = req.query as Record<string, string>
    const data = await businessService.getAvailableSlots(req.params.id, serviceId, date, staffId)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}
