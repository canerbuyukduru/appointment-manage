import { Router } from 'express'
import { validate } from '../middleware/validate'
import { categoryQuerySchema } from '../schemas/category.schema'
import * as categoryController from '../controllers/category.controller'

const router = Router()

router.get('/', validate(categoryQuerySchema), categoryController.getAll)
router.get('/:id', categoryController.getById)

export default router
