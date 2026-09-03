import { Router } from 'express'
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expense.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect)

router
  .route('/')
  .get(authorize('admin', 'manager'), getExpenses)
  .post(authorize('admin', 'manager'), createExpense)

router
  .route('/:id')
  .put(authorize('admin', 'manager'), updateExpense)
  .delete(authorize('admin'), deleteExpense)

export default router
