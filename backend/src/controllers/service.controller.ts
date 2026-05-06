import { Request, Response, NextFunction } from 'express'
import * as serviceService from '../services/service.service'

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await serviceService.create(req.params.businessId, req.body, req.user!.userId, req.user!.role)
    res.status(201).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await serviceService.update(req.params.serviceId, req.params.businessId, req.body, req.user!.userId, req.user!.role)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await serviceService.remove(req.params.serviceId, req.params.businessId, req.user!.userId, req.user!.role)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function assignStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await serviceService.assignStaff(req.params.serviceId, req.params.businessId, req.body.staffIds, req.user!.userId, req.user!.role)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function getByBusiness(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await serviceService.getByBusiness(req.params.businessId)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}
