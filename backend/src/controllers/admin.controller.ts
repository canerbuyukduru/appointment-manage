import { Request, Response, NextFunction } from 'express'
import * as adminService from '../services/admin.service'
import type { BusinessQuery } from '../schemas/business.schema'

export async function getBusinesses(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.getBusinesses(req.query as unknown as BusinessQuery)
    res.json({ success: true, data: result.items, meta: result.meta })
  } catch (err) {
    next(err)
  }
}

export async function approveBusiness(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.approveBusiness(req.params.id)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function rejectBusiness(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.rejectBusiness(req.params.id, req.body.reason)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function suspendBusiness(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.suspendBusiness(req.params.id)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getStats()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}
