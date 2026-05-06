import { Request, Response, NextFunction } from 'express'
import { categoryService } from '../services/category.service'
import type { CategoryQuery } from '../schemas/category.schema'

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await categoryService.getAll(req.query as CategoryQuery)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await categoryService.getById(req.params.id)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}
