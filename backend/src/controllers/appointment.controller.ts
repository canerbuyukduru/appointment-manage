import { Request, Response, NextFunction } from 'express'
import * as appointmentService from '../services/appointment.service'
import type { AppointmentQuery } from '../schemas/appointment.schema'

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await appointmentService.create(req.body, req.user!.userId)
    res.status(201).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await appointmentService.getAll(req.query as unknown as AppointmentQuery, req.user!.userId, req.user!.role)
    res.json({ success: true, data: result.items, meta: result.meta })
  } catch (err) {
    next(err)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await appointmentService.getById(req.params.id, req.user!.userId, req.user!.role)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function confirm(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await appointmentService.confirm(req.params.id, req.user!.userId)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function start(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await appointmentService.start(req.params.id, req.user!.userId, req.user!.role)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function complete(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await appointmentService.complete(req.params.id, req.user!.userId, req.user!.role)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function cancel(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await appointmentService.cancel(req.params.id, req.user!.userId, req.user!.role, req.body.reason)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function markNoShow(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await appointmentService.markNoShow(req.params.id, req.user!.userId)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}
