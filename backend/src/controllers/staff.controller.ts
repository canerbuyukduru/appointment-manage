import { Request, Response, NextFunction } from 'express'
import * as staffService from '../services/staff.service'

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await staffService.create(req.params.businessId, req.body, req.user!.userId, req.user!.role)
    res.status(201).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await staffService.update(req.params.staffId, req.params.businessId, req.body, req.user!.userId, req.user!.role)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await staffService.remove(req.params.staffId, req.params.businessId, req.user!.userId, req.user!.role)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function updateWorkingHours(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await staffService.updateWorkingHours(req.params.staffId, req.params.businessId, req.body.hours, req.user!.userId, req.user!.role)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function getByBusiness(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await staffService.getByBusiness(req.params.businessId)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}
